import { useEffect, useState } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";
import { ProductGrid, Shell } from "../../components/Common/Common";
import { useShop } from "../../context/ShopContext";
import { getProductBySlug } from "../../services/catalogue";

export default function Wishlist() {
    const { brand } = useTheme();
    const { wishlist } = useShop();
    // Show current price and stock from the shop, not the values saved when the item was liked.
    // Items that were removed from the shop drop out of the list.
    const [items, setItems] = useState(null);
    const key = wishlist.map((w) => w.Slug).join("|");
    useEffect(() => {
        let live = true;
        Promise.all(wishlist.map((w) => getProductBySlug(w.Slug).then((r) => r?.product || null).catch(() => w)))
            .then((list) => live && setItems(list.filter(Boolean)));
        return () => {
            live = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return (
        <Shell sx={{ pt: { xs: 3, md: 5 } }}>
            <Box sx={{ pb: 2.5, mb: 3, borderBottom: `1px solid ${brand.color.line}`, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h2" component="h1">Wishlist</Typography>
                <Typography sx={{ color: brand.color.inkMuted }}>{wishlist.length} saved</Typography>
            </Box>
            {items === null && wishlist.length ? (
                <ProductGrid>
                    {wishlist.map((w) => <Skeleton key={w.ProductId} variant="rounded" sx={{ height: 360, borderRadius: "14px" }} />)}
                </ProductGrid>
            ) : items?.length ? (
                <ProductGrid>
                    {items.map((p) => (
                        <ProductCard key={p.ProductId} product={p} />
                    ))}
                </ProductGrid>
            ) : (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h3">Nothing saved yet.</Typography>
                    <Typography sx={{ color: brand.color.inkMuted, mt: 1 }}>Tap the heart on any item to keep it here for later.</Typography>
                    <Button component={RouterLink} to="/shop" variant="contained" sx={{ mt: 3 }}>Browse the shop</Button>
                </Box>
            )}
        </Shell>
    );
}
