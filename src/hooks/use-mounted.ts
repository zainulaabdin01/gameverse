import { useEffect, useState } from "react";

/** Returns true after the component has mounted on the client.
 *  Use to gate time-sensitive renders (timeAgo, timeUntil, Date.now)
 *  that would otherwise cause SSR/CSR hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
