import { useEffect, useState } from "react";
import { Badge, Box, Button, Divider, Drawer, IconButton, InputBase, Link, Popover, Snackbar, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import BrandMark from "../BrandMark/BrandMark";
import { Shell } from "../Common/Common";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { childCategories, topCategories } from "../../services/catalogue";
import { settings } from "../../services/shopData";
import { whatsappLink } from "../../configurations/format";

function SearchBox({ onDone }) {
    const { brand } = useTheme();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [q, setQ] = useState(params.get("q") || "");

    useEffect(() => {
        setQ(params.get("q") || "");
    }, [params]);

    const submit = (e) => {
        e.preventDefault();
        const term = q.trim();
        navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
        onDone?.();
    };

    return (
        <Box
            component="form"
            role="search"
            onSubmit={submit}
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: 48,
                bgcolor: brand.color.surface,
                border: "1.5px solid transparent",
                borderRadius: `${brand.radius.sm}px`,
                pl: 1.75,
                pr: 0.5,
                transition: `border-color ${brand.motion.fast}, background-color ${brand.motion.fast}`,
                "&:focus-within": { borderColor: brand.color.accent, bgcolor: brand.color.white },
            }}
        >
            <SearchRoundedIcon sx={{ color: brand.color.inkMuted, mr: 1.25 }} />
            <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books, authors, class or ISBN" inputProps={{ "aria-label": "Search the shop" }} sx={{ flex: 1, fontSize: 14.5, fontWeight: 500 }} />
            <Button type="submit" variant="contained" sx={{ minHeight: 38, px: 2.25, borderRadius: `${brand.radius.xs + 2}px` }}>
                Search
            </Button>
        </Box>
    );
}

function AnnouncementBar() {
    const { brand } = useTheme();
    const item = { display: "inline-flex", alignItems: "center", gap: 0.75, whiteSpace: "nowrap" };
    return (
        <Box sx={{ bgcolor: brand.color.ink, color: "rgba(255,255,255,0.85)", fontSize: 12.5, fontWeight: 600 }}>
            <Shell sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, height: 38 }}>
                <Box sx={{ display: "flex", gap: 3, overflow: "hidden" }}>
                    <Box sx={item}><StorefrontOutlinedIcon sx={{ fontSize: 16 }} /> Free pickup from the store</Box>
                    <Box sx={{ ...item, display: { xs: "none", sm: "inline-flex" } }}><LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> Delivery across India</Box>
                    <Box sx={{ ...item, display: { xs: "none", md: "inline-flex" } }}><ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} /> GST invoice on every order</Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2.5, flexShrink: 0 }}>
                    <Link href={`tel:${settings["shop.phone"].replace(/\s/g, "")}`} sx={{ color: "inherit", fontWeight: 600, display: { xs: "none", md: "inline" } }}>{settings["shop.phone"]}</Link>
                    <Link component={RouterLink} to="/track" sx={{ color: "inherit", fontWeight: 600 }}>Track order</Link>
                </Box>
            </Shell>
        </Box>
    );
}

// "All categories" mega menu.
function MegaMenu() {
    const { brand } = useTheme();
    const [anchor, setAnchor] = useState(null);
    const close = () => setAnchor(null);
    return (
        <>
            <Button
                onClick={(e) => setAnchor(e.currentTarget)}
                startIcon={<GridViewRoundedIcon />}
                endIcon={<KeyboardArrowDownRoundedIcon sx={{ transform: anchor ? "rotate(180deg)" : "none", transition: `transform ${brand.motion.fast}` }} />}
                aria-haspopup="true"
                aria-expanded={Boolean(anchor)}
                sx={{ bgcolor: brand.color.ink, color: brand.color.white, minHeight: 38, px: 1.75, whiteSpace: "nowrap", "&:hover": { bgcolor: brand.color.steelDark } }}
            >
                All categories
            </Button>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={close}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                slotProps={{ paper: { sx: { mt: 1, p: 3, borderRadius: `${brand.radius.md}px`, border: `1px solid ${brand.color.line}`, boxShadow: brand.shadow.lift, width: "min(920px, 92vw)" } } }}
            >
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
                    {topCategories().map((c) => (
                        <Box key={c.Slug}>
                            <Box component={RouterLink} to={`/shop?category=${c.Slug}`} onClick={close} sx={{ fontFamily: brand.font.display, fontWeight: 600, fontSize: 15, color: brand.color.ink, textDecoration: "none", "&:hover": { color: brand.color.accent } }}>
                                {c.Name}
                            </Box>
                            <Box sx={{ mt: 1, display: "grid", gap: 0.5 }}>
                                {childCategories(c.CategoryId).map((s) => (
                                    <Box key={s.Slug} component={RouterLink} to={`/shop?category=${s.Slug}`} onClick={close} sx={{ fontSize: 13.5, color: brand.color.inkMuted, textDecoration: "none", py: 0.25, "&:hover": { color: brand.color.ink } }}>
                                        {s.Name}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                    <Box sx={{ p: 2, borderRadius: `${brand.radius.sm}px`, bgcolor: brand.color.accentMist, alignSelf: "start" }}>
                        <SchoolOutlinedIcon sx={{ color: brand.color.accent }} />
                        <Typography sx={{ fontWeight: 700, mt: 0.5 }}>Ordering for a school?</Typography>
                        <Typography variant="body2" sx={{ color: brand.color.inkSoft, mt: 0.25 }}>Send the book list and get one quote.</Typography>
                        <Link component={RouterLink} to="/school-orders" onClick={close} sx={{ display: "inline-block", mt: 1, fontSize: 13.5 }}>Start a bulk order</Link>
                    </Box>
                </Box>
            </Popover>
        </>
    );
}

function CategoryBar() {
    const { brand } = useTheme();
    const location = useLocation();
    const [params] = useSearchParams();
    const active = location.pathname === "/shop" ? params.get("category") : null;
    const link = (on) => ({ px: 1.25, py: 0.9, borderRadius: `${brand.radius.xs}px`, fontSize: 14, fontWeight: 600, color: on ? brand.color.ink : brand.color.inkSoft, bgcolor: on ? brand.color.surface : "transparent", textDecoration: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: brand.color.surface, color: brand.color.ink } });
    return (
        <Box component="nav" aria-label="Categories" sx={{ display: { xs: "none", md: "block" }, borderTop: `1px solid ${brand.color.line}` }}>
            <Shell sx={{ display: "flex", gap: 0.5, alignItems: "center", height: 56 }}>
                <Box sx={{ flexShrink: 0 }}>
                    <MegaMenu />
                </Box>
                {/* Category links take the space that's left: long names are cut with "…" (full name on hover),
                    and links that don't fit are hidden behind a soft fade. All categories are always in the menu. */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        gap: 0.5,
                        ml: 1.5,
                        overflow: "hidden",
                        maskImage: "linear-gradient(90deg, #000 calc(100% - 32px), transparent)",
                        WebkitMaskImage: "linear-gradient(90deg, #000 calc(100% - 32px), transparent)",
                    }}
                >
                    {topCategories().slice(0, 6).map((c) => (
                        <Box key={c.Slug} component={RouterLink} to={`/shop?category=${c.Slug}`} title={c.Name} sx={{ ...link(active === c.Slug), flexShrink: 0, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.Name}
                        </Box>
                    ))}
                </Box>
                <Box component={RouterLink} to="/school-orders" sx={{ ...link(location.pathname === "/school-orders"), color: brand.color.accent, flexShrink: 0 }}>School orders</Box>
                <Box component={RouterLink} to="/request" sx={{ ...link(location.pathname === "/request"), color: brand.color.accent, flexShrink: 0 }}>Request a book</Box>
            </Shell>
        </Box>
    );
}

function MobileMenu({ open, onClose }) {
    const { brand } = useTheme();
    const item = { display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, fontSize: 15.5, fontWeight: 600, color: brand.color.ink, textDecoration: "none", borderBottom: `1px solid ${brand.color.line}` };
    const head = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: brand.color.inkMuted, mt: 3, mb: 0.5 };
    return (
        <Drawer anchor="left" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: "min(88vw, 360px)" } } }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${brand.color.line}` }}>
                <BrandMark />
                <IconButton onClick={onClose} aria-label="Close menu"><CloseRoundedIcon /></IconButton>
            </Box>
            <Box sx={{ px: 2.5, pb: 3 }} onClick={onClose}>
                <Box sx={head}>Shop</Box>
                {topCategories().map((c) => (
                    <Box key={c.Slug} component={RouterLink} to={`/shop?category=${c.Slug}`} sx={item}>{c.Name}<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
                ))}
                <Box sx={head}>Services</Box>
                <Box component={RouterLink} to="/school-orders" sx={item}>School and college orders<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
                <Box component={RouterLink} to="/request" sx={item}>Request a book<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
                <Box component={RouterLink} to="/track" sx={item}>Track an order<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
                <Box sx={head}>Account</Box>
                <Box component={RouterLink} to="/account" sx={item}>My account and orders<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
                <Box component={RouterLink} to="/wishlist" sx={item}>Wishlist<ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} /></Box>
            </Box>
        </Drawer>
    );
}

function Header() {
    const { brand, breakpoints } = useTheme();
    const isDesktop = useMediaQuery(breakpoints.up("md"));
    const { totals, wishlist } = useShop();
    const { customer } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // The header slims down and gains a soft shadow once the page scrolls.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 20, bgcolor: "rgba(255,255,255,0.96)", backdropFilter: "saturate(1.6) blur(10px)", borderBottom: `1px solid ${brand.color.line}`, boxShadow: scrolled ? "0 8px 24px -16px rgba(14,17,22,0.25)" : "none", transition: `box-shadow ${brand.motion.base}` }}>
            <Shell sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 4 }, height: { xs: 62, md: scrolled ? 66 : 80 }, transition: `height ${brand.motion.base}` }}>
                {!isDesktop && (
                    <IconButton onClick={() => setMenuOpen(true)} aria-label="Open menu" sx={{ ml: -1 }}><MenuRoundedIcon /></IconButton>
                )}
                <BrandMark />
                {isDesktop ? <Box sx={{ flex: 1, maxWidth: 680, mx: "auto" }}><SearchBox /></Box> : <Box sx={{ flex: 1 }} />}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.25, md: 1 } }}>
                    <Box component={RouterLink} to={customer ? "/account" : "/login"} sx={{ display: "flex", alignItems: "center", gap: 1, px: { xs: 0.75, md: 1.25 }, py: 0.75, borderRadius: `${brand.radius.sm}px`, color: brand.color.ink, textDecoration: "none", "&:hover": { bgcolor: brand.color.surface } }} aria-label={customer ? "My account" : "Sign in"}>
                        {customer ? (
                            <Box sx={{ width: 30, height: 30, borderRadius: "50%", bgcolor: brand.color.accent, color: brand.color.white, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800 }}>{customer.Name.trim().charAt(0).toUpperCase()}</Box>
                        ) : (
                            <PersonOutlineRoundedIcon />
                        )}
                        <Box sx={{ display: { xs: "none", lg: "block" }, lineHeight: 1.15 }}>
                            <Box sx={{ fontSize: 11.5, color: brand.color.inkMuted, fontWeight: 600 }}>{customer ? "Hello" : "Welcome"}</Box>
                            <Box sx={{ fontSize: 13.5, fontWeight: 700 }}>{customer ? customer.Name.split(" ")[0] : "Sign in"}</Box>
                        </Box>
                    </Box>
                    <Tooltip title="Wishlist">
                        <IconButton component={RouterLink} to="/wishlist" aria-label={`Wishlist, ${wishlist.length} items`} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                            <Badge badgeContent={wishlist.length} color="primary"><FavoriteBorderRoundedIcon /></Badge>
                        </IconButton>
                    </Tooltip>
                    <Box
                        component={RouterLink}
                        to="/cart"
                        aria-label={`Shopping bag, ${totals.count} items`}
                        sx={{ ml: { xs: 0.5, md: 0.5 }, display: "inline-flex", alignItems: "center", gap: 1, height: 44, px: { xs: 1.25, md: 1.75 }, borderRadius: `${brand.radius.sm}px`, bgcolor: brand.color.ink, color: brand.color.white, textDecoration: "none", fontWeight: 700, fontSize: 14, "&:hover": { bgcolor: brand.color.steelDark } }}
                    >
                        <LocalMallOutlinedIcon sx={{ fontSize: 20 }} />
                        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>Bag</Box>
                        <Box component="span" sx={{ minWidth: 20, height: 20, px: 0.6, borderRadius: 10, bgcolor: totals.count ? brand.color.accent : "rgba(255,255,255,0.18)", display: "grid", placeItems: "center", fontSize: 11.5 }}>{totals.count}</Box>
                    </Box>
                </Box>
            </Shell>
            {!isDesktop && <Shell sx={{ pb: 1.5 }}><SearchBox /></Shell>}
            <CategoryBar />
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </Box>
    );
}

function Footer() {
    const { brand } = useTheme();
    const col = { display: "flex", flexDirection: "column", gap: 1.1 };
    const fl = { color: "rgba(255,255,255,0.72)", fontWeight: 500, fontSize: 14, textDecoration: "none", "&:hover": { color: brand.color.white } };
    const head = { fontSize: 13, fontWeight: 700, color: brand.color.white, mb: 0.75 };
    const trust = [
        [<StorefrontOutlinedIcon key="i" />, "Free store pickup", "Collect at the counter, any day we're open"],
        [<LocalShippingOutlinedIcon key="i" />, "Pan-India delivery", "Packed the same day, tracking shared"],
        [<ReceiptLongOutlinedIcon key="i" />, "GST invoice", "A proper tax invoice with every order"],
        [<SchoolOutlinedIcon key="i" />, "School supplier", "Bulk lists quoted within a day"],
    ];

    return (
        <Box component="footer" sx={{ mt: { xs: 8, md: 12 }, bgcolor: brand.color.ink, color: brand.color.white }}>
            <Shell sx={{ py: { xs: 4, md: 5 }, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {trust.map(([icon, t, b]) => (
                    <Box key={t} sx={{ display: "flex", gap: 1.5 }}>
                        <Box sx={{ color: brand.color.onDark, mt: 0.25 }}>{icon}</Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{t}</Typography>
                            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.6)", mt: 0.25 }}>{b}</Typography>
                        </Box>
                    </Box>
                ))}
            </Shell>
            <Shell sx={{ py: { xs: 5, md: 7 }, display: "grid", gap: { xs: 4, md: 6 }, gridTemplateColumns: { xs: "1fr 1fr", md: "1.6fr 1fr 1fr 1.3fr" } }}>
                <Box sx={{ gridColumn: { xs: "1 / -1", md: "auto" } }}>
                    <BrandMark light />
                    <Typography sx={{ mt: 2.5, color: "rgba(255,255,255,0.6)", maxWidth: 340, fontSize: 14, lineHeight: 1.7 }}>
                        Books, stationery and school supplies for students, teachers and institutions. Order online for delivery, or pick up from the store.
                    </Typography>
                    <Button component="a" href={whatsappLink(settings["shop.whatsapp"], "Hello Kiran Book Center,")} target="_blank" rel="noopener noreferrer" startIcon={<WhatsAppIcon />} sx={{ mt: 2.5, color: brand.color.white, border: "1px solid rgba(255,255,255,0.2)", "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
                        Chat on WhatsApp
                    </Button>
                </Box>
                <Box sx={col}>
                    <Box sx={head}>Shop</Box>
                    {topCategories().slice(0, 6).map((c) => <Box key={c.Slug} component={RouterLink} to={`/shop?category=${c.Slug}`} sx={fl}>{c.Name}</Box>)}
                </Box>
                <Box sx={col}>
                    <Box sx={head}>Help</Box>
                    <Box component={RouterLink} to="/track" sx={fl}>Track an order</Box>
                    <Box component={RouterLink} to="/request" sx={fl}>Request a book</Box>
                    <Box component={RouterLink} to="/school-orders" sx={fl}>School and college orders</Box>
                    <Box component={RouterLink} to="/policies/shipping" sx={fl}>Shipping and delivery</Box>
                    <Box component={RouterLink} to="/policies/cancellation" sx={fl}>Cancellation and refunds</Box>
                    <Box component={RouterLink} to="/contact" sx={fl}>Contact us</Box>
                </Box>
                <Box sx={{ ...col, gridColumn: { xs: "1 / -1", md: "auto" } }}>
                    <Box sx={head}>Visit the store</Box>
                    <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.7 }}>
                        {settings["shop.addressLine1"]}<br />{settings["shop.addressLine2"]}<br />{settings["shop.city"]}, {settings["shop.state"]} {settings["shop.pincode"]}
                    </Typography>
                    <Box component="a" href={`tel:${settings["shop.phone"].replace(/\s/g, "")}`} sx={fl}>{settings["shop.phone"]}</Box>
                    <Box component="a" href={`mailto:${settings["shop.email"]}`} sx={fl}>{settings["shop.email"]}</Box>
                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{settings["shop.hours"]}</Typography>
                </Box>
            </Shell>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
            <Shell sx={{ py: 2.5, display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
                <Box>© {new Date().getFullYear()} Kiran Book Center. All prices include GST.</Box>
                <Box sx={{ display: "flex", gap: 2.5 }}>
                    <Box component={RouterLink} to="/policies/privacy" sx={{ ...fl, fontSize: 12.5 }}>Privacy</Box>
                    <Box component={RouterLink} to="/policies/terms" sx={{ ...fl, fontSize: 12.5 }}>Terms</Box>
                </Box>
            </Shell>
        </Box>
    );
}

function WhatsAppButton() {
    const { brand } = useTheme();
    const location = useLocation();
    const lifted = location.pathname.startsWith("/book/");
    return (
        <Tooltip title="Ask us on WhatsApp" placement="left">
            <Box
                component="a"
                href={whatsappLink(settings["shop.whatsapp"], "Hello Kiran Book Center, I have a question about a book.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with the shop on WhatsApp"
                sx={{ position: "fixed", right: { xs: 14, md: 24 }, bottom: { xs: lifted ? 86 : 16, md: 24 }, zIndex: 30, width: 54, height: 54, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "#1FA855", color: brand.color.white, boxShadow: brand.shadow.lift, transition: `transform ${brand.motion.fast}`, "&:hover": { transform: "scale(1.06)" } }}
            >
                <WhatsAppIcon />
            </Box>
        </Tooltip>
    );
}

function ShopToast() {
    const { brand } = useTheme();
    const { toast, clearToast } = useShop();
    return (
        <Snackbar
            key={toast?.id}
            open={Boolean(toast)}
            autoHideDuration={2600}
            onClose={(_, reason) => reason !== "clickaway" && clearToast()}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            message={toast?.message}
            action={<Box component={RouterLink} to="/cart" onClick={clearToast} sx={{ color: brand.color.onDark, fontWeight: 700, fontSize: 13.5, textDecoration: "none", px: 1 }}>View bag</Box>}
            slotProps={{ content: { sx: { bgcolor: brand.color.ink, color: brand.color.white, borderRadius: `${brand.radius.sm}px`, maxWidth: 460, fontWeight: 600 } } }}
        />
    );
}

export default function SiteLayout() {
    const { pathname } = useLocation();
    useEffect(() => {
        // "instant": the page uses smooth scrolling, which would animate (and can stop short) on a new page.
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <AnnouncementBar />
            <Header />
            <Box component="main" sx={{ flex: 1 }}>
                <Outlet />
            </Box>
            <Footer />
            <WhatsAppButton />
            <ShopToast />
        </Box>
    );
}
