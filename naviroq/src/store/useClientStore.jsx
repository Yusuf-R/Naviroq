// useClientStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useClientStore = create(
    persist(
        (set, get) => ({
            encryptedClientData: null, // Stores Base64-encoded encrypted data

            setEncryptedClientData: (data) => {
                set({ encryptedClientData: data });
            },

            clearEncryptedClientData: () => set({ encryptedClientData: null }),

            getEncryptedClientData: () => get().encryptedClientData,
        }),
        {
            name: 'client-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedClientData: state.encryptedClientData }),
        }
    )
);

export default useClientStore;
