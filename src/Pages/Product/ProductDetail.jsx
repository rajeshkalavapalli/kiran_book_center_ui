import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Button, Link, Skeleton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import BookCover from "../../components/BookCover/BookCover";
import PriceTag from "../../components/PriceTag/PriceTag";
import ProductCard from "../../components/ProductCard/ProductCard";
import { ProductGrid, QtyStepper, SectionHeading, Shell } from "../../components/Common/Common";
import { useShop } from "../../context/ShopContext";
import { categoryById, getProductBySlug } from "../../services/catalogue";
import { settings, zones } from "../../services/shopData";
import { PRODUCT_TYPE_LABEL, rupees, stockState, whatsappLink } from "../../configurations/format";

function StockLine({ product }) {
    const { brand } = useTheme();
    const s = stockState(product);
    const colour = { in: brand.color.success, low: brand.color.warn, out: brand.color.danger }[s.key];
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 600, fontSize: 14, color: colour }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: colour }} />
            {s.label}
        </Box>
    );
}

// Book details on notebook-ruled lines.
function DetailsTable({ product }) {
    const { brand } = useTheme();
    const rows = [
        ["Author", product.Author],
        ["Publisher", product.Publisher],
        ["Edition", product.Edition],
        ["Year", product.PublishYear],
        ["Class / year", product.ClassLevel],
        ["Board", product.Board],
        ["Subject", product.Subject],
        ["Language", product.Language],
        ["ISBN", product.Isbn && <Box component="span" sx={{ fontFamily: brand.font.mono, fontSize: 13 }}>{product.Isbn}</Box>],
        ["Type", PRODUCT_TYPE_LABEL[product.ProductType]],
    ].filter(([, v]) => v);

    return (
        <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "minmax(110px, 0.6fr) 1fr", position: "relative", }}>
            {/* red margin rule */}
            {rows.map(([k, v]) => (
                <Box key={k} sx={{ display: "contents" }}>
                    <Box component="dt" sx={{ py: 1.25, borderBottom: `1px solid ${brand.color.steelMist}`, color: brand.color.inkMuted, fontSize: 13.5 }}>{k}</Box>
                    <Box component="dd" sx={{ m: 0, py: 1.25, borderBottom: `1px solid ${brand.color.steelMist}`, fontSize: 14.5, fontWeight: 500 }}>{v}</Box>
                </Box>
            ))}
        </Box>
    );
}

function DeliveryInfo() {
    const { brand } = useTheme();
    return (
        <Box sx={{ border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.md}px`, bgcolor: brand.color.card }}>
            <Box sx={{ display: "flex", gap: 1.5, p: 2, borderBottom: `1px dashed ${brand.color.lineStrong}` }}>
                <StorefrontOutlinedIcon sx={{ color: brand.color.steel }} />
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Pick up from the shop: free</Typography>
                    <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>We'll message you when it's packed and waiting at the counter.</Typography>
                </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, p: 2 }}>
                <LocalShippingOutlinedIcon sx={{ color: brand.color.steel }} />
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Home delivery</Typography>
                    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mt: 0.5 }}>
                        {zones.map((z) => (
                            <Box component="li" key={z.Code} sx={{ display: "flex", justifyContent: "space-between", gap: 1, fontSize: 13, color: brand.color.inkSoft, py: 0.3 }}>
                                <span>{z.Name} · {z.EtaDays} days</span>
                                <span>{rupees(z.Charge)} <Box component="span" sx={{ color: brand.color.inkMuted }}>(free over {rupees(z.FreeAbove)})</Box></span>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default function ProductDetail() {
    const { brand } = useTheme();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart, isWished, toggleWish, maxQty } = useShop();
    const [data, setData] = useState(undefined);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        let live = true;
        setData(undefined);
        setQty(1);
        getProductBySlug(slug).then((d) => live && setData(d));
        return () => {
            live = false;
        };
    }, [slug]);

    if (data === undefined) {
        return (
            <Shell sx={{ pt: 5, display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, gap: 6 }}>
                <Skeleton variant="rounded" sx={{ aspectRatio: "1", height: "auto" }} />
                <Box>
                    <Skeleton height={60} />
                    <Skeleton width="50%" />
                    <Skeleton width="30%" height={50} sx={{ mt: 3 }} />
                </Box>
            </Shell>
        );
    }

    if (!data) {
        return (
            <Shell sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h2">We couldn't find that item.</Typography>
                <Typography sx={{ color: brand.color.inkMuted, mt: 1 }}>It may have been renamed or removed from the shelf.</Typography>
                <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "center" }}>
                    <Button component={RouterLink} to="/shop" variant="contained">Browse the shop</Button>
                    <Button component={RouterLink} to="/request" variant="outlined">Request a book</Button>
                </Box>
            </Shell>
        );
    }

    const { product, category, related } = data;
    const parent = category?.ParentCategoryId ? categoryById(category.ParentCategoryId) : null;
    const out = product.StockQty <= 0;
    const max = Math.min(maxQty, product.StockQty);
    const wished = isWished(product.ProductId);
    const buyNow = () => {
        addToCart(product, qty);
        navigate("/cart");
    };

    return (
        <>
            <Shell sx={{ pt: { xs: 2.5, md: 4 } }}>
                <Breadcrumbs sx={{ fontSize: 13, mb: { xs: 2, md: 3 } }}>
                    <Link component={RouterLink} to="/" sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>Home</Link>
                    {parent && <Link component={RouterLink} to={`/shop?category=${parent.Slug}`} sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>{parent.Name}</Link>}
                    {category && <Link component={RouterLink} to={`/shop?category=${category.Slug}`} sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>{category.Name}</Link>}
                </Breadcrumbs>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }, gap: { xs: 4, md: 7 }, alignItems: "start" }}>
                    {/* Cover on a reading stand */}
                    <Box sx={{ position: { md: "sticky" }, top: { md: 140 } }}>
                        <Box sx={{ position: "relative", bgcolor: brand.color.surface, borderRadius: `${brand.radius.lg}px`, px: { xs: "18%", md: "16%" }, pt: { xs: 4, md: 6 }, pb: { xs: 5, md: 7 }, overflow: "hidden" }}>
                            <Box sx={{ position: "relative", width: { xs: "70%", md: "62%" }, mx: "auto" }}>
                                <BookCover product={product} />
                            </Box>
                        </Box>
                        <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: brand.color.inkFaint, mt: 1 }}>
                            {product.Images?.length ? "Photo of the actual item" : "Photo coming soon"}
                        </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0, pb: { xs: 10, md: 0 } }}>
                        <Typography variant="overline" sx={{ color: brand.color.accent }}>
                            {PRODUCT_TYPE_LABEL[product.ProductType]}{product.ClassLevel ? ` · ${product.ClassLevel}` : ""}{product.Board ? ` · ${product.Board}` : ""}
                        </Typography>
                        <Typography variant="h1" component="h1" sx={{ fontSize: "clamp(1.75rem, 3.4vw, 2.6rem)", mt: 0.75 }}>
                            {product.Title}
                        </Typography>
                        {(product.Author || product.Publisher) && (
                            <Typography sx={{ mt: 1.25, color: brand.color.inkSoft, fontSize: 16 }}>
                                {product.Author && <>by <Box component="span" sx={{ fontWeight: 600 }}>{product.Author}</Box></>}
                                {product.Author && product.Publisher && <Box component="span" sx={{ color: brand.color.inkFaint, mx: 1 }}>·</Box>}
                                {product.Publisher}
                            </Typography>
                        )}

                        <Box sx={{ mt: 3.5, pt: 3, borderTop: `1px solid ${brand.color.line}` }}>
                            <PriceTag product={product} size="lg" />
                            <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 0.75 }}>
                                {product.PricingMode === "NET" ? "Sold at the printed price (net). Inclusive of all taxes." : `MRP ${rupees(product.Mrp)}. You save ${rupees(product.Mrp - product.SellingPrice)}. Inclusive of all taxes.`}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <StockLine product={product} />
                            </Box>
                        </Box>

                        {/* Buy box (desktop) */}
                        <Box sx={{ mt: 3, display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                            {!out && <QtyStepper value={qty} onChange={setQty} max={max} />}
                            <Button variant="contained" size="large" startIcon={<LocalMallOutlinedIcon />} disabled={out} onClick={() => addToCart(product, qty)} sx={{ minWidth: 180 }}>
                                Add to bag
                            </Button>
                            {!out && (
                                <Button variant="outlined" size="large" onClick={buyNow} sx={{ bgcolor: brand.color.card }}>
                                    Buy now
                                </Button>
                            )}
                            <Button
                                size="large"
                                onClick={() => toggleWish(product)}
                                aria-pressed={wished}
                                startIcon={wished ? <FavoriteRoundedIcon sx={{ color: brand.color.danger }} /> : <FavoriteBorderRoundedIcon />}
                                sx={{ color: brand.color.ink }}
                            >
                                {wished ? "Saved" : "Save"}
                            </Button>
                        </Box>

                        {out && (
                            <Box sx={{ mt: 3, p: 2.25, borderRadius: `${brand.radius.md}px`, bgcolor: brand.color.surface, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Out of stock right now. We can reserve the next copy for you.</Typography>
                                <Button component={RouterLink} to={`/request?title=${encodeURIComponent(product.Title)}`} variant="contained" color="secondary" size="small">
                                    Request it
                                </Button>
                            </Box>
                        )}

                        <Box sx={{ mt: 4 }}>
                            <DeliveryInfo />
                        </Box>

                        {product.Description && (
                            <Box sx={{ mt: 5 }}>
                                <Typography variant="h4" sx={{ mb: 1.25 }}>About this {product.ProductType === "BOOK" ? "book" : "item"}</Typography>
                                <Typography sx={{ color: brand.color.inkSoft, maxWidth: 640 }}>{product.Description}</Typography>
                            </Box>
                        )}

                        <Box sx={{ mt: 5 }}>
                            <Typography variant="h4" sx={{ mb: 1 }}>Details</Typography>
                            <DetailsTable product={product} />
                        </Box>

                        <Box
                            component="a"
                            href={whatsappLink(settings["shop.whatsapp"], `Hello, I have a question about "${product.Title}".`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 4, display: "inline-flex", alignItems: "center", gap: 1, color: brand.color.steel, fontWeight: 600, fontSize: 14, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            <WhatsAppIcon fontSize="small" /> Ask about this item on WhatsApp
                        </Box>
                    </Box>
                </Box>
            </Shell>

            {related.length > 0 && (
                <Shell component="section" sx={{ mt: { xs: 6, md: 10 } }}>
                    <SectionHeading kicker="On the same shelf" title="You may also need" />
                    <ProductGrid>
                        {related.map((p) => (
                            <ProductCard key={p.ProductId} product={p} />
                        ))}
                    </ProductGrid>
                </Shell>
            )}

            {/* Sticky buy bar (phones) */}
            <Box
                sx={{
                    display: { xs: "flex", md: "none" },
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 25,
                    gap: 1.25,
                    alignItems: "center",
                    px: 2,
                    py: 1.25,
                    bgcolor: "rgba(255,253,248,0.97)",
                    borderTop: `1px solid ${brand.color.line}`,
                    boxShadow: "0 -8px 20px -14px rgba(30,27,22,0.4)",
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>{rupees(product.SellingPrice)}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: brand.color.inkMuted }}>{product.PricingMode === "NET" ? "Net price" : `MRP ${rupees(product.Mrp)}`}</Typography>
                </Box>
                {!out && <QtyStepper value={qty} onChange={setQty} max={max} size="sm" />}
                <Button variant="contained" disabled={out} onClick={() => addToCart(product, qty)} startIcon={<LocalMallOutlinedIcon />}>
                    {out ? "Out of stock" : "Add"}
                </Button>
            </Box>
        </>
    );
}
