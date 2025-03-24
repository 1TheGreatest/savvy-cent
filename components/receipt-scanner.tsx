"use client";
import useFetch from "@/hooks/use-fetch";
import { geminiScanReceipt } from "@/lib/actions/transaction.actions";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ReceiptScanner = ({ onScanComplete }: ReceiptScannerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Invoking the server actions
  const {
    data: scannedData,
    loading: scanReceiptLoading,
    error,
    fn: scanReceiptFn,
  } = useFetch(geminiScanReceipt);

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  useEffect(() => {
    if (error) {
      toast.error("Error scanning receipt");
    }
  }, [error]);

  const handleReceiptScan = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    await scanReceiptFn(file);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-primary via-green-500 to-secondary animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ReceiptScanner;
