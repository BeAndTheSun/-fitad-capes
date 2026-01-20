import { toast } from '@meltstudio/theme';
import QRCodeLib from 'qrcode';
import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

export type QRCodeProps = {
  value: string;
  size?: number;
  style?: CSSProperties;
  className?: string;
  alt?: string;
};

export const QRCode: FC<QRCodeProps> = ({
  value,
  size = 256,
  style,
  className,
  alt = 'QR Code',
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setDataUrl(null);
      return;
    }

    const generate = async (): Promise<void> => {
      try {
        const url = await QRCodeLib.toDataURL(value, {
          width: size,
          margin: 0,
        });
        setDataUrl(url);
        setError(null);
      } catch (err) {
        setError('Failed to generate QR code');
        toast({
          title: 'Error',
          description: 'Failed to generate QR code',
          variant: 'destructive',
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    generate();
  }, [value, size]);

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!dataUrl) {
    // Return a placeholder of the correct size to prevent layout shift
    return (
      <div
        style={{ width: size, height: size, ...style }}
        className={className}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      style={style}
      className={className}
    />
  );
};
