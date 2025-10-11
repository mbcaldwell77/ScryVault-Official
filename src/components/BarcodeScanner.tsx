"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
    const [scanning, setScanning] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Get available cameras on mount
        initializeCameras();

        return () => {
            // Cleanup on unmount
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch((err) => console.error("Error stopping scanner:", err));
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const initializeCameras = async () => {
    try {
      console.log('Initializing cameras...');
      console.log('HTTPS:', window.location.protocol === 'https:');
      console.log('MediaDevices API:', !!navigator.mediaDevices);
      
      // Check for HTTPS first
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        const error = 'Camera access requires HTTPS. Please use https:// or localhost.';
        setErrorMessage(error);
        onError(error);
        setInitializing(false);
        return;
      }
      
      // Check if MediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = 'Camera API not supported in this browser. Try Chrome, Safari, or Edge.';
        setErrorMessage(error);
        onError(error);
        setInitializing(false);
        return;
      }
      
      // Try to request camera permission first (helps on some mobile browsers)
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            // Got permission, stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
            console.log('Camera permission granted');
          });
      } catch (permErr) {
        console.log('Permission request:', permErr);
        // Continue anyway - Html5Qrcode will handle it
      }
      
      const devices = await Html5Qrcode.getCameras();
      console.log('Cameras found:', devices.length);
      
      if (devices && devices.length > 0) {
                const cameraList = devices.map((device) => ({
                    id: device.id,
                    label: device.label || `Camera ${device.id}`,
                }));

                setCameras(cameraList);

                // Prefer back camera on mobile, otherwise use first camera
                const backCamera = cameraList.find((cam) =>
                    cam.label.toLowerCase().includes("back")
                );
                const defaultCamera = backCamera || cameraList[0];

                setSelectedCamera(defaultCamera.id);

                // Auto-start scanning with default camera
                await startScanning(defaultCamera.id);
            } else {
                const error = "No cameras found on this device";
                setErrorMessage(error);
                onError(error);
            }
    } catch (err) {
      console.error('Camera initialization error:', err);
      
      // Provide helpful error messages based on common issues
      let errorMsg = 'Failed to access cameras. ';
      
      if (err instanceof Error) {
        const errLower = err.message.toLowerCase();
        
        if (errLower.includes('permission') || errLower.includes('denied')) {
          errorMsg = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
        } else if (errLower.includes('https') || errLower.includes('secure')) {
          errorMsg = 'Camera requires HTTPS. Please use the secure version of the site.';
        } else if (errLower.includes('not found') || errLower.includes('no devices')) {
          errorMsg = 'No cameras found on this device.';
        } else if (errLower.includes('in use') || errLower.includes('already')) {
          errorMsg = 'Camera is already in use by another app or tab. Please close other camera apps and try again.';
        } else {
          errorMsg += err.message;
        }
      } else {
        errorMsg += String(err);
      }
      
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setInitializing(false);
    }
  };

    const startScanning = async (cameraId: string) => {
        try {
            setScanning(true);
            setErrorMessage(null);

            const scanner = new Html5Qrcode("barcode-scanner-container");
            scannerRef.current = scanner;

            await scanner.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        // Make scanning box responsive
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdge * 0.7);
                        return {
                            width: qrboxSize,
                            height: Math.floor(qrboxSize * 0.4), // Wider box for ISBN barcodes
                        };
                    },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Successfully scanned
                    console.log("Scanned barcode:", decodedText);

                    // Clean up the barcode (remove spaces, hyphens)
                    const cleanedText = decodedText.replace(/[-\s]/g, "");

                    // Pass to parent component
                    onScan(cleanedText);

                    // Stop scanning
                    stopScanning();
                },
                () => {
                    // This fires frequently while scanning, so we don't show it to the user
                }
            );
        } catch (err) {
            const error = `Failed to start scanner: ${err instanceof Error ? err.message : String(err)}`;
            setErrorMessage(error);
            onError(error);
            setScanning(false);
        }
    };

    const stopScanning = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop();
            }
        } catch (err) {
            console.error("Error stopping scanner:", err);
        } finally {
            setScanning(false);
            scannerRef.current = null;
        }
    };

    const handleCameraChange = async (cameraId: string) => {
        setSelectedCamera(cameraId);

        // Stop current scanner if running
        if (scannerRef.current) {
            await stopScanning();
        }

        // Start with new camera
        await startScanning(cameraId);
    };

    const handleClose = async () => {
        await stopScanning();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-gray-900/90 border-b border-gray-700/50 p-4">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div className="flex items-center space-x-3">
                            <Camera className="w-6 h-6 text-emerald-400" />
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Scan Barcode
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Point camera at ISBN barcode
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
                        {initializing ? (
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
                                            Possible solutions:
                                        </p>
                                        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                                            <li>Grant camera permissions in browser settings</li>
                                            <li>Ensure you&apos;re using HTTPS (required for camera access)</li>
                                            <li>Try a different browser or device</li>
                                            <li>Close this and use manual ISBN entry instead</li>
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
                        ) : (
                            <>
                                {/* Camera Feed */}
                                <div
                                    id="barcode-scanner-container"
                                    className="w-full bg-black rounded-xl overflow-hidden"
                                    style={{ minHeight: "400px" }}
                                />

                                {/* Controls */}
                                <div className="mt-4 space-y-4">
                                    {/* Camera Selection */}
                                    {cameras.length > 1 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Select Camera
                                            </label>
                                            <select
                                                value={selectedCamera}
                                                onChange={(e) => handleCameraChange(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                {cameras.map((camera) => (
                                                    <option key={camera.id} value={camera.id}>
                                                        {camera.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-blue-300 text-sm">
                                                    <strong>Tip:</strong> Hold the book steady and ensure good lighting.
                                                    The scanner will automatically detect the barcode.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Entry Fallback */}
                                    <button
                                        onClick={handleClose}
                                        className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                                    >
                                        Use Manual Entry Instead
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

