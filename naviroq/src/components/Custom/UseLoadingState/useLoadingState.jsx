import { useState } from 'react';

function useLoadingState() {
    const [loadingStates, setLoadingStates] = useState({});

    const setLoading = (buttonId, isLoading) => {
        setLoadingStates((prev) => ({
            ...prev,
            [buttonId]: isLoading,
        }));
    };

    const isLoading = (buttonId) => !!loadingStates[buttonId];

    return { isLoading, setLoading };
}

export default useLoadingState;
