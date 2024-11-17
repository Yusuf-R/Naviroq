import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useLocationStore = create(
    persist(
        (set) => ({
            locationData: null, // Store address details to edit

            setLocationData: (data) => set({ locationData: data }),

            clearLocationData: () => set({ locationData: null })
        }),
        {
            name: 'location-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ locationData: state.locationData }),
        }
    )
);

export default useLocationStore;
