import { Button, CircularProgress } from '@mui/material';

function LoadingButton({ buttonId, onClick, isLoading, children, ...props }) {
    return (
        <Button
            {...props}
            onClick={() => onClick(buttonId)}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
            {children}
        </Button>
    );
}

export default LoadingButton;
