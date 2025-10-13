"use client";

import { useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X } from "lucide-react";

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
    useEffect(() => {
        // Initialize scanner - let the library handle all checks and permissions
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

        scanner.render(
            (decodedText) => {
                console.log('Barcode detected:', decodedText);

                // Clean the barcode (remove dashes and spaces)
                const cleaned = decodedText.replace(/[-\s]/g, '');

                // Validate ISBN length (10 or 13 digits)
                if (cleaned.length === 10 || cleaned.length === 13) {
                    scanner.clear().catch(() => { });
                    onScan(cleaned);
                } else {
                    console.log('Invalid ISBN length:', cleaned.length);
                }
            },
            (error) => {
                // Only log significant errors, not routine scanning messages
                if (!error.includes("No MultiFormat Readers") &&
                    !error.includes("NotFoundException")) {
                    console.warn('Scanner error:', error);
                }
            }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [onScan, onError]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="bg-gray-900/90 border-b border-gray-700/50 p-4">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Scan ISBN Barcode
                            </h2>
                            <p className="text-sm text-gray-400">
                                Point camera at barcode on book
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Scanner Container - html5-qrcode will render its UI here */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <div id="reader" className="w-full max-w-2xl"></div>
                </div>
            </div>
        </div>
    );
}
