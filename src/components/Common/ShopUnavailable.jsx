import { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

// Shown when the shop server can't be reached as the site opens.
export default function ShopUnavailable({ onRetry }) {
    const { brand } = useTheme();
    const [busy, setBusy] = useState(false);
    const retry = async () => {
        setBusy(true);
        await onRetry();
        setBusy(false);
    };
    return (
        <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", px: 3, bgcolor: brand.color.bg }}>
            <Box sx={{ maxWidth: 440, textAlign: "center" }}>
                <Box component="img" src="/logo.jpg" alt="Kiran Book Center" sx={{ width: 72, height: 72, borderRadius: "50%", mx: "auto", boxShadow: `0 0 0 1px ${brand.color.line}` }} />
                <Typography variant="h2" component="h1" sx={{ mt: 3 }}>The shop is taking a short break.</Typography>
                <Typography sx={{ mt: 1.5, color: brand.color.inkMuted }}>We can't reach the shop server right now. Please try again in a moment, or call the store.</Typography>
                <Button variant="contained" onClick={retry} disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />} sx={{ mt: 3 }}>
                    Try again
                </Button>
            </Box>
        </Box>
    );
}
