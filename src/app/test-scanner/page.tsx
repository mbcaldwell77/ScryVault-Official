"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, XCircle, CheckCircle, AlertCircle } from "lucide-react";

export default function TestScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<string>("");
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
        console.log(message);
    };

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length > 0) {
                    const cameraList = devices.map((device) => ({
                        id: device.id,
                        label: device.label || `Camera ${device.id}`,
                    }));
                    setCameras(cameraList);
                    setSelectedCamera(cameraList[0].id);
                    addLog(`Found ${devices.length} camera(s)`);
                } else {
                    setError("No cameras found");
                    addLog("No cameras found");
                }
            })
            .catch((err) => {
                setError(`Error getting cameras: ${err}`);
                addLog(`Error getting cameras: ${err}`);
            });

        return () => {
            // Cleanup on unmount
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch((err) => console.error("Error stopping scanner:", err));
            }
        };
    }, []);

    const startScanning = async () => {
        if (!selectedCamera) {
            setError("No camera selected");
            return;
        }

        try {
            setScanning(true);
            setError(null);
            setResult(null);
            addLog("Starting scanner...");

            const scanner = new Html5Qrcode("scanner-container");
            scannerRef.current = scanner;

            await scanner.start(
                selectedCamera,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    addLog(`Scanned: ${decodedText}`);
                    setResult(decodedText);

                    // Auto-stop after successful scan
                    stopScanning();
                },
                () => {
                    // This fires frequently while scanning, so we don't log it
                }
            );

            addLog("Scanner started successfully");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(`Failed to start scanner: ${errorMsg}`);
            addLog(`Failed to start scanner: ${errorMsg}`);
            setScanning(false);
        }
    };

    const stopScanning = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop();
                addLog("Scanner stopped");
            }
        } catch (err) {
            addLog(`Error stopping scanner: ${err}`);
        } finally {
            setScanning(false);
            scannerRef.current = null;
        }
    };

    const validateISBN = (isbn: string): boolean => {
        // Remove hyphens and spaces
        const clean = isbn.replace(/[-\s]/g, "");

        // Check if it's 10 or 13 digits
        if (!/^\d{10}(\d{3})?$/.test(clean)) {
            return false;
        }

        if (clean.length === 10) {
            // ISBN-10 validation
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(clean[i]) * (10 - i);
            }
            const checksum = clean[9] === "X" ? 10 : parseInt(clean[9]);
            sum += checksum;
            return sum % 11 === 0;
        } else {
            // ISBN-13 validation
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
            }
            const checksum = (10 - (sum % 10)) % 10;
            return checksum === parseInt(clean[12]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Barcode Scanner Test
                    </h1>
                    <p className="text-gray-400">
                        Test barcode scanning functionality and camera compatibility
                    </p>
                </div>

                {/* Camera Selection */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Camera Selection
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedCamera}
                            onChange={(e) => setSelectedCamera(e.target.value)}
                            disabled={scanning}
                            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                            {cameras.map((camera) => (
                                <option key={camera.id} value={camera.id}>
                                    {camera.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={scanning ? stopScanning : startScanning}
                            disabled={!selectedCamera}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${scanning
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                }`}
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            {scanning ? "Stop Scanner" : "Start Scanner"}
                        </button>
                    </div>
                </div>

                {/* Scanner Container */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Scanner View
                    </h2>
                    <div
                        id="scanner-container"
                        ref={scannerContainerRef}
                        className="w-full bg-black rounded-lg overflow-hidden"
                        style={{ minHeight: scanning ? "300px" : "100px" }}
                    >
                        {!scanning && (
                            <div className="flex items-center justify-center h-full py-12">
                                <p className="text-gray-400">Scanner inactive</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Display */}
                {result && (
                    <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-xl p-6 mb-6">
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                                    Scan Successful!
                                </h3>
                                <p className="text-white font-mono text-lg mb-2">{result}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                    <span
                                        className={`${validateISBN(result)
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {validateISBN(result) ? "✓ Valid ISBN" : "✗ Invalid ISBN"}
                                    </span>
                                    <span className="text-gray-400">
                                        Length: {result.replace(/[-\s]/g, "").length} digits
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 mb-6">
                        <div className="flex items-start space-x-3">
                            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">
                                    Error
                                </h3>
                                <p className="text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Debug Logs */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Debug Logs</h2>
                    <div className="bg-black rounded-lg p-4 max-h-64 overflow-y-auto">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 text-sm">No logs yet...</p>
                        ) : (
                            <div className="space-y-1">
                                {logs.map((log, index) => (
                                    <p key={index} className="text-gray-300 text-sm font-mono">
                                        {log}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Browser Info */}
                <div className="mt-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Browser Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">User Agent:</span>
                            <p className="text-white break-all">
                                {typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">HTTPS:</span>
                            <p className="text-white">
                                {typeof window !== "undefined" &&
                                    window.location.protocol === "https:"
                                    ? "Yes ✓"
                                    : "No (required for camera access)"}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-400">Cameras Found:</span>
                            <p className="text-white">{cameras.length}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Media Devices API:</span>
                            <p className="text-white">
                                {typeof navigator !== "undefined" &&
                                    navigator.mediaDevices !== undefined
                                    ? "Supported ✓"
                                    : "Not Supported"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-900/20 border border-blue-500/50 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                Testing Instructions
                            </h3>
                            <ul className="text-blue-300 space-y-2 text-sm">
                                <li>• Select a camera from the dropdown</li>
                                <li>• Click &quot;Start Scanner&quot; to begin</li>
                                <li>• Point camera at an ISBN barcode (on book or screen)</li>
                                <li>• Scanner will automatically detect and display the code</li>
                                <li>• Check debug logs for detailed information</li>
                                <li>• Test on both desktop and mobile browsers</li>
                                <li>• Ensure you&apos;re using HTTPS for camera access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

