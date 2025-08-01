import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pushNotificationService } from '@/services/pushNotificationService';

// Helper function to compare semantic versions
function isNewerVersion(newVersion: string, currentVersion: string): boolean {
  const parseVersion = (version: string) => {
    return version.split('.').map(num => parseInt(num, 10));
  };
  
  const newParts = parseVersion(newVersion);
  const currentParts = parseVersion(currentVersion);
  
  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    if (newPart > currentPart) return true;
    if (newPart < currentPart) return false;
  }
  
  return false;
}

export interface UpdateInfo {
  version: string;
  timestamp: string;
  changes: string[];
  downloadUrl: string;
  size: number;
  critical: boolean;
  rollout: {
    percentage: number;
    regions: string[];
  };
}

export interface UpdateProgress {
  phase: 'idle' | 'checking' | 'downloading' | 'installing' | 'complete' | 'error';
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  error?: string;
}

interface UpdateState {
  // Update info
  currentVersion: string;
  availableUpdate: UpdateInfo | null;
  updateHistory: UpdateInfo[];
  
  // Update progress
  updateProgress: UpdateProgress;
  
  // Settings
  autoUpdate: boolean;
  updateNotifications: boolean;
  wifiOnlyUpdates: boolean;
  
  // Actions
  checkForUpdates: () => Promise<void>;
  downloadUpdate: (updateInfo: UpdateInfo) => Promise<void>;
  installUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  setAutoUpdate: (enabled: boolean) => void;
  setUpdateNotifications: (enabled: boolean) => void;
  setWifiOnlyUpdates: (enabled: boolean) => void;
  
  // Internal actions
  setUpdateProgress: (progress: Partial<UpdateProgress>) => void;
  setAvailableUpdate: (update: UpdateInfo | null) => void;
  setCurrentVersion: (version: string) => void;
  addToHistory: (update: UpdateInfo) => void;
}

export const useUpdateStore = create<UpdateState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentVersion: '1.0.0',
      availableUpdate: null,
      updateHistory: [],
      updateProgress: {
        phase: 'idle',
        progress: 0,
        downloadedBytes: 0,
        totalBytes: 0,
        speed: 0,
        timeRemaining: 0,
      },
      autoUpdate: false,
      updateNotifications: true,
      wifiOnlyUpdates: true,

      // Actions
      checkForUpdates: async () => {
        const { setUpdateProgress, setAvailableUpdate, setCurrentVersion } = get();
        
        try {
          setUpdateProgress({ phase: 'checking', progress: 0 });
          
          // Get current version from deployed version.json
          let currentVersion = '1.0.0'; // fallback
          
          try {
            console.log('🔍 Fetching version from:', window.location.origin + '/version.json');
            const versionResponse = await fetch('/version.json?' + Date.now(), {
              cache: 'no-cache',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              }
            });
            
            console.log('📡 Version response status:', versionResponse.status);
            
            if (versionResponse.ok) {
              const versionData = await versionResponse.json();
              currentVersion = versionData.version;
              setCurrentVersion(currentVersion); // Update store
              console.log('📦 Current deployed version:', currentVersion);
            } else {
              console.log('❌ Version fetch failed:', versionResponse.status, versionResponse.statusText);
            }
          } catch (error) {
            console.log('⚠️ Could not get current version, using fallback:', currentVersion, error);
          }
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for updates from the manifest
          console.log('🔍 Fetching update manifest from:', window.location.origin + '/update-manifest.json');
          const response = await fetch('/update-manifest.json?' + Date.now(), {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          
          console.log('📡 Update manifest response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to check for updates: ${response.status} ${response.statusText}`);
          }
          
          const updateInfo: UpdateInfo = await response.json();
          
          // Compare versions properly
          console.log('🔍 Version check:', { 
            current: currentVersion, 
            available: updateInfo.version,
            isNewer: isNewerVersion(updateInfo.version, currentVersion)
          });
          
          if (isNewerVersion(updateInfo.version, currentVersion)) {
            setAvailableUpdate(updateInfo);
            setUpdateProgress({ phase: 'idle', progress: 100 });
            
            // Show notification using the new service
            if (get().updateNotifications) {
              await pushNotificationService.sendUpdateNotification(
                updateInfo.version, 
                updateInfo.changes
              );
            }
          } else {
            setAvailableUpdate(null);
            setUpdateProgress({ phase: 'idle', progress: 100 });
          }
          
        } catch (error) {
          console.error('Error checking for updates:', error);
          setUpdateProgress({ 
            phase: 'error', 
            progress: 0, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      },

      downloadUpdate: async (updateInfo: UpdateInfo) => {
        const { setUpdateProgress, wifiOnlyUpdates } = get();
        
        try {
          // Check network conditions
          if (wifiOnlyUpdates && 'connection' in navigator) {
            const connection = (navigator as any).connection;
            if (connection && connection.type !== 'wifi') {
              throw new Error('WiFi connection required for updates');
            }
          }
          
          setUpdateProgress({ 
            phase: 'downloading', 
            progress: 0, 
            totalBytes: updateInfo.size,
            downloadedBytes: 0 
          });
          
          // Simulate download with progress
          const totalSize = updateInfo.size;
          let downloadedSize = 0;
          const chunkSize = totalSize / 100; // 1% chunks
          const startTime = Date.now();
          
          for (let i = 0; i <= 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            
            downloadedSize = Math.min(totalSize, downloadedSize + chunkSize);
            const progress = (downloadedSize / totalSize) * 100;
            const elapsed = (Date.now() - startTime) / 1000;
            const speed = downloadedSize / elapsed;
            const timeRemaining = (totalSize - downloadedSize) / speed;
            
            setUpdateProgress({
              progress,
              downloadedBytes: downloadedSize,
              speed,
              timeRemaining: isFinite(timeRemaining) ? timeRemaining : 0
            });
          }
          
          // Download complete, ready to install
          setUpdateProgress({ 
            phase: 'installing', 
            progress: 0 
          });
          
          // Auto-install after download
          await get().installUpdate();
          
        } catch (error) {
          console.error('Error downloading update:', error);
          setUpdateProgress({ 
            phase: 'error', 
            progress: 0, 
            error: error instanceof Error ? error.message : 'Download failed' 
          });
        }
      },

      installUpdate: async () => {
        const { setUpdateProgress, availableUpdate, addToHistory } = get();
        
        if (!availableUpdate) return;
        
        try {
          setUpdateProgress({ phase: 'installing', progress: 0 });
          
          // Simulate installation process
          for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            setUpdateProgress({ progress: i });
          }
          
          // Update completed
          set({ currentVersion: availableUpdate.version });
          addToHistory(availableUpdate);
          
          setUpdateProgress({ 
            phase: 'complete', 
            progress: 100 
          });
          
          // Show success notification
          await pushNotificationService.showNotification('✅ Update Complete', {
            body: `ProgressPulse has been updated to version ${availableUpdate.version}`,
            icon: '/icons/icon-192x192.png',
            tag: 'update-complete',
            requireInteraction: false
          });
          
          // Clear available update
          set({ availableUpdate: null });
          
          // Reload the app after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
        } catch (error) {
          console.error('Error installing update:', error);
          setUpdateProgress({ 
            phase: 'error', 
            progress: 0, 
            error: error instanceof Error ? error.message : 'Installation failed' 
          });
        }
      },

      dismissUpdate: () => {
        set({ availableUpdate: null });
      },

      setAutoUpdate: (enabled: boolean) => {
        set({ autoUpdate: enabled });
      },

      setUpdateNotifications: (enabled: boolean) => {
        set({ updateNotifications: enabled });
      },

      setWifiOnlyUpdates: (enabled: boolean) => {
        set({ wifiOnlyUpdates: enabled });
      },

      // Internal actions
      setUpdateProgress: (progress: Partial<UpdateProgress>) => {
        set(state => ({
          updateProgress: { ...state.updateProgress, ...progress }
        }));
      },

      setAvailableUpdate: (update: UpdateInfo | null) => {
        set({ availableUpdate: update });
      },

      setCurrentVersion: (version: string) => {
        set({ currentVersion: version });
      },

      addToHistory: (update: UpdateInfo) => {
        set(state => ({
          updateHistory: [update, ...state.updateHistory].slice(0, 10) // Keep last 10 updates
        }));
      },
    }),
    {
      name: 'update-store',
      partialize: (state) => ({
        currentVersion: state.currentVersion,
        updateHistory: state.updateHistory,
        autoUpdate: state.autoUpdate,
        updateNotifications: state.updateNotifications,
        wifiOnlyUpdates: state.wifiOnlyUpdates,
      }),
    }
  )
);