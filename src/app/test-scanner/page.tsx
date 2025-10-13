"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, XCircle, CheckCircle, AlertCircle } from "lucide-react";

export default function TestScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
        console.log(message);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { });
                scannerRef.current = null;
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            setScanning(true);
            setError(null);
            setResult(null);
            addLog("Starting html5-qrcode scanner...");

            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E
                ],
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true,
                },
            }, false);

            scannerRef.current = scanner;

            try {
                scanner.render(
                    (decodedText) => {
                        addLog(`Scanned: ${decodedText}`);
                        setResult(decodedText);
                        stopScanning();
                    },
                    (error) => {
                        // Only log significant errors, not "no barcode detected"
                        if (!error.includes("No MultiFormat Readers")) {
                            addLog(`Scanner warning: ${error}`);
                        }
                    }
                );

                addLog("Scanner started successfully");

            } catch (renderError) {
                const errorMsg = renderError instanceof Error ? renderError.message : String(renderError);
                setError(`Failed to start scanner: ${errorMsg}`);
                addLog(`Failed to start scanner: ${errorMsg}`);
                setScanning(false);
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            setError(`Failed to start scanner: ${errorMsg}`);
            addLog(`Failed to start scanner: ${errorMsg}`);
            setScanning(false);
        }
    };

    const stopScanning = () => {
        try {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { });
                scannerRef.current = null;
                addLog("Scanner stopped");
            }
        } catch (err) {
            addLog(`Error stopping scanner: ${err}`);
        } finally {
            setScanning(false);
        }
    };

    const validateISBN = (isbn: string): boolean => {
        const clean = isbn.replace(/[-\s]/g, "");

        if (!/^\d{10}(\d{3})?$/.test(clean)) {
            return false;
        }

        if (clean.length === 10) {
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(clean[i]) * (10 - i);
            }
            const checksum = clean[9] === "X" ? 10 : parseInt(clean[9]);
            sum += checksum;
            return sum % 11 === 0;
        } else {
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
                        html5-qrcode Barcode Scanner Test
                    </h1>
                    <p className="text-gray-400">
                        Test html5-qrcode barcode scanning on mobile devices (iOS 15.1+)
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Controls</h2>
                    <button
                        onClick={scanning ? stopScanning : startScanning}
                        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${scanning
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        {scanning ? "Stop Scanner" : "Start Scanner"}
                    </button>
                </div>

                {/* Scanner Container */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Camera Feed</h2>
                    <div
                        id="reader"
                        className="w-full bg-black rounded-lg overflow-hidden"
                        style={{ maxHeight: '500px' }}
                    />
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
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                                <p className="text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Debug Logs */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
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
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Browser Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">Library:</span>
                            <p className="text-white">html5-qrcode v2.3.8 (ZXing-based)</p>
                        </div>
                        <div>
                            <span className="text-gray-400">HTTPS:</span>
                            <p className="text-white">
                                {typeof window !== "undefined" &&
                                    window.location.protocol === "https:"
                                    ? "Yes ✓"
                                    : "No (required for camera)"}
                            </p>
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
                        <div>
                            <span className="text-gray-400">iOS Version:</span>
                            <p className="text-white">
                                {typeof navigator !== "undefined" &&
                                    navigator.userAgent.includes("iPhone")
                                    ? "iOS 15.1+ required ✓"
                                    : "N/A (not iOS)"}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-400">User Agent:</span>
                            <p className="text-white text-xs break-all">
                                {typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}
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
                                Testing with html5-qrcode
                            </h3>
                            <ul className="text-blue-300 space-y-2 text-sm">
                                <li>• Click &quot;Start Scanner&quot; to begin</li>
                                <li>• Allow camera access when prompted</li>
                                <li>• Point camera at ISBN barcode</li>
                                <li>• Hold steady in center of frame</li>
                                <li>• Detection is automatic with visual feedback</li>
                                <li>• Optimized for EAN-13/ISBN-13 barcodes</li>
                                <li>• Also supports EAN-8, UPC-A, UPC-E</li>
                                <li>• <strong>iOS 15.1+ required</strong> for camera access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}