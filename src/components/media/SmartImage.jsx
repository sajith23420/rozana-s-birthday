import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils.js';

/* ══════════════════════════════════════════════════════════════════
   Image primitive for the whole experience.

   • Reserves its aspect ratio before the file lands → zero layout shift
   • Lazy + async decode, with the first frame opted out via `priority`
   • Sits in a burgundy well, then fades and un-blurs on decode
   • `focus` maps to object-position, so a face survives any crop
   • Optional duotone wash keeps every photo inside the palette

   Consumers pass an entry from content/images.js. No component in
   this project ever hardcodes an image path.
   ══════════════════════════════════════════════════════════════════ */

function SmartImageBase({
  image,
  className = '',
  imgClassName = '',
  ratio,
  priority = false,
  tone = true,
  sizes = '(max-width: 768px) 88vw, 40vw',
}) {
  const [loaded, setLoaded] = useState(false);
  if (!image) return null;

  return (
    <div
      className={cn('relative overflow-hidden bg-wine-900', className)}
      style={{ aspectRatio: ratio ?? image.ratio ?? '3/4' }}
    >
      {/* Placeholder well — visible for the moment before decode */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 40% 30%, #2b0a14 0%, #0c0710 60%, #050308 100%)',
        }}
        aria-hidden="true"
      />

      <motion.img
        src={image.src}
        alt={image.alt ?? ''}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
        style={{ objectPosition: image.focus ?? 'center' }}
        initial={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
        animate={loaded
          ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Palette wash + inner vignette — binds any photo to the world */}
      {tone && (
        <>
          <div
            className="pointer-events-none absolute inset-0 mix-blend-color opacity-25"
            style={{ background: 'linear-gradient(150deg, #58152a, #07050d)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(5,3,8,0.75) 0%, transparent 45%), radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(5,3,8,0.6) 100%)',
            }}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

export const SmartImage = memo(SmartImageBase);
