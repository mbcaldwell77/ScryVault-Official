"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Camera, AlertCircle, Edit3 } from 'lucide-react';
import type Quagga from '@ericblade/quagga2';
import type { QuaggaJSResultObject } from '@ericblade/quagga2';

interface BarcodeScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
  isOpen: boolean;
  onManualEntry?: () => void;
}

export default function BarcodeScanner({ onScan, onClose, isOpen, onManualEntry }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const quaggaRef = useRef<typeof Quagga | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noCameraAvailable, setNoCameraAvailable] = useState(false);
  const lastScannedRef = useRef<string | null>(null);

  // Memoize mobile detection to prevent unnecessary recalculations
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768 && window.innerHeight <= 1024)
    );
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      setError(null);
      setNoCameraAvailable(false);
      lastScannedRef.current = null;
      return;
    }

    let isComponentMounted = true;

    const initializeScanner = async () => {
      try {
        // Dynamically import Quagga2 to avoid SSR issues
        const Quagga = (await import('@ericblade/quagga2')).default;
        quaggaRef.current = Quagga;

        if (!scannerRef.current || !isComponentMounted) return;

        // Ensure camera access (prompts user if needed)
        const ensureCameraAccess = async (): Promise<boolean> => {
          if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setError('Camera API not supported in this browser.');
            setNoCameraAvailable(true);
            return false;
          }

          // Check if running on HTTPS (required for camera access in production)
          if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            setError('Camera access requires HTTPS. Please use a secure connection.');
            return false;
          }

          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
            // Immediately stop the preview permission stream; Quagga will open its own
            stream.getTracks().forEach((t) => t.stop());
            return true;
          } catch (e: unknown) {
            const err = e as { name?: string };
            switch (err?.name) {
              case 'NotAllowedError':
              case 'SecurityError':
                setError('Camera permission denied. Please allow camera access in your browser settings.');
                break;
              case 'NotFoundError':
                setError('No camera detected on this device.');
                setNoCameraAvailable(true);
                break;
              case 'NotReadableError':
                setError('Camera is in use by another application. Please close other apps using the camera.');
                break;
              case 'OverconstrainedError':
                // Try again with relaxed constraints
                try {
                  const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                  fallbackStream.getTracks().forEach((t) => t.stop());
                  return true;
                } catch {
                  setError('Camera doesn\'t meet minimum requirements.');
                  return false;
                }
              default:
                setError(`Camera error: ${err?.name || 'Unknown error'}. Please check your camera permissions.`);
            }
            return false;
          }
        };

        const hasAccess = await ensureCameraAccess();
        if (!hasAccess || !isComponentMounted) return;

        // Define handlers outside of Quagga callbacks for proper cleanup
        const handleDetected = (result: QuaggaJSResultObject) => {
          const code = result.codeResult?.code;

          if (!code) return;

          // Prevent duplicate scans
          if (code === lastScannedRef.current) return;

          lastScannedRef.current = code;

          // Clean up the scanned code (remove any non-numeric characters for ISBN)
          const cleanCode = code.replace(/[^0-9]/g, '');

          // More robust ISBN validation
          if (cleanCode.length === 10 || cleanCode.length === 13) {
            console.log('Detected ISBN:', cleanCode);
            onScan(cleanCode);
            if (quaggaRef.current) {
              quaggaRef.current.stop();
            }
          }
        };

        const handleProcessed = (result: QuaggaJSResultObject) => {
          if (!quaggaRef.current) return;

          const drawingCanvas = quaggaRef.current.canvas.dom.overlay;
          const ctx = drawingCanvas?.getContext('2d');
          if (!ctx || !drawingCanvas) return;

          if (result) {
            if (result.boxes) {
              ctx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width") || "0"), parseInt(drawingCanvas.getAttribute("height") || "0"));
              result.boxes.filter((box) => box !== result.box).forEach((box) => {
                if (box) {
                  quaggaRef.current?.ImageDebug.drawPath(box, { x: 0, y: 1 }, ctx, { color: "green", lineWidth: 2 });
                }
              });
            }

            if (result.box) {
              quaggaRef.current?.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 2 });
            }

            if (result.codeResult?.code && result.line) {
              quaggaRef.current?.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, ctx, { color: 'red', lineWidth: 3 });
            }
          }
        };

        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: { min: 640, ideal: isMobile ? 1280 : 1920, max: 1920 },
              height: { min: 480, ideal: isMobile ? 720 : 1080, max: 1080 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            },
          },
          locator: {
            patchSize: isMobile ? "medium" : "large",
            halfSample: isMobile ? true : false
          },
          numOfWorkers: isMobile ? 2 : (navigator.hardwareConcurrency || 4),
          frequency: isMobile ? 10 : 10,
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "upc_reader",
              "upc_e_reader"
            ]
          },
          locate: true
        }, (err: unknown) => {
          if (err) {
            console.error('Quagga initialization error:', err);
            setError('Failed to initialize camera scanner.');
            return;
          }
          if (!isComponentMounted) return;

          setIsInitialized(true);
          Quagga.onDetected(handleDetected);
          Quagga.onProcessed(handleProcessed);
          Quagga.start();
        });
      } catch (err) {
        console.error('Error loading Quagga2:', err);
        console.error('Error details:', err instanceof Error ? err.message : String(err));
        if (isComponentMounted) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(`Failed to load barcode scanner: ${errorMsg}. Please try refreshing the page.`);
        }
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (quaggaRef.current) {
        try {
          quaggaRef.current.stop();
          quaggaRef.current.offDetected();
          quaggaRef.current.offProcessed();
        } catch (err) {
          console.error('Error stopping Quagga:', err);
        }
      }
    };
  }, [isOpen, onScan, isMobile]);

  if (!isOpen) return null;

  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">Scan Barcode</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium mb-2">
                {noCameraAvailable ? 'No Camera Available' : 'Scanner Error'}
              </p>
              <p className="text-gray-300 text-sm mb-6">{error}</p>

              {noCameraAvailable ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm mb-4">
                    This device doesn&apos;t have a camera or it&apos;s not accessible.
                    You can still add books using manual entry.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleManualEntry}
                      className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Enter ISBN Manually
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleManualEntry}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Use Manual Entry
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="text-center">
                <p className="text-gray-300 mb-2">
                  Point your camera at a book barcode
                </p>
                <p className="text-gray-400 text-sm">
                  {isMobile
                    ? 'Position the barcode within the green frame'
                    : 'The scanner will automatically detect ISBN barcodes'}
                </p>
              </div>

              {/* Scanner Viewport */}
              <div className="relative">
                <div
                  ref={scannerRef}
                  className={`w-full ${isMobile ? 'h-[400px] sm:h-[500px]' : 'h-[480px]'} bg-black rounded-lg overflow-hidden`}
                />

                {/* Scanning Overlay */}
                {isInitialized && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-emerald-400 rounded-lg p-3">
                      <div className={`${isMobile ? 'w-56 h-32' : 'w-80 h-48'} border-2 border-emerald-400 rounded`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center">
                {isInitialized ? (
                  <div className="flex items-center justify-center space-x-2 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Scanning for barcodes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Initializing camera...</span>
                  </div>
                )}
              </div>

              {/* Manual Entry Fallback */}
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">
                  Having trouble with the scanner?
                </p>
                <button
                  onClick={handleManualEntry}
                  className="text-emerald-400 hover:text-emerald-300 text-sm underline inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  Enter ISBN manually instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
