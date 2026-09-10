"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: unknown) => void;
  fps?: number;
  qrbox?: number;
}

export function QRScanner({
  onScanSuccess,
  onScanFailure,
  fps = 10,
  qrbox = 250,
}: QRScannerProps) {
  const [isActive, setIsActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerId = "crm-qr-reader";

  useEffect(() => {
    if (isActive) {
      const scanner = new Html5QrcodeScanner(
        scannerContainerId,
        {
          fps,
          qrbox,
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) {
            onScanFailure(errorMessage);
          }
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.warn("Failed to clear html5-qrcode scanner", err);
        });
        scannerRef.current = null;
      }
    };
  }, [isActive, fps, qrbox, onScanSuccess, onScanFailure]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {!isActive ? (
        <Button
          onClick={() => setIsActive(true)}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Start Barcode / QR Scanner
        </Button>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <div
            id={scannerContainerId}
            className="w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm"
          />
          <Button
            variant="destructive"
            onClick={() => setIsActive(false)}
            className="flex items-center gap-2"
          >
            <StopCircle className="h-4 w-4" />
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  );
}
