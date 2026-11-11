import { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, InputBase, Skeleton, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import BackpackOutlinedIcon from "@mui/icons-material/BackpackOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import BookCover from "../../components/BookCover/BookCover";
import ProductCard from "../../components/ProductCard/ProductCard";
import PriceTag, { NetBadge, OffBadge } from "../../components/PriceTag/PriceTag";
import { Shell } from "../../components/Common/Common";
import { getHome, getProducts, getSettings, topCategories } from "../../services/catalogue";

// Home page as one scroll story: editorial hero with search → trust ribbon → shop by need →
// exam rail → back-to-school kits → new arrivals → schools and colleges → pricing → visit the store.
// Sections fade up as they come into view (off when the visitor prefers reduced motion).

const CAT_ICON = {
    "competitive-exams": EmojiEventsOutlinedIcon,
    "school-books": SchoolOutlinedIcon,
    "college-books": AccountBalanceOutlinedIcon,
    "general-reading": AutoStoriesOutlinedIcon,
    notebooks: EditNoteRoundedIcon,
    stationery: DrawOutlinedIcon,
    "school-kits": BackpackOutlinedIcon,
};

const prefersReducedMotion = () => {
    try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
};

/* ---------------- Fade-up on scroll ---------------- */
function Reveal({ children, delay = 0, sx }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined" || prefersReducedMotion());
    useEffect(() => {
        if (shown || !ref.current) return undefined;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        );
        io.observe(ref.current);
        return () => {
            io.disconnect();
        };
    }, [shown]);
    return (
        <Box ref={ref} sx={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(28px)", transition: `opacity 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms`, ...sx }}>
            {children}
        </Box>
    );
}

function Kicker({ children, light }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: 12, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: light ? brand.color.onDark : brand.color.accent }}>
            <Box sx={{ width: 20, height: 2, borderRadius: 1, bgcolor: "currentColor" }} />
            {children}
        </Box>
    );
}

function SeeAll({ to, children = "See all" }) {
    const { brand } = useTheme();
    return (
        <Button component={RouterLink} to={to} endIcon={<ArrowForwardRoundedIcon />} sx={{ color: brand.color.ink, flexShrink: 0 }}>
            {children}
        </Button>
    );
}

/* ---------------- 1. Hero ---------------- */
function Hero({ data }) {
    const { brand } = useTheme();
    const c = brand.color;
    const navigate = useNavigate();
    const [q, setQ] = useState("");
    const stageRef = useRef(null);

    // Covers drift a little as the page scrolls (CSS variable, no re-render).
    useEffect(() => {
        if (prefersReducedMotion()) return undefined;
        let frame = 0;
        const onScroll = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (stageRef.current) stageRef.current.style.setProperty("--p", String(Math.min(window.scrollY, 600)));
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const pick = (id) => data?.featured.find((p) => p.ProductId === id) || data?.examDesk.find((p) => p.ProductId === id);
    const covers = data ? ["p03", "p01", "p12"].map(pick).filter(Boolean) : [];
    const chips = [
        ["Class 10", "/shop?q=Class%2010"],
        ["Competitive exams", "/shop?category=competitive-exams"],
        ["Current affairs", "/shop?q=Current%20affairs"],
        ["Notebooks", "/shop?category=notebooks"],
        ["School kits", "/shop?category=school-kits"],
    ];
    const search = (e) => {
        e.preventDefault();
        const term = q.trim();
        navigate(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
    };

    return (
        <Box component="section" sx={{ position: "relative", overflow: "hidden", borderBottom: `1px solid ${c.line}` }}>
            <Box aria-hidden sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(900px 520px at 85% 10%, ${alpha(c.accent, 0.1)}, transparent 65%), radial-gradient(700px 480px at 0% 100%, ${alpha(c.accent, 0.06)}, transparent 70%)` }} />
            <Box
                aria-hidden
                sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage: `radial-gradient(${alpha(c.ink, 0.1)} 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                    maskImage: "radial-gradient(ellipse 55% 60% at 75% 45%, #000 10%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 55% 60% at 75% 45%, #000 10%, transparent 75%)",
                }}
            />
            <Shell sx={{ position: "relative", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" }, gap: { xs: 4, md: 6 }, alignItems: "center", py: { xs: 5, md: 9 } }}>
                <Box>
                    <Reveal>
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.25, height: 30, borderRadius: 99, bgcolor: c.accentMist, color: c.accentDark, fontSize: 12.5, fontWeight: 700 }}>
                            <PlaceOutlinedIcon sx={{ fontSize: 16 }} /> Prakasam Road, Tirupati
                        </Box>
                        <Typography variant="h1" component="h1" sx={{ mt: 2.5, fontSize: "clamp(2.3rem, 4.6vw, 3.75rem)", lineHeight: 1.04, letterSpacing: "-0.045em", maxWidth: 680 }}>
                            Every book on the list.{" "}
                            <Box component="span" sx={{ color: c.accent, display: { md: "block" } }}>
                                One trusted store.
                            </Box>
                        </Typography>
                        <Typography sx={{ mt: 2.5, color: c.inkMuted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.6, maxWidth: 520 }}>
                            Competitive exam guides, school and college textbooks, notebooks and stationery. Delivered across India or ready for pickup at the store.
                        </Typography>
                    </Reveal>

                    <Reveal delay={120}>
                        <Box
                            component="form"
                            onSubmit={search}
                            role="search"
                            sx={{
                                mt: 4,
                                maxWidth: 560,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 0.75,
                                pl: 2,
                                bgcolor: c.white,
                                border: `1px solid ${c.line}`,
                                borderRadius: `${brand.radius.md}px`,
                                boxShadow: brand.shadow.card,
                                transition: `border-color ${brand.motion.fast}, box-shadow ${brand.motion.fast}`,
                                "&:focus-within": { borderColor: c.accent, boxShadow: `0 0 0 4px ${alpha(c.accent, 0.12)}, ${brand.shadow.card}` },
                            }}
                        >
                            <SearchRoundedIcon sx={{ color: c.inkFaint }} />
                            <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, author, ISBN or class" inputProps={{ "aria-label": "Search the catalogue" }} sx={{ flex: 1, fontSize: 15.5 }} />
                            <Button type="submit" variant="contained" sx={{ minHeight: 44, px: { xs: 2, sm: 3 } }}>
                                Search
                            </Button>
                        </Box>
                        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {chips.map(([label, to]) => (
                                <Box
                                    key={label}
                                    component={RouterLink}
                                    to={to}
                                    sx={{ px: 1.5, height: 32, display: "inline-flex", alignItems: "center", borderRadius: 99, border: `1px solid ${c.line}`, bgcolor: alpha(c.white, 0.7), color: c.inkSoft, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: `all ${brand.motion.fast}`, "&:hover": { borderColor: c.accent, color: c.accentDark, bgcolor: c.accentMist } }}
                                >
                                    {label}
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ mt: 3.5, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                            <Button component={RouterLink} to="/shop" size="large" variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: c.ink, "&:hover": { bgcolor: c.steelDark } }}>
                                Shop the catalogue
                            </Button>
                            <Button component={RouterLink} to="/school-orders" size="large" variant="outlined">
                                Send a school list
                            </Button>
                        </Box>
                    </Reveal>
                </Box>

                {/* shelf stage */}
                <Box ref={stageRef} sx={{ "--p": 0, position: "relative", height: { xs: 300, sm: 380, md: 460 }, display: { xs: "none", sm: "block" } }}>
                    <Box aria-hidden sx={{ position: "absolute", left: "8%", right: "8%", bottom: "9%", height: 14, borderRadius: 8, bgcolor: c.surfaceDeep, boxShadow: `0 18px 30px -12px ${alpha(c.ink, 0.25)}` }} />
                    {covers.length === 3 ? (
                        <>
                            <Box sx={{ position: "absolute", width: "38%", left: "8%", bottom: "12%", transform: "rotate(-8deg) translateY(calc(var(--p) * -0.04px))", filter: `drop-shadow(0 18px 24px ${alpha(c.ink, 0.22)})` }}>
                                <BookCover product={covers[0]} compact />
                            </Box>
                            <Box sx={{ position: "absolute", width: "44%", left: "29%", bottom: "13%", zIndex: 2, transform: "rotate(1deg) translateY(calc(var(--p) * -0.09px))", filter: `drop-shadow(0 28px 36px ${alpha(c.ink, 0.3)})` }}>
                                <BookCover product={covers[1]} compact />
                            </Box>
                            <Box sx={{ position: "absolute", width: "36%", right: "7%", bottom: "12%", transform: "rotate(8deg) translateY(calc(var(--p) * -0.05px))", filter: `drop-shadow(0 18px 24px ${alpha(c.ink, 0.22)})` }}>
                                <BookCover product={covers[2]} compact />
                            </Box>
                        </>
                    ) : (
                        <Skeleton variant="rounded" sx={{ position: "absolute", left: "25%", width: "50%", top: "8%", height: "75%", borderRadius: "12px" }} />
                    )}
                    <Box sx={{ position: "absolute", zIndex: 3, top: { sm: "4%", md: "8%" }, right: 0, display: "flex", alignItems: "center", gap: 1.25, px: 1.75, py: 1.25, bgcolor: alpha(c.white, 0.94), backdropFilter: "blur(8px)", border: `1px solid ${c.line}`, borderRadius: `${brand.radius.md}px`, boxShadow: brand.shadow.lift }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: c.accentMist, color: c.accent }}>
                            <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Box sx={{ fontSize: 13, fontWeight: 800 }}>Free store pickup</Box>
                            <Box sx={{ fontSize: 12, color: c.inkMuted }}>Order online, collect in Tirupati</Box>
                        </Box>
                    </Box>
                    <Box sx={{ position: "absolute", zIndex: 3, bottom: 0, left: { sm: "4%", md: 0 }, display: "flex", alignItems: "center", gap: 1.25, px: 1.75, py: 1.25, bgcolor: alpha(c.white, 0.94), backdropFilter: "blur(8px)", border: `1px solid ${c.line}`, borderRadius: `${brand.radius.md}px`, boxShadow: brand.shadow.lift }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: "10px", display: "grid", placeItems: "center", bgcolor: c.accentMist, color: c.accent }}>
                            <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Box sx={{ fontSize: 13, fontWeight: 800 }}>GST invoice on every order</Box>
                            <Box sx={{ fontSize: 12, color: c.inkMuted }}>Download it from your account</Box>
                        </Box>
                    </Box>
                </Box>
            </Shell>
        </Box>
    );
}

/* ---------------- 2. Trust ribbon ---------------- */
function TrustRibbon() {
    const { brand } = useTheme();
    const c = brand.color;
    const items = [
        [StorefrontOutlinedIcon, "Free store pickup", "Prakasam Road, Tirupati"],
        [LocalShippingOutlinedIcon, "Delivery across India", "Rates by delivery zone"],
        [ReceiptLongOutlinedIcon, "GST invoice", "With every order"],
        [GroupsOutlinedIcon, "School and college orders", "One quote for the whole list"],
    ];
    return (
        <Box sx={{ bgcolor: c.surface, borderBottom: `1px solid ${c.line}` }}>
            <Shell sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: { xs: 2.5, md: 0 }, py: { xs: 3, md: 3.5 } }}>
                {items.map(([Icon, t, b], i) => (
                    <Reveal key={t} delay={i * 70}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: { md: 3 }, borderLeft: { md: i ? `1px solid ${c.line}` : 0 } }}>
                            <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: "12px", bgcolor: c.white, color: c.accent, display: "grid", placeItems: "center", boxShadow: "0 1px 2px rgba(14,17,22,0.05)" }}>
                                <Icon sx={{ fontSize: 21 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.3 }}>{t}</Typography>
                                <Typography sx={{ color: c.inkMuted, fontSize: 13 }}>{b}</Typography>
                            </Box>
                        </Box>
                    </Reveal>
                ))}
            </Shell>
        </Box>
    );
}

/* ---------------- 3. Shop by need (bento) ---------------- */
const TILE_TINT = {
    "college-books": ["#EEF2FA", "#2C4A86"],
    "general-reading": ["#F6EFE6", "#8A5A1F"],
    notebooks: ["#F1F5F9", "#334155"],
    stationery: ["#FDF1EC", "#B4501A"],
    "school-kits": ["#FEF7E6", "#92400E"],
};

function ShopByNeed({ data }) {
    const { brand } = useTheme();
    const c = brand.color;
    const cats = topCategories();
    const big = cats.find((x) => x.Slug === "competitive-exams") || cats[0];
    const rest = cats.filter((x) => x !== big);
    const peek = data?.examDesk.slice(0, 2) || [];
    const count = (slug) => data?.counts?.[slug];

    return (
        <Shell component="section" sx={{ mt: { xs: 7, md: 11 } }}>
            <Reveal>
                <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: { xs: 2.5, md: 3.5 } }}>
                    <Box>
                        <Kicker>Browse</Kicker>
                        <Typography variant="h2" sx={{ mt: 1 }}>Shop by what you need</Typography>
                    </Box>
                    <SeeAll to="/shop">All products</SeeAll>
                </Box>
            </Reveal>
            <Box sx={{ display: "grid", gap: { xs: 1.25, md: 1.75 }, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" }, gridAutoRows: { xs: 132, md: 170 } }}>
                <Reveal sx={{ gridColumn: { xs: "span 2", md: "span 2" }, gridRow: "span 2" }}>
                    <Box
                        component={RouterLink}
                        to={`/shop?category=${big.Slug}`}
                        sx={{ position: "relative", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", p: { xs: 2.5, md: 3.5 }, borderRadius: `${brand.radius.lg}px`, bgcolor: c.ink, color: c.white, textDecoration: "none", "&:hover .arr": { transform: "translateX(4px)" }, "&:hover .peek": { transform: "translateY(-8px)" } }}
                    >
                        <Box aria-hidden sx={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", right: -140, top: -160, background: `radial-gradient(closest-side, ${alpha(c.accent, 0.55)}, transparent)` }} />
                        <Box sx={{ position: "relative", display: "flex", alignItems: "center", gap: 1, color: c.onDark, fontSize: 13, fontWeight: 700 }}>
                            <EmojiEventsOutlinedIcon sx={{ fontSize: 20 }} /> {count(big.Slug) ?? "–"} titles in stock
                        </Box>
                        <Box className="peek" aria-hidden sx={{ position: "absolute", right: { xs: 12, md: 28 }, bottom: { xs: -40, md: -30 }, display: { xs: "none", sm: "flex" }, gap: 1.25, transition: `transform ${brand.motion.base}` }}>
                            {peek.map((p, i) => (
                                <Box key={p.ProductId} sx={{ width: { sm: 86, md: 104 }, transform: `rotate(${i ? 6 : -4}deg)`, filter: "drop-shadow(0 16px 24px rgba(0,0,0,.45))" }}>
                                    <BookCover product={p} compact />
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ position: "relative", maxWidth: { sm: "52%" } }}>
                            <Typography variant="h3" sx={{ color: c.white, fontSize: { xs: 22, md: 30 } }}>{big.Name}</Typography>
                            <Typography sx={{ mt: 0.75, color: "rgba(255,255,255,0.7)", fontSize: 14.5 }}>Guides, previous papers and current affairs for the 2026 season.</Typography>
                            <Box sx={{ mt: 2, display: "inline-flex", alignItems: "center", gap: 0.75, fontWeight: 800, fontSize: 14 }}>
                                Explore <ArrowForwardRoundedIcon className="arr" sx={{ fontSize: 18, transition: `transform ${brand.motion.fast}` }} />
                            </Box>
                        </Box>
                    </Box>
                </Reveal>
                {rest.map((cat, i) => {
                    const Icon = CAT_ICON[cat.Slug] || AutoStoriesOutlinedIcon;
                    const [bg, fg] = TILE_TINT[cat.Slug] || [c.accentMist, c.accent];
                    return (
                        <Reveal key={cat.Slug} delay={60 + i * 50}>
                            <Box
                                component={RouterLink}
                                to={`/shop?category=${cat.Slug}`}
                                sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: { xs: 2, md: 2.5 }, borderRadius: `${brand.radius.lg}px`, bgcolor: bg, color: c.ink, textDecoration: "none", border: "1px solid transparent", transition: `transform ${brand.motion.base}, box-shadow ${brand.motion.base}, border-color ${brand.motion.base}`, "&:hover": { transform: "translateY(-4px)", boxShadow: brand.shadow.lift, borderColor: alpha(fg, 0.2) }, "&:hover .arr": { opacity: 1, transform: "none" } }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: c.white, color: fg, display: "grid", placeItems: "center", boxShadow: "0 1px 2px rgba(14,17,22,0.06)" }}>
                                        <Icon />
                                    </Box>
                                    <ArrowForwardRoundedIcon className="arr" sx={{ color: fg, opacity: 0, transform: "translateX(-6px)", transition: `all ${brand.motion.fast}` }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: 14.5, md: 16 }, lineHeight: 1.25 }}>{cat.Name}</Typography>
                                    <Typography sx={{ color: c.inkMuted, fontSize: 13, mt: 0.25 }}>{count(cat.Slug) ?? "–"} items</Typography>
                                </Box>
                            </Box>
                        </Reveal>
                    );
                })}
            </Box>
        </Shell>
    );
}

/* ---------------- Product rail (swipe, arrows on desktop) ---------------- */
function Rail({ kicker, title, to, products }) {
    const { brand } = useTheme();
    const c = brand.color;
    const ref = useRef(null);
    const scrollBy = (dir) => {
        const el = ref.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    };
    const arrow = { width: 42, height: 42, border: `1px solid ${c.line}`, bgcolor: c.white, "&:hover": { borderColor: c.ink, bgcolor: c.white } };
    return (
        <Shell component="section" sx={{ mt: { xs: 7, md: 11 } }}>
            <Reveal>
                <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: { xs: 2.5, md: 3.5 } }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Kicker>{kicker}</Kicker>
                        <Typography variant="h2" sx={{ mt: 1 }}>{title}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton aria-label="Scroll left" onClick={() => scrollBy(-1)} sx={{ ...arrow, display: { xs: "none", md: "inline-flex" } }}>
                            <ChevronLeftRoundedIcon />
                        </IconButton>
                        <IconButton aria-label="Scroll right" onClick={() => scrollBy(1)} sx={{ ...arrow, display: { xs: "none", md: "inline-flex" } }}>
                            <ChevronRightRoundedIcon />
                        </IconButton>
                        <SeeAll to={to} />
                    </Box>
                </Box>
            </Reveal>
            <Reveal delay={80}>
                <Box
                    ref={ref}
                    sx={{
                        display: "grid",
                        gridAutoFlow: "column",
                        gridAutoColumns: { xs: "68%", sm: "40%", md: "calc((100% - 4 * 16px) / 4.4)", lg: "calc((100% - 4 * 18px) / 5)" },
                        gap: { xs: 1.5, md: 2, lg: 2.25 },
                        overflowX: "auto",
                        scrollSnapType: "x mandatory",
                        pb: 1.5,
                        mx: { xs: -2, md: 0 },
                        px: { xs: 2, md: 0 },
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                        "& > *": { scrollSnapAlign: "start" },
                    }}
                >
                    {products
                        ? products.map((p) => (
                              <Box key={p.ProductId} sx={{ minWidth: 0 }}>
                                  <ProductCard product={p} />
                              </Box>
                          ))
                        : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rounded" sx={{ height: 360, borderRadius: "14px" }} />)}
                </Box>
            </Reveal>
        </Shell>
    );
}

/* ---------------- 5. Back to school ---------------- */
function BackToSchool() {
    const { brand } = useTheme();
    const c = brand.color;
    const [kits, setKits] = useState(null);
    const [active, setActive] = useState(0);
    useEffect(() => {
        let live = true;
        getProducts({ category: "school-kits" }).then((r) => {
            if (!live) return;
            const list = Array.isArray(r) ? r : r?.items || r?.products || [];
            setKits(list);
        });
        return () => {
            live = false;
        };
    }, []);
    if (kits && !kits.length) return null;
    const kit = kits?.[active];
    const contents = kit?.Description ? kit.Description.replace(/\.$/, "").split(/,\s*|\s+and\s+/).filter((part) => part && !/^(packed|ready)\b/i.test(part)).slice(0, 5) : [];

    return (
        <Shell component="section" sx={{ mt: { xs: 7, md: 11 } }}>
            <Reveal>
                <Box sx={{ position: "relative", overflow: "hidden", borderRadius: `${brand.radius.lg}px`, bgcolor: c.accentMist, border: `1px solid ${alpha(c.accent, 0.12)}`, p: { xs: 3, md: 6 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 6 }, alignItems: "center" }}>
                    <Box aria-hidden sx={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", left: -160, bottom: -220, bgcolor: alpha(c.accent, 0.06) }} />
                    <Box sx={{ position: "relative" }}>
                        <Kicker>Back to school</Kicker>
                        <Typography variant="h2" sx={{ mt: 1, fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)" }}>The whole class list, in one box.</Typography>
                        <Typography sx={{ mt: 1.5, color: c.inkSoft, maxWidth: 460, lineHeight: 1.65 }}>Ready kits of textbooks, notebooks and stationery, packed and checked against the list. Pick a class to see what is inside.</Typography>
                        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {(kits || []).map((k, i) => (
                                <Box
                                    key={k.ProductId}
                                    component="button"
                                    type="button"
                                    aria-pressed={i === active}
                                    onClick={() => setActive(i)}
                                    sx={{ font: "inherit", cursor: "pointer", px: 1.75, height: 38, borderRadius: 99, fontSize: 13.5, fontWeight: 700, border: `1px solid ${i === active ? c.accent : alpha(c.accent, 0.25)}`, bgcolor: i === active ? c.accent : c.white, color: i === active ? c.white : c.accentDark, transition: `all ${brand.motion.fast}`, "&:focus-visible": { outline: `2px solid ${c.accent}`, outlineOffset: 2 } }}
                                >
                                    {k.ClassLevel || k.Title}
                                </Box>
                            ))}
                            {!kits && <Skeleton variant="rounded" width={220} height={38} sx={{ borderRadius: 99 }} />}
                        </Box>
                    </Box>
                    <Box sx={{ position: "relative" }}>
                        {kit ? (
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "96px 1fr", sm: "130px 1fr" }, gap: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, bgcolor: c.white, borderRadius: `${brand.radius.lg}px`, boxShadow: brand.shadow.lift }}>
                                <BookCover product={kit} compact />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 17 }, lineHeight: 1.3 }}>{kit.Title}</Typography>
                                    {kit.Board && <Typography sx={{ fontSize: 12.5, color: c.inkMuted, mt: 0.25 }}>{kit.Board}</Typography>}
                                    <Box component="ul" sx={{ m: 0, mt: 1.5, p: 0, listStyle: "none", display: "grid", gap: 0.6 }}>
                                        {contents.map((line) => (
                                            <Box component="li" key={line} sx={{ display: "flex", gap: 0.75, fontSize: 13.5, color: c.inkSoft }}>
                                                <CheckRoundedIcon sx={{ fontSize: 17, color: c.accent, mt: "1px" }} />
                                                <span>{line.charAt(0).toUpperCase() + line.slice(1)}</span>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
                                        <PriceTag product={kit} size="md" />
                                        <Button component={RouterLink} to={`/book/${kit.Slug}`} variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
                                            View kit
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Skeleton variant="rounded" height={240} sx={{ borderRadius: `${brand.radius.lg}px` }} />
                        )}
                    </Box>
                </Box>
            </Reveal>
        </Shell>
    );
}

/* ---------------- 7. Schools and colleges ---------------- */
function Institutions() {
    const { brand } = useTheme();
    const c = brand.color;
    const steps = [
        ["01", "Send your book list", "Upload a photo or PDF of the list, or type it in."],
        ["02", "Get one quote", "Prices, availability and a delivery date, usually within one working day."],
        ["03", "Invoice and delivery", "A GST invoice in your institution's name, delivered or ready for pickup."],
    ];
    return (
        <Box component="section" sx={{ mt: { xs: 7, md: 11 }, bgcolor: c.ink, color: c.white, position: "relative", overflow: "hidden" }}>
            <Box aria-hidden sx={{ position: "absolute", inset: 0, background: `radial-gradient(700px 420px at 90% 0%, ${alpha(c.accent, 0.45)}, transparent 70%)` }} />
            <Shell sx={{ position: "relative", py: { xs: 7, md: 10 } }}>
                <Reveal>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr auto" }, gap: 3, alignItems: "end" }}>
                        <Box>
                            <Kicker light>Schools, colleges and coaching centres</Kicker>
                            <Typography variant="h2" sx={{ mt: 1.25, color: c.white, fontSize: "clamp(1.8rem, 3.6vw, 2.9rem)", maxWidth: 680 }}>Buying for a whole class? Send the list, we handle the rest.</Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                            <Button component={RouterLink} to="/school-orders" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: c.white, color: c.ink, "&:hover": { bgcolor: c.accentMist } }}>
                                Start a bulk order
                            </Button>
                            <Button component={RouterLink} to="/request" size="large" sx={{ color: c.white, border: "1.5px solid rgba(255,255,255,0.3)", "&:hover": { borderColor: c.white, bgcolor: "rgba(255,255,255,0.06)" } }}>
                                Request a book
                            </Button>
                        </Box>
                    </Box>
                </Reveal>
                <Box sx={{ mt: { xs: 5, md: 7 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: { xs: 3, md: 4 } }}>
                    {steps.map(([n, t, b], i) => (
                        <Reveal key={n} delay={i * 110}>
                            <Box sx={{ pt: 2.5, borderTop: "1px solid rgba(255,255,255,0.16)" }}>
                                <Box sx={{ fontFamily: brand.font.display, fontSize: 40, fontWeight: 600, letterSpacing: "-0.04em", color: c.onDark, lineHeight: 1 }}>{n}</Box>
                                <Typography sx={{ mt: 1.5, fontWeight: 800, fontSize: 17 }}>{t}</Typography>
                                <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.66)", fontSize: 14.5, lineHeight: 1.6 }}>{b}</Typography>
                            </Box>
                        </Reveal>
                    ))}
                </Box>
            </Shell>
        </Box>
    );
}

/* ---------------- 8. Pricing ---------------- */
function PricingNote() {
    const { brand } = useTheme();
    const c = brand.color;
    return (
        <Shell sx={{ mt: { xs: 7, md: 11 } }}>
            <Reveal>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: { xs: 2.5, md: 4 }, alignItems: "center", p: { xs: 3, md: 4 }, borderRadius: `${brand.radius.lg}px`, border: `1px solid ${c.line}` }}>
                    <Box>
                        <Kicker>Transparent pricing</Kicker>
                        <Typography variant="h3" sx={{ mt: 1 }}>What you see is what you pay.</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                        <Box sx={{ pt: 0.25 }}><OffBadge percent={15} size="lg" /></Box>
                        <Typography variant="body2" sx={{ color: c.inkSoft }}><strong>Discounted titles.</strong> Most guides and general books are sold below the printed MRP, and the saving is shown on every item.</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                        <Box sx={{ pt: 0.25 }}><NetBadge size="lg" /></Box>
                        <Typography variant="body2" sx={{ color: c.inkSoft }}><strong>Net price.</strong> Prescribed government textbooks and a few other titles are sold at the printed price, with no mark-up.</Typography>
                    </Box>
                </Box>
            </Reveal>
        </Shell>
    );
}

/* ---------------- 9. Visit the store ---------------- */
function VisitUs() {
    const { brand } = useTheme();
    const c = brand.color;
    const [s, setS] = useState(null);
    useEffect(() => {
        let live = true;
        getSettings().then((d) => live && setS(d));
        return () => {
            live = false;
        };
    }, []);
    const address = s ? [s["shop.addressLine1"], s["shop.addressLine2"], "Tirupati 517501"].filter(Boolean).join(", ") : "";
    const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Kiran Book Center, 1-2-274 Prakasam Rd, Tirupati 517501")}`;
    const row = (Icon, label, value, href) => (
        <Box sx={{ display: "flex", gap: 1.5, py: 1.75, borderTop: `1px solid ${c.line}` }}>
            <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: "11px", bgcolor: c.accentMist, color: c.accent, display: "grid", placeItems: "center" }}>
                <Icon sx={{ fontSize: 19 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12.5, color: c.inkMuted, fontWeight: 700 }}>{label}</Typography>
                {href ? (
                    <Box component="a" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" sx={{ fontSize: 15, fontWeight: 700, color: c.ink, textDecoration: "none", "&:hover": { color: c.accent } }}>
                        {value}
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{value || <Skeleton width={180} />}</Typography>
                )}
            </Box>
        </Box>
    );
    return (
        <Shell component="section" sx={{ mt: { xs: 7, md: 11 }, mb: { xs: 2, md: 4 } }}>
            <Reveal>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" }, borderRadius: `${brand.radius.lg}px`, overflow: "hidden", border: `1px solid ${c.line}`, bgcolor: c.white }}>
                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        <Kicker>Visit the store</Kicker>
                        <Typography variant="h2" sx={{ mt: 1, mb: 2.5 }}>Come and browse the shelves.</Typography>
                        {row(PlaceOutlinedIcon, "Address", address)}
                        {row(ScheduleOutlinedIcon, "Opening hours", s?.["shop.hours"])}
                        {s && row(CallOutlinedIcon, "Phone", s["shop.phone"], `tel:${String(s["shop.phone"]).replace(/\s/g, "")}`)}
                        <Box sx={{ mt: 2.5, display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                            <Button component="a" href={directions} target="_blank" rel="noopener noreferrer" variant="contained" startIcon={<DirectionsOutlinedIcon />}>
                                Get directions
                            </Button>
                            {s?.["shop.whatsapp"] && (
                                <Button component="a" href={`https://wa.me/${s["shop.whatsapp"]}`} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<WhatsAppIcon sx={{ color: "#1FA855" }} />}>
                                    WhatsApp us
                                </Button>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ position: "relative", minHeight: { xs: 260, md: "100%" }, bgcolor: c.surface }}>
                        {s?.["shop.mapEmbed"] && (
                            <Box component="iframe" title="Kiran Book Center on Google Maps" src={s["shop.mapEmbed"]} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                        )}
                    </Box>
                </Box>
            </Reveal>
        </Shell>
    );
}

export default function Home() {
    const [data, setData] = useState(null);

    useEffect(() => {
        let live = true;
        getHome().then((d) => live && setData(d));
        return () => {
            live = false;
        };
    }, []);

    return (
        <>
            <Hero data={data} />
            <TrustRibbon />
            <ShopByNeed data={data} />
            <Rail kicker="Exam season" title="Top picks for competitive exams" to="/shop?category=competitive-exams" products={data?.examDesk.slice(0, 10)} />
            <BackToSchool />
            <Rail kicker="Just arrived" title="New in store" to="/shop?sort=newest" products={data?.newArrivals} />
            <Institutions />
            <PricingNote />
            <VisitUs />
        </>
    );
}
