import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import BookCover from "../../components/BookCover/BookCover";
import { NetBadge } from "../../components/PriceTag/PriceTag";
import { QtyStepper, Shell } from "../../components/Common/Common";
import { useShop } from "../../context/ShopContext";
import { rupees } from "../../configurations/format";

function CartLine({ line }) {
    const { brand } = useTheme();
    const { setQty, removeFromCart, maxQty } = useShop();
    const max = Math.min(maxQty, line.StockQty);
    return (
        <Box component="li" sx={{ display: "grid", gridTemplateColumns: { xs: "72px 1fr", sm: "88px 1fr auto" }, gap: { xs: 2, sm: 2.5 }, py: 2.5, borderBottom: `1px solid ${brand.color.line}` }}>
            <Box component={RouterLink} to={`/book/${line.Slug}`} sx={{ display: "block" }}>
                <BookCover product={line} mini />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography component={RouterLink} to={`/book/${line.Slug}`} sx={{ fontFamily: brand.font.display, fontWeight: 600, fontSize: 16, lineHeight: 1.3, color: brand.color.ink, textDecoration: "none", "&:hover": { color: brand.color.steel } }}>
                    {line.Title}
                </Typography>
                {(line.Author || line.Publisher) && <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 0.25 }}>{line.Author || line.Publisher}</Typography>}
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", fontSize: 13.5 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{rupees(line.SellingPrice)}</Box>
                    {line.PricingMode === "NET" ? <NetBadge /> : line.Mrp > line.SellingPrice && <Box component="span" sx={{ color: brand.color.inkFaint, textDecoration: "line-through" }}>{rupees(line.Mrp)}</Box>}
                    <Box component="span" sx={{ color: brand.color.inkFaint }}>each</Box>
                </Box>
                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <QtyStepper value={line.Qty} onChange={(q) => setQty(line.ProductId, q)} max={max} size="sm" label={`Quantity of ${line.Title}`} />
                    <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => removeFromCart(line.ProductId)} aria-label={`Remove ${line.Title}`}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography sx={{ display: { xs: "block", sm: "none" }, mt: 1, fontWeight: 700 }}>{rupees(line.SellingPrice * line.Qty)}</Typography>
            </Box>
            <Typography sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700, fontSize: 16, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{rupees(line.SellingPrice * line.Qty)}</Typography>
        </Box>
    );
}

// Order summary styled as a till receipt.
function Receipt() {
    const { brand } = useTheme();
    const navigate = useNavigate();
    const { totals } = useShop();
    const row = { display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, fontSize: 14.5 };
    return (
        <Box sx={{ position: { md: "sticky" }, top: { md: 140 } }}>
            <Box sx={{ bgcolor: brand.color.card, boxShadow: brand.shadow.card, border: `1px solid ${brand.color.line}`, borderBottom: 0 }}>
                <Box sx={{ p: 3, pb: 2.5 }}>
                    <Box sx={{ textAlign: "center", pb: 2, borderBottom: `1px dashed ${brand.color.lineStrong}` }}>
                        <Typography sx={{ fontFamily: brand.font.display, fontWeight: 700, fontSize: 18 }}>Order summary</Typography>
                        <Typography sx={{ fontFamily: brand.font.mono, fontSize: 11, color: brand.color.inkMuted, mt: 0.5 }}>
                            {totals.count} {totals.count === 1 ? "ITEM" : "ITEMS"} · PRICES INCL. GST
                        </Typography>
                    </Box>
                    <Box sx={{ pt: 1.5 }}>
                        <Box sx={row}>
                            <span>MRP total</span>
                            <span>{rupees(totals.mrpTotal)}</span>
                        </Box>
                        {totals.savings > 0 && (
                            <Box sx={{ ...row, color: brand.color.success, fontWeight: 600 }}>
                                <span>You save</span>
                                <span>− {rupees(totals.savings)}</span>
                            </Box>
                        )}
                        <Box sx={{ ...row, color: brand.color.inkMuted }}>
                            <span>Delivery</span>
                            <span>At checkout</span>
                        </Box>
                        <Box sx={{ ...row, mt: 1, pt: 1.5, borderTop: `1px solid ${brand.color.line}`, fontSize: 18, fontWeight: 700 }}>
                            <span>Subtotal</span>
                            <span>{rupees(totals.subtotal)}</span>
                        </Box>
                    </Box>
                    <Button fullWidth variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/checkout")} sx={{ mt: 2.5 }}>
                        Proceed to checkout
                    </Button>
                    <Typography sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, fontSize: 12.5, color: brand.color.inkMuted }}>
                        <LockOutlinedIcon sx={{ fontSize: 14 }} /> Cash on delivery or UPI. Free pickup from the shop.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default function Cart() {
    const { brand } = useTheme();
    const { cart, totals } = useShop();

    if (cart.length === 0) {
        return (
            <Shell sx={{ py: { xs: 8, md: 12 }, textAlign: "center" }}>
                <Box sx={{ width: 120, mx: "auto", mb: 3, opacity: 0.9 }} aria-hidden>
                    <Box component="svg" viewBox="0 0 120 90">
                        <rect x="10" y="80" width="100" height="5" rx="2" fill={brand.color.lineStrong} />
                        <rect x="28" y="40" width="14" height="40" rx="2" fill={brand.color.line} />
                        <rect x="46" y="30" width="14" height="50" rx="2" fill={brand.color.line} />
                        <rect x="72" y="44" width="14" height="36" rx="2" fill={brand.color.line} transform="rotate(14 79 62)" />
                    </Box>
                </Box>
                <Typography variant="h2">Your bag is empty.</Typography>
                <Typography sx={{ color: brand.color.inkMuted, mt: 1, maxWidth: 420, mx: "auto" }}>Find something on the shelves, or send us a list and we'll put it together for you.</Typography>
                <Box sx={{ mt: 3.5, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button component={RouterLink} to="/shop" variant="contained" size="large">Browse the shop</Button>
                    <Button component={RouterLink} to="/school-orders" variant="outlined" size="large">Send a book list</Button>
                </Box>
            </Shell>
        );
    }

    return (
        <Shell sx={{ pt: { xs: 3, md: 5 } }}>
            <Box sx={{ pb: 2.5, borderBottom: `1px solid ${brand.color.line}`, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="h2" component="h1">Your bag</Typography>
                <Typography sx={{ color: brand.color.inkMuted }}>{totals.count} {totals.count === 1 ? "item" : "items"}</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 380px" }, gap: { xs: 4, md: 6 }, alignItems: "start" }}>
                <Box>
                    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                        {cart.map((line) => (
                            <CartLine key={line.ProductId} line={line} />
                        ))}
                    </Box>
                    <Button component={RouterLink} to="/shop" sx={{ mt: 2, color: brand.color.steel }}>
                        ← Continue shopping
                    </Button>
                </Box>
                <Box sx={{ pt: { md: 2.5 } }}>
                    <Receipt />
                </Box>
            </Box>
        </Shell>
    );
}
