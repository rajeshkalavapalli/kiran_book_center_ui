import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

// The shop's logo (public/logo.jpg, the round KBC Tirupati mark) with the name beside it.
export default function BrandMark({ light = false, to = "/" }) {
    const { brand } = useTheme();
    const ink = light ? brand.color.white : brand.color.ink;
    return (
        <Box component={RouterLink} to={to} aria-label="Kiran Book Center, Tirupati: home" sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, textDecoration: "none", color: ink, flexShrink: 0 }}>
            <Box
                component="img"
                src="/logo.jpg"
                alt=""
                width={44}
                height={44}
                sx={{ width: { xs: 38, md: 46 }, height: { xs: 38, md: 46 }, borderRadius: "50%", bgcolor: brand.color.white, boxShadow: light ? "0 0 0 2px rgba(255,255,255,0.15)" : `0 0 0 1px ${brand.color.line}` }}
            />
            <Box sx={{ lineHeight: 1 }}>
                <Box sx={{ fontFamily: brand.font.display, fontWeight: 700, fontSize: { xs: 15, md: 18 }, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>Kiran Book Center</Box>
                <Box sx={{ display: { xs: "none", sm: "block" }, fontSize: 10.5, fontWeight: 600, mt: 0.4, color: light ? "rgba(255,255,255,0.6)" : brand.color.inkMuted }}>Tirupati · Books, stationery, school supplies</Box>
            </Box>
        </Box>
    );
}
