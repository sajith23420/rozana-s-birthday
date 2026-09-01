import { createContext, useContext } from 'react';

/* Context + consumer hook live apart from the provider component so
   the provider file exports a component and nothing else — which is
   what keeps Fast Refresh working during development. */
export const AudioCtx = createContext(null);

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
}
