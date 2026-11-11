import { Box, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

// Page-width wrapper with the site's side gutters.
export function Shell({ children, sx, component = "div" }) {
    const { brand } = useTheme();
    return (
        <Box component={component} sx={{ maxWidth: brand.layout.maxWidth, mx: "auto", px: brand.layout.gutter, width: "100%", ...sx }}>
            {children}
        </Box>
    );
}

// Section title with an optional small label above and a supporting line below.
export function SectionHeading({ kicker, title, subtitle, action, sx }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: { xs: 2.5, md: 3.5 }, ...sx }}>
            <Box sx={{ minWidth: 0 }}>
                {kicker && (
                    <Typography variant="overline" sx={{ color: brand.color.accent, display: "block", mb: 0.5 }}>
                        {kicker}
                    </Typography>
                )}
                <Typography variant="h2">{title}</Typography>
                {subtitle && <Typography sx={{ color: brand.color.inkMuted, mt: 0.75 }}>{subtitle}</Typography>}
            </Box>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
    );
}

export function QtyStepper({ value, onChange, max, size = "md", label = "Quantity" }) {
    const { brand } = useTheme();
    const h = size === "sm" ? 34 : 46;
    return (
        <Box role="group" aria-label={label} sx={{ display: "inline-flex", alignItems: "center", border: `1px solid ${brand.color.lineStrong}`, borderRadius: `${brand.radius.sm}px`, bgcolor: brand.color.card, height: h }}>
            <IconButton size="small" aria-label="Decrease quantity" disabled={value <= 1} onClick={() => onChange(value - 1)} sx={{ height: h - 2, width: h - 2 }}>
                <RemoveRoundedIcon fontSize="small" />
            </IconButton>
            <Box component="output" aria-live="polite" sx={{ minWidth: 28, textAlign: "center", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {value}
            </Box>
            <IconButton size="small" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} sx={{ height: h - 2, width: h - 2 }}>
                <AddRoundedIcon fontSize="small" />
            </IconButton>
        </Box>
    );
}

// Responsive product grid: 2 columns on phones up to 5 on wide screens.
export function ProductGrid({ children, dense = false }) {
    return (
        <Box
            sx={{
                display: "grid",
                gap: { xs: "12px", sm: "18px" },
                gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    md: dense ? "repeat(3, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                    lg: dense ? "repeat(4, minmax(0, 1fr))" : "repeat(5, minmax(0, 1fr))",
                },
            }}
        >
            {children}
        </Box>
    );
}

// Kept for older imports: renders nothing in the modern design.
export function Perforation() {
    return null;
}
