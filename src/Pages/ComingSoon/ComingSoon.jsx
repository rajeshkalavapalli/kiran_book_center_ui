import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

import { Shell } from "../../components/Common/Common";

// Placeholder for pages planned in later steps (checkout, account, requests, policies...).
export default function ComingSoon({ title, note }) {
    const { brand } = useTheme();
    return (
        <Shell sx={{ py: { xs: 8, md: 12 } }}>
            <Box sx={{ maxWidth: 560, mx: "auto", textAlign: "center", p: { xs: 4, md: 6 }, bgcolor: brand.color.card, border: `1px dashed ${brand.color.lineStrong}`, borderRadius: `${brand.radius.md}px` }}>
                <Typography variant="overline" sx={{ color: brand.color.accent }}>Coming next</Typography>
                <Typography variant="h2" sx={{ mt: 1.5 }}>{title}</Typography>
                <Typography sx={{ color: brand.color.inkMuted, mt: 1.5 }}>{note || "This page is part of the next build step."}</Typography>
                <Button component={RouterLink} to="/" variant="outlined" sx={{ mt: 3 }}>Back to the shop</Button>
            </Box>
        </Shell>
    );
}
