import { useEffect, useState } from "react";
import { decodeBillFromHash, type DecodeResult } from "../lib/share/link";

function readHash(): DecodeResult | null {
  return window.location.hash.startsWith("#b=") ? decodeBillFromHash(window.location.hash) : null;
}

/** Non-null when the URL carries a `#b=` shared-bill payload (valid or not). */
export function useHashRoute(): DecodeResult | null {
  const [decoded, setDecoded] = useState<DecodeResult | null>(readHash);

  useEffect(() => {
    function handler() {
      setDecoded(readHash());
    }
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return decoded;
}
