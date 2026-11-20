import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface MediaFrameProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  fallbackLabel?: string;
}

export function MediaFrame({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-[4/3]',
  fallbackLabel,
}: MediaFrameProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`${aspectClass} ${className} relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-500`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="h-6 w-6 text-zinc-600 mb-1.5" strokeWidth={1.5} />
        {fallbackLabel ? (
          <span className="px-3 text-center text-xs font-medium text-zinc-400 line-clamp-1">
            {fallbackLabel}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${aspectClass} ${className} relative overflow-hidden bg-zinc-900`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 ease-out"
      />
    </div>
  );
}
