// useClientStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useDriverStore = create(
    persist(
        (set, get) => ({
            encryptedDriverData: null, // Stores Base64-encoded encrypted data

            setEncryptedDriverData: (data) => {
                set({ encryptedDriverData: data });
            },

            clearEncryptedDriveData: () => set({ encryptedDriverData: null }),

            getEncryptedDriverData: () => get().encryptedDriverData,
        }),
        {
            name: 'driver-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ encryptedDriverData: state.encryptedDriverData }),
        }
    )
);

export default useDriverStore;
