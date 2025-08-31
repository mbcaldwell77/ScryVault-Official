"use client";

import { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import type { QuaggaResult, QuaggaProcessedResult } from 'quagga';

interface BarcodeScannerProps {
  onScan: (isbn: string) => void;
  onClose: () => void;
  isOpen: boolean;
}



export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const initializeScanner = async () => {
      try {
        // Dynamically import Quagga to avoid SSR issues
        const Quagga = (await import('quagga')).default;
        
        if (!scannerRef.current) return;

        // Ensure camera access (prompts user if needed)
        const ensureCameraAccess = async (): Promise<boolean> => {
          if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            setError('Camera not supported or HTTPS not enabled.');
            return false;
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'environment' } }
            });
            // Immediately stop the preview permission stream; Quagga will open its own
            stream.getTracks().forEach((t) => t.stop());
            return true;
          } catch (e: unknown) {
            const err = e as { name?: string };
            switch (err?.name) {
              case 'NotAllowedError':
              case 'SecurityError':
                setError('Camera permission denied. Enable camera access in your browser settings.');
                break;
              case 'NotFoundError':
                setError('No camera device found.');
                break;
              case 'NotReadableError':
                setError('Camera is in use by another application.');
                break;
              case 'OverconstrainedError':
                setError('Requested camera constraints are not available on this device.');
                break;
              default:
                setError('Failed to access camera. Please check permissions.');
            }
            return false;
          }
        };

        const hasAccess = await ensureCameraAccess();
        if (!hasAccess) return;

        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              width: { min: 480 },
              height: { min: 320 },
              facingMode: { ideal: "environment" }, // Prefer back camera on mobile
              aspectRatio: { min: 1, max: 2 }
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true
          },
          numOfWorkers: 2,
          frequency: 10,
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
            setError('Failed to initialize camera. Please check camera permissions.');
            return;
          }
          setIsInitialized(true);
          Quagga.start();
        });

                 Quagga.onDetected((result: QuaggaResult) => {
          const code = result.codeResult.code;
         
         // Prevent duplicate scans
         if (code === lastScanned) return;
         
         setLastScanned(code);
         
         // Clean up the scanned code (remove any non-numeric characters for ISBN)
         const cleanCode = code.replace(/[^0-9]/g, '');
         
         // Validate that it looks like an ISBN (10 or 13 digits)
         if (cleanCode.length === 10 || cleanCode.length === 13) {
           onScan(cleanCode);
           Quagga.stop();
         }
       });

                 Quagga.onProcessed((result: QuaggaProcessedResult) => {
          const drawingCanvas = Quagga.canvas.dom.overlay;
          const ctx = drawingCanvas.getContext('2d');
          if (!ctx) {
            return;
          }
          
          if (result) {
            if (result.boxes) {
              ctx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width") || "0"), parseInt(drawingCanvas.getAttribute("height") || "0"));
              result.boxes.filter((box: unknown) => box !== result.box).forEach((box: unknown) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, ctx, { color: "green", lineWidth: 2 });
              });
            }

            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, ctx, { color: 'red', lineWidth: 3 });
            }
          }
        });

       return () => {
         Quagga.stop();
       };
     } catch (err) {
       console.error('Error loading Quagga:', err);
       setError('Failed to load barcode scanner. Please try refreshing the page.');
     }
   };

   initializeScanner();
 }, [isOpen, onScan, lastScanned]);

 if (!isOpen) return null;

 return (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
     <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-gray-700">
         <div className="flex items-center space-x-3">
           <Camera className="w-5 h-5 text-emerald-400" />
           <h2 className="text-xl font-semibold text-white">Scan Barcode</h2>
         </div>
         <button
           onClick={onClose}
           className="text-gray-400 hover:text-white transition-colors"
         >
           <X className="w-6 h-6" />
         </button>
       </div>

       {/* Scanner Content */}
       <div className="p-4">
         {error ? (
           <div className="text-center py-8">
             <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
             <p className="text-red-400 font-medium mb-2">Scanner Error</p>
             <p className="text-gray-300 text-sm mb-4">{error}</p>
             <button
               onClick={onClose}
               className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
             >
               Close
             </button>
           </div>
         ) : (
           <div className="space-y-4">
             {/* Instructions */}
             <div className="text-center">
               <p className="text-gray-300 mb-2">
                 Point your camera at a book barcode
               </p>
               <p className="text-gray-400 text-sm">
                 The scanner will automatically detect ISBN barcodes
               </p>
             </div>

             {/* Scanner Viewport */}
             <div className="relative">
               <div 
                 ref={scannerRef}
                 className="w-full h-64 bg-black rounded-lg overflow-hidden"
               />
               
               {/* Scanning Overlay */}
               {isInitialized && (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="border-2 border-emerald-400 rounded-lg p-2">
                     <div className="w-48 h-32 border border-emerald-400 rounded"></div>
                   </div>
                 </div>
               )}
             </div>

             {/* Status */}
             <div className="text-center">
               {isInitialized ? (
                 <div className="flex items-center justify-center space-x-2 text-emerald-400">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                   <span className="text-sm">Scanning...</span>
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
                 onClick={onClose}
                 className="text-emerald-400 hover:text-emerald-300 text-sm underline"
               >
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
