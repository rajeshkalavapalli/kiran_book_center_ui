import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { Link as RouterLink } from "react-router-dom";

import BookCover from "../BookCover/BookCover";
import PriceTag from "../PriceTag/PriceTag";
import { useShop } from "../../context/ShopContext";
import { stockState } from "../../configurations/format";

export default function ProductCard({ product }) {
    const { brand } = useTheme();
    const { addToCart, isWished, toggleWish } = useShop();
    const stock = stockState(product);
    const wished = isWished(product.ProductId);
    const href = `/book/${product.Slug}`;
    const out = stock.key === "out";

    return (
        <Box
            component="article"
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                p: { xs: 1, sm: 1.25 },
                bgcolor: brand.color.card,
                border: `1px solid ${brand.color.line}`,
                borderRadius: `${brand.radius.md}px`,
                transition: `border-color ${brand.motion.fast}, box-shadow ${brand.motion.base}, transform ${brand.motion.base}`,
                "&:hover": { borderColor: brand.color.lineStrong, boxShadow: brand.shadow.lift, transform: "translateY(-2px)" },
            }}
        >
            {/* image well */}
            <Box
                component={RouterLink}
                to={href}
                aria-label={product.Title}
                sx={{ position: "relative", display: "grid", placeItems: "center", aspectRatio: "1 / 1", bgcolor: brand.color.surface, borderRadius: `${brand.radius.sm}px`, textDecoration: "none", overflow: "hidden" }}
            >
                <Box sx={{ width: "58%", opacity: out ? 0.5 : 1 }}>
                    <BookCover product={product} compact />
                </Box>
                {out && (
                    <Box sx={{ position: "absolute", left: 8, top: 8, px: 1, height: 22, display: "flex", alignItems: "center", bgcolor: brand.color.ink, color: brand.color.white, fontSize: 11, fontWeight: 700, borderRadius: `${brand.radius.pill}px` }}>Out of stock</Box>
                )}
            </Box>

            <Tooltip title={wished ? "Remove from wishlist" : "Save to wishlist"}>
                <IconButton
                    size="small"
                    onClick={() => toggleWish(product)}
                    aria-pressed={wished}
                    aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                    sx={{ position: "absolute", top: { xs: 14, sm: 18 }, right: { xs: 14, sm: 18 }, width: 32, height: 32, borderRadius: "50%", bgcolor: brand.color.white, boxShadow: brand.shadow.card, "&:hover": { bgcolor: brand.color.white }, color: wished ? brand.color.danger : brand.color.inkSoft }}
                >
                    {wished ? <FavoriteRoundedIcon sx={{ fontSize: 17 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 17 }} />}
                </IconButton>
            </Tooltip>

            <Box sx={{ pt: 1.5, px: 0.5, display: "flex", flexDirection: "column", flex: 1, gap: 0.4 }}>
                <Typography variant="caption" sx={{ color: brand.color.inkMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>
                    {product.Author || product.Publisher || " "}
                </Typography>
                <Typography
                    component={RouterLink}
                    to={href}
                    sx={{ fontWeight: 700, fontSize: { xs: 13.5, sm: 14.5 }, lineHeight: 1.35, color: brand.color.ink, textDecoration: "none", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.7em", "&:hover": { color: brand.color.accent } }}
                >
                    {product.Title}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                    <PriceTag product={product} />
                    <Typography sx={{ fontSize: 11.5, fontWeight: 700, mt: 0.5, color: stock.key === "low" ? brand.color.warn : out ? brand.color.inkFaint : brand.color.success }}>{stock.label}</Typography>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Button fullWidth variant={out ? "outlined" : "contained"} color="secondary" disabled={out} onClick={() => addToCart(product)} sx={{ mt: 1.25, minHeight: 38 }}>
                    {out ? "Out of stock" : "Add to bag"}
                </Button>
            </Box>
        </Box>
    );
}
