import { create } from 'zustand';
import { AppState } from '@/types';

interface AppStore extends AppState {
  setOnlineStatus: (isOnline: boolean) => void;
  setInstallStatus: (isInstalled: boolean) => void;
  setUpdateAvailable: (available: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isOnline: navigator.onLine,
  isInstalled: false,
  updateAvailable: false,
  syncInProgress: false,

  setOnlineStatus: (isOnline) => set({ isOnline }),
  setInstallStatus: (isInstalled) => set({ isInstalled }),
  setUpdateAvailable: (available) => set({ updateAvailable: available }),
  setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),
}));