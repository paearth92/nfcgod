'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Keyboard,
  Loader2,
  ScanLine,
  X,
} from 'lucide-react';
import {
  formatCode,
  isValidCode,
  normalizeCode,
} from '@/lib/code-utils';

type DetectedBarcode = {
  rawValue: string;
};

type BarcodeDetectorInstance = {
  detect(
    source: HTMLVideoElement
  ): Promise<DetectedBarcode[]>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function codeFromScan(value: string): string | null {
  const rawValue = value.trim();

  if (!rawValue) {
    return null;
  }

  try {
    const scannedUrl = new URL(rawValue);

    const match = scannedUrl.pathname.match(
      /^\/(?:c|activate)\/([^/?#]+)/i
    );

    if (match?.[1]) {
      const code = normalizeCode(
        decodeURIComponent(match[1])
      );

      return isValidCode(code) ? code : null;
    }
  } catch {
    // The QR may contain only the activation code.
  }

  const code = normalizeCode(rawValue);

  return isValidCode(code) ? code : null;
}

export default function ActivateProductPage() {
  const router = useRouter();

  const videoRef =
    React.useRef<HTMLVideoElement>(null);

  const streamRef =
    React.useRef<MediaStream | null>(null);

  const frameRef =
    React.useRef<number | null>(null);

  const scanningRef = React.useRef(false);

  const [code, setCode] = React.useState('');
  const [error, setError] =
    React.useState<string | null>(null);

  const [scannerOpen, setScannerOpen] =
    React.useState(false);

  const [scannerStarting, setScannerStarting] =
    React.useState(false);

  const [scannerError, setScannerError] =
    React.useState<string | null>(null);

  const stopScanner = React.useCallback(() => {
    scanningRef.current = false;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScannerOpen(false);
    setScannerStarting(false);
  }, []);

  React.useEffect(() => {
    return stopScanner;
  }, [stopScanner]);

  const openActivation = React.useCallback(
    (rawCode: string) => {
      const normalized = codeFromScan(rawCode);

      if (!normalized) {
        setError(
          'Enter a valid 8-character NFCPlate code.'
        );
        return;
      }

      stopScanner();

      router.push(
        `/activate/${formatCode(normalized)}`
      );
    },
    [router, stopScanner]
  );

  async function startScanner() {
    setError(null);
    setScannerError(null);

    if (!window.isSecureContext) {
      setScannerError(
        'Camera scanning requires a secure HTTPS connection.'
      );
      setScannerOpen(true);
      return;
    }

    if (!window.BarcodeDetector) {
      setScannerError(
        'This browser does not support in-page QR scanning. Use your phone camera or enter the printed code.'
      );
      setScannerOpen(true);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError(
        'Camera access is not available in this browser.'
      );
      setScannerOpen(true);
      return;
    }

    setScannerOpen(true);
    setScannerStarting(true);

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error(
          'Camera preview could not be started.'
        );
      }

      video.srcObject = stream;
      await video.play();

      const detector =
        new window.BarcodeDetector({
          formats: ['qr_code'],
        });

      scanningRef.current = true;
      setScannerStarting(false);

      const scanFrame = async () => {
        if (
          !scanningRef.current ||
          !videoRef.current
        ) {
          return;
        }

        try {
          const results = await detector.detect(
            videoRef.current
          );

          const scannedValue =
            results[0]?.rawValue;

          if (scannedValue) {
            const normalized =
              codeFromScan(scannedValue);

            if (normalized) {
              setCode(formatCode(normalized));
              openActivation(normalized);
              return;
            }

            setScannerError(
              'That QR code is not an NFCPlate activation code.'
            );
          }
        } catch {
          // A camera frame can fail while focusing.
        }

        if (scanningRef.current) {
          frameRef.current =
            window.requestAnimationFrame(
              scanFrame
            );
        }
      };

      frameRef.current =
        window.requestAnimationFrame(scanFrame);
    } catch (cameraError) {
      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
      scanningRef.current = false;
      setScannerStarting(false);

      setScannerError(
        cameraError instanceof Error &&
          cameraError.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access or enter the printed code.'
          : 'The camera could not be opened. Use your phone camera or enter the printed code.'
      );
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);
    openActivation(code);
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-7">
        <p className="portal-kicker">
          Connect a new product
        </p>

        <h1 className="portal-title mt-1">
          Activate your NFCPlate
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Scan the QR code on your product or
          enter its printed code. You will then
          choose the review page or website that
          opens when customers tap or scan it.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="portal-panel overflow-hidden p-6 sm:p-8"
          aria-labelledby="enter-code-title"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4b942]/20 text-[#7a5000]">
            <Keyboard
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <h2
            id="enter-code-title"
            className="mt-5 font-display text-xl font-bold text-foreground"
          >
            Enter your product code
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Find the eight-character code printed
            on the product or its packaging.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <label
              htmlFor="activation-code"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Activation code
            </label>

            <input
              id="activation-code"
              name="activation-code"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              maxLength={9}
              value={code}
              onChange={(event) => {
                const nextValue =
                  event.target.value
                    .toUpperCase()
                    .replace(
                      /[^A-Z0-9-]/g,
                      ''
                    )
                    .slice(0, 9);

                setCode(nextValue);
                setError(null);
              }}
              placeholder="ABCD-EFGH"
              className="mt-2 h-14 w-full rounded-xl border border-border bg-white px-4 font-mono text-lg font-bold uppercase tracking-[0.15em] text-foreground shadow-sm placeholder:text-muted-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-invalid={
                error ? true : undefined
              }
              aria-describedby={
                error
                  ? 'activation-code-error'
                  : 'activation-code-help'
              }
            />

            {error ? (
              <p
                id="activation-code-error"
                className="mt-2 flex items-start gap-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />

                {error}
              </p>
            ) : (
              <p
                id="activation-code-help"
                className="mt-2 text-xs text-muted-foreground"
              >
                Codes use eight letters and
                numbers and do not contain 0, O,
                1, I, or L.
              </p>
            )}

            <button
              type="submit"
              className="btn-primary-np mt-5 w-full text-base"
            >
              Continue activation

              <ArrowRight
                className="ml-2 h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </form>
        </section>

        <section
          className="portal-panel overflow-hidden bg-[#171512] p-6 text-white sm:p-8"
          aria-labelledby="scan-code-title"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4b942] text-[#171512]">
            <ScanLine
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <h2
            id="scan-code-title"
            className="mt-5 font-display text-xl font-bold text-white"
          >
            Scan the product QR
          </h2>

          <p className="mt-1 text-sm leading-6 text-white/65">
            Use your phone camera here and point
            it at the QR code printed on your
            NFCPlate.
          </p>

          <button
            type="button"
            onClick={() => void startScanner()}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#f4b942] px-5 text-sm font-bold text-[#171512] transition hover:bg-[#ffd064] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Camera
              className="mr-2 h-5 w-5"
              aria-hidden="true"
            />

            Open QR scanner
          </button>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-white/65">
            <p className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#f4b942]"
                aria-hidden="true"
              />

              Scanning an unclaimed product opens
              its activation setup.
            </p>

            <p className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#f4b942]"
                aria-hidden="true"
              />

              Products already connected to you
              remain in My Codes.
            </p>
          </div>
        </section>
      </div>

      {scannerOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-dialog-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[#171512] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2
                  id="scanner-dialog-title"
                  className="font-display text-lg font-bold text-white"
                >
                  Scan NFCPlate QR
                </h2>

                <p className="text-xs text-white/60">
                  Hold the QR code inside the
                  frame.
                </p>
              </div>

              <button
                type="button"
                onClick={stopScanner}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/15"
                aria-label="Close scanner"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="relative aspect-square bg-black">
              <video
                ref={videoRef}
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              {!scannerError ? (
                <div className="pointer-events-none absolute inset-[14%] rounded-3xl border-2 border-[#f4b942] shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
              ) : null}

              {scannerStarting ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/65 text-sm font-semibold text-white">
                  <Loader2
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />

                  Starting camera…
                </div>
              ) : null}

              {scannerError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171512] p-7 text-center">
                  <AlertCircle
                    className="h-10 w-10 text-[#f4b942]"
                    aria-hidden="true"
                  />

                  <p className="mt-4 text-sm leading-6 text-white/75">
                    {scannerError}
                  </p>

                  <button
                    type="button"
                    onClick={stopScanner}
                    className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#171512]"
                  >
                    Enter code instead
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}