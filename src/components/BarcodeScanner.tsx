"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (isbn: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onScan,
  onError,
  onClose,
}: BarcodeScannerProps) {
  const [initializing, setInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScanning();

    return () => {
      // Cleanup on unmount
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    try {
      console.log('Initializing ZXing scanner...');
      console.log('HTTPS:', window.location.protocol === 'https:');
      
      // Check for HTTPS
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS');
      }
      
      // Check MediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const codeReader = new BrowserMultiFormatReader();
      readerRef.current = codeReader;

      console.log('Requesting camera access...');

      // Start continuous scanning
      await codeReader.decodeFromVideoDevice(
        null, // Use default camera (back camera on mobile)
        videoRef.current!,
        (result, error) => {
          if (result) {
            // Successfully decoded
            console.log('Barcode detected:', result.getText());
            const barcode = result.getText();
            
            // Clean the barcode
            const cleaned = barcode.replace(/[-\s]/g, '');
            
            // Stop scanning and return result
            codeReader.reset();
            onScan(cleaned);
          }
          
          if (error && !(error instanceof NotFoundException)) {
            // Log non-"not found" errors (NotFoundException is normal during scanning)
            console.error('Scan error:', error);
          }
        }
      );

      console.log('Scanner started successfully');
      setInitializing(false);
      
    } catch (err) {
      console.error('Scanner initialization error:', err);
      
      let errorMsg = 'Failed to access camera. ';
      
      if (err instanceof Error) {
        const errLower = err.message.toLowerCase();
        
        if (errLower.includes('permission') || errLower.includes('denied')) {
          errorMsg = 'Camera permission denied. Please allow camera access and refresh.';
        } else if (errLower.includes('https') || errLower.includes('secure')) {
          errorMsg = 'Camera requires HTTPS. Please use the secure version of the site.';
        } else if (errLower.includes('not found') || errLower.includes('no devices')) {
          errorMsg = 'No cameras found on this device.';
        } else if (errLower.includes('in use')) {
          errorMsg = 'Camera is in use by another app. Please close other camera apps.';
        } else {
          errorMsg += err.message;
        }
      } else {
        errorMsg += String(err);
      }
      
      setErrorMessage(errorMsg);
      onError(errorMsg);
      setInitializing(false);
    }
  };

  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/90 border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Camera className="w-6 h-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Scan ISBN Barcode
                </h2>
                <p className="text-sm text-gray-400">
                  Point camera at barcode on book
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scanner Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {initializing && !errorMessage ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <p className="text-white text-lg">Initializing camera...</p>
                <p className="text-gray-400 text-sm">
                  Please allow camera access if prompted
                </p>
              </div>
            ) : errorMessage ? (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">
                      Camera Error
                    </h3>
                    <p className="text-red-300 mb-4">{errorMessage}</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Solutions:
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Grant camera permissions in browser settings</li>
                      <li>Ensure you&apos;re using HTTPS</li>
                      <li>Try Safari instead of Edge</li>
                      <li>Use manual ISBN entry instead</li>
                    </ul>
                    <button
                      onClick={handleClose}
                      className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Use Manual Entry
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl"
              style={{
                maxHeight: '70vh',
                display: (initializing || errorMessage) ? 'none' : 'block'
              }}
            />

            {/* Instructions */}
            {!initializing && !errorMessage && (
              <div className="mt-4 space-y-4">
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-blue-300 text-sm">
                        <strong>Tip:</strong> Hold the barcode in the center of the frame. 
                        Ensure good lighting and hold steady. Detection is automatic.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Cancel & Use Manual Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
