import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from '@meltstudio/theme';
import { Check, Copy, QrCode } from 'lucide-react';
import { Trans } from 'next-i18next';
import QRCode from 'qrcode';
import type { ReactNode } from 'react';
import { isValidElement, useCallback, useEffect, useState } from 'react';

export type QrModalProps = {
  /**
   * The URL to generate the QR code from.
   * If not provided, generateUrl will be called when modal opens.
   */
  url?: string | null | undefined;
  /**
   * Function to generate the URL. Called when modal opens if url is not available.
   * Should return a Promise that resolves to the URL string or null/undefined.
   */
  generateUrl?: () => Promise<string | null | undefined>;
  /**
   * Title of the modal
   */
  title: string | ReactNode;
  /**
   * Description of the modal
   */
  description?: string | ReactNode;
  /**
   * Label for the URL input field
   */
  urlLabel?: string | ReactNode;
  /**
   * Custom trigger button. If not provided, a default button will be used
   */
  trigger?: ReactNode;
  /**
   * Custom actions to display below the QR code
   */
  actions?: ReactNode;
  /**
   * Alt text for the QR code image
   */
  qrCodeAlt?: string;
  /**
   * Callback when copy button is clicked
   */
  onCopy?: (url: string) => void | Promise<void>;
  /**
   * Whether the modal is controlled externally
   */
  open?: boolean;
  /**
   * Callback when modal open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Filename for downloading the QR code image
   */
  downloadFileName?: string;
};

/**
 * Generic QR Modal component that displays a QR code for a given URL
 * Can be used for any QR code generation use case
 */
export const QrModal: React.FC<QrModalProps> = ({
  url: urlProp,
  generateUrl,
  title,
  description,
  urlLabel = 'Link',
  trigger,
  actions,
  qrCodeAlt = 'QR Code',
  onCopy,
  open: controlledOpen,
  onOpenChange,
  downloadFileName,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [url, setUrl] = useState<string | null | undefined>(urlProp);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | ReactNode | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (isControlled) {
        onOpenChange?.(newOpen);
      } else {
        setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  // Update url when urlProp changes (prioritize prop over generated URL)
  useEffect(() => {
    if (urlProp !== undefined) {
      setUrl(urlProp);
    }
  }, [urlProp]);

  // Generate URL when modal opens if not available
  useEffect(() => {
    if (!open) {
      return;
    }

    // If URL is already available (from prop or previous generation), skip
    if (url) {
      return;
    }

    // If already loading, skip to avoid duplicate requests
    if (isLoading) {
      return;
    }

    // If no generateUrl function, nothing to do
    if (!generateUrl) {
      return;
    }

    // Generate URL
    const fetchUrl = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const generatedUrl = await generateUrl();
        // Only set if urlProp hasn't been set in the meantime
        setUrl((currentUrl) => currentUrl || generatedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate URL');
      } finally {
        setIsLoading(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchUrl();
    // Only depend on open and generateUrl, not url, to avoid re-running when url changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, generateUrl]);

  // Generate QR code when URL is available
  useEffect(() => {
    if (!open || !url) {
      setQrCodeDataUrl(null);
      return;
    }

    const generateQR = async (): Promise<void> => {
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (err) {
        toast({
          title: 'Failed to generate QR code',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    generateQR();
  }, [open, url]);

  const handleCopyLink = useCallback(async () => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onCopy) {
        await onCopy(url);
      }
    } catch (err) {
      toast({
        title: 'Failed to copy link',
        description: 'Please try copying the link manually.',
        variant: 'destructive',
      });
    }
  }, [url, onCopy]);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <QrCode className="mr-2 size-4" /> {title}
    </Button>
  );

  const handleDownloadQrCode = (): void => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${downloadFileName || 'qr-code'}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger &&
        // If a React element is provided, use it directly as the single child.
        // Otherwise wrap the provided content in a Button so DialogTrigger
        // receives a single element child.
        (isValidElement(trigger) ? (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <QrCode className="mr-2 size-4" /> {trigger}
            </Button>
          </DialogTrigger>
        ))}
      {!trigger && <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {isLoading && !url && (
            <div className="flex h-[300px] items-center justify-center">
              Loading...
            </div>
          )}

          {error && <div className="text-destructive">{error}</div>}

          {url && (
            <>
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={qrCodeAlt}
                  className="rounded-lg border"
                />
              ) : (
                <div className="flex size-[300px] items-center justify-center rounded-lg border">
                  {isLoading ? 'Generating QR code...' : 'Loading QR code...'}
                </div>
              )}

              <div className="flex w-full flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {urlLabel}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={url}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    title={copied ? 'Copied!' : 'Copy link'}
                  >
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {actions && <div className="w-full">{actions}</div>}
              {qrCodeDataUrl && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleDownloadQrCode}
                >
                  <Trans>Download QR Code</Trans>
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
