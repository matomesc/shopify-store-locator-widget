import { create } from 'zustand';

export interface AppStoreState {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  sessionId: null,
  setSessionId: (sessionId: string) => {
    set(() => {
      return {
        sessionId,
      };
    });
  },
}));
