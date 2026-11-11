import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { rupees, savingPercent } from "../../configurations/format";

// The shop's pricing rule, shown clearly:
//   DISCOUNT → price, struck-out MRP and an emerald "15% off" label
//   NET      → price with a neutral "Net price" label (no discount)

export function NetBadge({ size = "sm" }) {
    const { brand } = useTheme();
    const big = size === "lg";
    return (
        <Box
            component="span"
            title="Sold at the printed price. No discount applies."
            sx={{ display: "inline-flex", alignItems: "center", px: big ? 1.1 : 0.8, height: big ? 26 : 20, borderRadius: `${brand.radius.pill}px`, border: `1px solid ${brand.color.lineStrong}`, color: brand.color.inkSoft, fontSize: big ? 12.5 : 11, fontWeight: 700, whiteSpace: "nowrap", bgcolor: brand.color.card }}
        >
            Net price
        </Box>
    );
}

export function OffBadge({ percent, size = "sm" }) {
    const { brand } = useTheme();
    const big = size === "lg";
    return (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", px: big ? 1.1 : 0.8, height: big ? 26 : 20, borderRadius: `${brand.radius.pill}px`, bgcolor: brand.color.accentMist, color: brand.color.accentDark, fontSize: big ? 12.5 : 11, fontWeight: 800, whiteSpace: "nowrap" }}>
            {percent}% off
        </Box>
    );
}

export default function PriceTag({ product, size = "sm" }) {
    const { brand } = useTheme();
    const big = size === "lg";
    const percent = savingPercent(product);
    const isNet = product.PricingMode === "NET";

    return (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: big ? 1.25 : 0.75, rowGap: 0.5 }}>
            <Typography component="span" sx={{ fontFamily: brand.font.display, fontWeight: 600, fontSize: big ? 30 : 16, color: brand.color.ink, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {rupees(product.SellingPrice)}
            </Typography>
            {isNet ? (
                <NetBadge size={size} />
            ) : (
                percent > 0 && (
                    <>
                        <Typography component="span" sx={{ fontSize: big ? 15 : 12.5, color: brand.color.inkFaint, textDecoration: "line-through" }}>
                            {rupees(product.Mrp)}
                        </Typography>
                        <OffBadge percent={percent} size={size} />
                    </>
                )
            )}
        </Box>
    );
}
