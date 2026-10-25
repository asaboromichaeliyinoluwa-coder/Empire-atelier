/**
 * The same app also builds as a hosted preview (VITE_TARGET=artifact) that runs with no server:
 * try-ons run on-device and files are saved through the host. The camera is not available there,
 * so photos are uploaded.
 */
export const IS_PREVIEW = import.meta.env.VITE_TARGET === 'artifact';

/** True inside the iOS / Android app built with Capacitor (see mobile/README in the repo). */
export const IS_NATIVE = Boolean((window as unknown as { Capacitor?: { isNativePlatform?(): boolean } }).Capacitor?.isNativePlatform?.());

/**
 * Where the API lives. Empty on the web (same server); the phone app's files are on the phone,
 * so it calls the hosted server set in VITE_API_BASE (.env.mobile).
 */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

type Host = { use(name: string): Promise<any> };
const host = (): Host | undefined => (window as unknown as { claude?: Host }).claude;

export async function capability<T = any>(name: string): Promise<T | null> {
  try {
    return (await host()?.use(name)) ?? null;
  } catch {
    return null;
  }
}

/** Saves a generated file: through the host in the preview, as a normal download otherwise. */
export async function saveFile(filename: string, blob: Blob) {
  if (IS_PREVIEW) {
    const downloads = await capability<{ save(r: { filename: string; data: Blob }): Promise<unknown> }>('downloads');
    if (!downloads) throw new Error('Saving files isn’t available in this view.');
    await downloads.save({ filename, data: blob });
    return;
  }
  if (IS_NATIVE) {
    // Web downloads don't work inside the phone app: write the file, then open the share sheet
    // (Save to Files / Photos, AirDrop, WhatsApp…).
    const [{ Directory, Filesystem }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    const { uri } = await Filesystem.writeFile({ path: filename, data, directory: Directory.Cache });
    await Share.share({ title: filename, files: [uri] });
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
}
