import { useEffect, useState } from 'react';

import { getStatus } from './api.ts';

type Status = { youcam: boolean; stylist: boolean; reachable: boolean };
let cached: Promise<Status> | undefined;

/** Whether the server has a YouCam key (preview mode otherwise). */
export function useServerStatus() {
  const [s, setS] = useState<Status | null>(null);
  useEffect(() => {
    cached ??= getStatus()
      .then((r) => ({ ...r, reachable: true }))
      .catch(() => ({ youcam: false, stylist: false, reachable: false }));
    cached.then(setS);
  }, []);
  return s;
}
