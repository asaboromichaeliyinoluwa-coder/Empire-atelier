/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TARGET?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_MEDIAPIPE_BASE?: string;
  readonly VITE_MEDIAPIPE_MODEL_EXT?: string;
}
