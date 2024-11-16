import { create } from "zustand";

const useClientRideStore = create((set) => ({
    ride: null, // Default ride state
    setRide: (ride) => set({ ride }),
    clearRide: () => set({ ride: null }), // Clear ride data
}));

export default useClientRideStore;
