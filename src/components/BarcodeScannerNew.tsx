"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, AlertCircle, Edit3, RotateCcw } from 'lucide-react';

interface BarcodeScannerProps {
    onScan: (isbn: string) => void;
    onClose: () => void;
    isOpen: boolean;
    onManualEntry?: () => void;
}

export default function BarcodeScanner({ onScan, onClose, isOpen, onManualEntry }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanningRef = useRef<boolean>(false);
    const animationFrameRef = useRef<number | null>(null);

    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detectedCode, setDetectedCode] = useState<string>('');
    const [useBarcodeDetector, setUseBarcodeDetector] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string[]>([]);

    const addDebug = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugInfo(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
        console.log('📱', message);
    };

    // Check if BarcodeDetector is available
    useEffect(() => {
        if ('BarcodeDetector' in window) {
            addDebug('✅ BarcodeDetector API available');
            setUseBarcodeDetector(true);
        } else {
            addDebug('⚠️ BarcodeDetector not available, will use Quagga2');
            setUseBarcodeDetector(false);
        }
    }, []);

    // Initialize camera and scanner
    useEffect(() => {
        if (!isOpen) {
            cleanup();
            return;
        }

        let isMounted = true;

        const initScanner = async () => {
            try {
                addDebug('🎥 Requesting camera access...');

                // Request camera access with optimal settings for barcode scanning
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        // @ts-expect-error - focusMode is not in TS types but works on some devices
                        focusMode: 'continuous'
                    }
                });

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    addDebug('✅ Camera started');
                    setIsInitialized(true);

                    // Start scanning
                    if (useBarcodeDetector) {
                        startBarcodeDetectorScanning();
                    } else {
                        startQuaggaScanning();
                    }
                }
            } catch (err) {
                if (!isMounted) return;

                console.error('Camera error:', err);
                const error = err as { name?: string; message?: string };

                switch (error?.name) {
                    case 'NotAllowedError':
                        setError('Camera permission denied. Please allow camera access in your browser settings.');
                        break;
                    case 'NotFoundError':
                        setError('No camera found on this device.');
                        break;
                    case 'NotReadableError':
                        setError('Camera is in use by another application.');
                        break;
                    default:
                        setError(`Camera error: ${error?.message || 'Unknown error'}`);
                }
                addDebug(`❌ Camera error: ${error?.name}`);
            }
        };

        initScanner();

        return () => {
            isMounted = false;
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, useBarcodeDetector]);

    const startBarcodeDetectorScanning = useCallback(async () => {
        if (!videoRef.current || scanningRef.current) return;

        try {
            // @ts-expect-error - BarcodeDetector is not yet in TypeScript types
            const barcodeDetector = new window.BarcodeDetector({
                formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']
            });

            scanningRef.current = true;
            addDebug('🔍 Starting BarcodeDetector scanning...');

            const scan = async () => {
                if (!videoRef.current || !scanningRef.current) return;

                try {
                    const barcodes = await barcodeDetector.detect(videoRef.current);

                    if (barcodes.length > 0) {
                        const code = barcodes[0].rawValue;
                        addDebug(`📷 Detected: ${code} (${barcodes[0].format})`);
                        handleBarcodeDetected(code);
                        return; // Stop scanning after detection
                    }
                } catch (err) {
                    console.error('Detection error:', err);
                }

                if (scanningRef.current) {
                    animationFrameRef.current = requestAnimationFrame(scan);
                }
            };

            scan();
        } catch (err) {
            console.error('BarcodeDetector init error:', err);
            addDebug('❌ BarcodeDetector failed, falling back to Quagga2');
            startQuaggaScanning();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startQuaggaScanning = useCallback(async () => {
        if (!videoRef.current || scanningRef.current) return;

        try {
            const Quagga = (await import('@ericblade/quagga2')).default;
            addDebug('🔍 Starting Quagga2 scanning...');

            scanningRef.current = true;

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: videoRef.current,
                    constraints: {
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                        facingMode: "environment"
                    }
                },
                decoder: {
                    readers: [
                        "ean_reader",
                        "ean_8_reader",
                        "code_128_reader",
                        "upc_reader",
                        "upc_e_reader"
                    ]
                },
                locate: true,
                frequency: 10
            }, (err) => {
                if (err) {
                    console.error('Quagga init error:', err);
                    setError('Failed to initialize scanner.');
                    addDebug(`❌ Quagga init failed: ${err}`);
                    return;
                }

                Quagga.onDetected((result) => {
                    const code = result.codeResult?.code;
                    if (code) {
                        addDebug(`📷 Quagga detected: ${code}`);
                        handleBarcodeDetected(code);
                    }
                });

                Quagga.start();
            });
        } catch (err) {
            console.error('Quagga error:', err);
            setError('Failed to load barcode scanner library.');
            addDebug(`❌ Quagga load failed`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBarcodeDetected = useCallback((code: string) => {
        // Clean the code (remove non-numeric characters)
        let cleanCode = code.replace(/[^0-9]/g, '');

        // Convert UPC-E (8 digits) to UPC-A (12 digits)
        if (cleanCode.length === 8) {
            cleanCode = '0000' + cleanCode;
        }

        // Validate length (10, 12, or 13 digits for ISBN/UPC)
        if (cleanCode.length === 10 || cleanCode.length === 12 || cleanCode.length === 13) {
            addDebug(`✅ Valid code: ${cleanCode}`);
            setDetectedCode(cleanCode);
            pauseScanning();
        } else {
            addDebug(`❌ Invalid length: ${cleanCode.length}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pauseScanning = useCallback(() => {
        scanningRef.current = false;
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, []);

    const resumeScanning = useCallback(() => {
        setDetectedCode('');
        if (useBarcodeDetector) {
            startBarcodeDetectorScanning();
        } else {
            // Quagga restarts automatically if already initialized
            scanningRef.current = true;
        }
    }, [useBarcodeDetector, startBarcodeDetectorScanning]);

    const handleUseCode = () => {
        if (detectedCode) {
            onScan(detectedCode);
            cleanup();
        }
    };

    const cleanup = () => {
        scanningRef.current = false;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsInitialized(false);
        setDetectedCode('');
        setError(null);
        setDebugInfo([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-3xl w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <Camera className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-semibold text-white">Scan Barcode</h2>
                        {useBarcodeDetector && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                                Native API
                            </span>
                        )}
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
                <div className="p-6">
                    {error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <p className="text-red-400 font-medium mb-2">Scanner Error</p>
                            <p className="text-gray-300 text-sm mb-6">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {onManualEntry && (
                                    <button
                                        onClick={onManualEntry}
                                        className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Use Manual Entry
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Instructions */}
                            <div className="text-center space-y-2 mb-4">
                                <p className="text-gray-300 font-medium">
                                    Position the barcode in the scan window
                                </p>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p>📱 Hold steady • 💡 Good lighting • 📏 4-6 inches away</p>
                                </div>
                            </div>

                            {/* Scanner Viewport with Cinematic Overlay */}
                            <div className="scanner-container mx-auto">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="scanner-video"
                                />

                                {isInitialized && !detectedCode && (
                                    <div className="scanner-overlay">
                                        <div className="overlay-dim top"></div>
                                        <div className="scan-window">
                                            <div className="scan-line"></div>
                                            {/* Corner markers */}
                                            <div className="corner-marker top-left"></div>
                                            <div className="corner-marker top-right"></div>
                                            <div className="corner-marker bottom-left"></div>
                                            <div className="corner-marker bottom-right"></div>
                                        </div>
                                        <div className="overlay-dim bottom"></div>
                                    </div>
                                )}

                                {detectedCode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                        <div className="bg-gray-800 p-6 rounded-lg border border-emerald-500 shadow-lg shadow-emerald-500/50">
                                            <p className="text-emerald-400 text-sm mb-2 text-center">Code Detected!</p>
                                            <p className="text-white text-2xl font-mono mb-4 text-center">{detectedCode}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleUseCode}
                                                    className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-cyan-700 transition-all"
                                                >
                                                    Use This Code
                                                </button>
                                                <button
                                                    onClick={resumeScanning}
                                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Rescan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="text-center">
                                {isInitialized && !detectedCode ? (
                                    <div className="flex items-center justify-center space-x-2 text-emerald-400">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm">Scanning for barcodes...</span>
                                    </div>
                                ) : !isInitialized && !error ? (
                                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm">Initializing camera...</span>
                                    </div>
                                ) : null}
                            </div>

                            {/* Debug Info (for development) */}
                            {debugInfo.length > 0 && process.env.NODE_ENV === 'development' && (
                                <div className="bg-gray-900/90 rounded-lg p-3 border border-gray-600 text-xs">
                                    <p className="text-gray-400 mb-1 font-semibold">Debug Log:</p>
                                    <div className="space-y-1 font-mono">
                                        {debugInfo.map((info, i) => (
                                            <p key={i} className="text-gray-300">{info}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manual Entry Fallback */}
                            {onManualEntry && (
                                <div className="text-center pt-4 border-t border-gray-700">
                                    <p className="text-gray-400 text-sm mb-2">
                                        Having trouble with the scanner?
                                    </p>
                                    <button
                                        onClick={onManualEntry}
                                        className="text-emerald-400 hover:text-emerald-300 text-sm underline inline-flex items-center gap-1"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        Enter ISBN manually instead
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Styles */}
                <style jsx>{`
          .scanner-container {
            position: relative;
            width: 100%;
            max-width: 500px;
            aspect-ratio: 16 / 9;
            border-radius: 12px;
            overflow: hidden;
            background: #000;
            box-shadow: 0 0 20px rgba(0,0,0,0.6);
          }

          .scanner-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: contrast(1.2) brightness(1.1);
            transform: scaleX(-1);
          }

          .scanner-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
          }

          .overlay-dim {
            background: rgba(0, 0, 0, 0.65);
            width: 100%;
          }

          .overlay-dim.top,
          .overlay-dim.bottom {
            height: 35%;
          }

          .scan-window {
            position: relative;
            height: 30%;
            width: 70%;
            margin: 0 auto;
            border: 2px solid rgba(16, 185, 129, 0.7);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
            overflow: hidden;
          }

          .scan-line {
            position: absolute;
            top: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #ef4444, transparent);
            animation: scan 2s linear infinite;
            box-shadow: 0 0 10px #ef4444;
          }

          @keyframes scan {
            0% {
              top: 0;
              opacity: 0.7;
            }
            50% {
              top: calc(100% - 2px);
              opacity: 1;
            }
            100% {
              top: 0;
              opacity: 0.7;
            }
          }

          .corner-marker {
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(16, 185, 129, 0.9);
          }

          .corner-marker.top-left {
            top: -2px;
            left: -2px;
            border-right: none;
            border-bottom: none;
          }

          .corner-marker.top-right {
            top: -2px;
            right: -2px;
            border-left: none;
            border-bottom: none;
          }

          .corner-marker.bottom-left {
            bottom: -2px;
            left: -2px;
            border-right: none;
            border-top: none;
          }

          .corner-marker.bottom-right {
            bottom: -2px;
            right: -2px;
            border-left: none;
            border-top: none;
          }

          @media (max-width: 640px) {
            .scanner-container {
              max-width: 90vw;
            }
          }
        `}</style>
            </div>
        </div>
    );
}
