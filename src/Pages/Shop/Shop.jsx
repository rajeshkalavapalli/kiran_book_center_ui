import { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Checkbox, Chip, Drawer, FormControlLabel, IconButton, Link, MenuItem, Select, Skeleton, Slider, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import ProductCard from "../../components/ProductCard/ProductCard";
import { ProductGrid, Shell } from "../../components/Common/Common";
import { SORTS, categoryById, categoryBySlug, childCategories, getFacets, getProducts, topCategories } from "../../services/catalogue";
import { PRODUCT_TYPE_LABEL, rupees } from "../../configurations/format";

// All filters live in the URL (?category=&q=&type=&class=&board=&stock=1&net=1&min=&max=&sort=),
// so a filtered page can be shared on WhatsApp or bookmarked.
const readFilters = (p) => ({
    q: p.get("q") || "",
    category: p.get("category") || "",
    types: p.getAll("type"),
    classLevel: p.get("class") || "",
    board: p.get("board") || "",
    inStock: p.get("stock") === "1",
    netOnly: p.get("net") === "1",
    minPrice: p.get("min") ? Number(p.get("min")) : null,
    maxPrice: p.get("max") ? Number(p.get("max")) : null,
    sort: p.get("sort") || "relevance",
});

function FilterGroup({ title, children }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ py: 2.25, borderTop: `1px solid ${brand.color.line}` }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: brand.color.inkMuted, mb: 1.25 }}>{title}</Typography>
            {children}
        </Box>
    );
}

function Filters({ filters, update, facets }) {
    const { brand } = useTheme();
    const current = filters.category ? categoryBySlug(filters.category) : null;
    const parent = current?.ParentCategoryId ? categoryById(current.ParentCategoryId) : current;
    const [price, setPrice] = useState([filters.minPrice ?? facets.minPrice, filters.maxPrice ?? facets.maxPrice]);
    useEffect(() => {
        setPrice([filters.minPrice ?? facets.minPrice, filters.maxPrice ?? facets.maxPrice]);
    }, [filters.minPrice, filters.maxPrice, facets]);

    const catLink = (cat, depth) => {
        const on = filters.category === cat.Slug;
        return (
            <Box
                key={cat.Slug}
                component="button"
                type="button"
                onClick={() => update({ category: on && depth === 1 ? parent?.Slug || null : cat.Slug })}
                sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    bgcolor: "transparent",
                    cursor: "pointer",
                    fontFamily: brand.font.body,
                    fontSize: depth ? 13.5 : 14.5,
                    fontWeight: on ? 700 : depth ? 500 : 600,
                    color: on ? brand.color.accent : brand.color.ink,
                    py: 0.6,
                    pl: depth ? 1.75 : 0,
                    borderLeft: depth ? `1px solid ${on ? brand.color.accent : brand.color.line}` : 0,
                    "&:hover": { color: brand.color.accent },
                }}
            >
                {cat.Name}
            </Box>
        );
    };

    return (
        <Box>
            <FilterGroup title="Category">
                {catLink({ Slug: "", Name: "Everything" }, 0)}
                {topCategories().map((cat) => (
                    <Box key={cat.Slug}>
                        {catLink(cat, 0)}
                        {parent?.CategoryId === cat.CategoryId && <Box sx={{ mb: 0.5 }}>{childCategories(cat.CategoryId).map((ch) => catLink(ch, 1))}</Box>}
                    </Box>
                ))}
            </FilterGroup>

            <FilterGroup title="Type">
                {Object.entries(PRODUCT_TYPE_LABEL).map(([key, label]) => (
                    <FormControlLabel
                        key={key}
                        sx={{ display: "flex", m: 0, "& .MuiFormControlLabel-label": { fontSize: 14 } }}
                        control={
                            <Checkbox
                                size="small"
                                checked={filters.types.includes(key)}
                                onChange={(e) => update({ type: e.target.checked ? [...filters.types, key] : filters.types.filter((t) => t !== key) })}
                            />
                        }
                        label={label}
                    />
                ))}
            </FilterGroup>

            <FilterGroup title="Class / year">
                <Select size="small" fullWidth displayEmpty value={filters.classLevel} onChange={(e) => update({ class: e.target.value || null })}>
                    <MenuItem value="">Any class</MenuItem>
                    {facets.classLevels.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                </Select>
                <Select size="small" fullWidth displayEmpty value={filters.board} onChange={(e) => update({ board: e.target.value || null })} sx={{ mt: 1.25 }}>
                    <MenuItem value="">Any board</MenuItem>
                    {facets.boards.map((b) => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                </Select>
            </FilterGroup>

            <FilterGroup title="Price">
                <Box sx={{ px: 1 }}>
                    <Slider
                        value={price}
                        min={facets.minPrice}
                        max={facets.maxPrice}
                        step={10}
                        onChange={(_, v) => setPrice(v)}
                        onChangeCommitted={(_, v) => update({ min: v[0] > facets.minPrice ? v[0] : null, max: v[1] < facets.maxPrice ? v[1] : null })}
                        getAriaLabel={(i) => (i ? "Highest price" : "Lowest price")}
                        valueLabelDisplay="auto"
                        valueLabelFormat={rupees}
                        sx={{ color: brand.color.ink }}
                    />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: brand.color.inkMuted }}>
                    <span>{rupees(price[0])}</span>
                    <span>{rupees(price[1])}</span>
                </Box>
            </FilterGroup>

            <FilterGroup title="Show only">
                <FormControlLabel sx={{ display: "flex", m: 0, "& .MuiFormControlLabel-label": { fontSize: 14 } }} control={<Checkbox size="small" checked={filters.inStock} onChange={(e) => update({ stock: e.target.checked ? "1" : null })} />} label="In stock" />
                <FormControlLabel sx={{ display: "flex", m: 0, "& .MuiFormControlLabel-label": { fontSize: 14 } }} control={<Checkbox size="small" checked={filters.netOnly} onChange={(e) => update({ net: e.target.checked ? "1" : null })} />} label="Net price items" />
            </FilterGroup>
        </Box>
    );
}

export default function Shop() {
    const { brand, breakpoints } = useTheme();
    const isDesktop = useMediaQuery(breakpoints.up("md"));
    const [params, setParams] = useSearchParams();
    const filters = useMemo(() => readFilters(params), [params]);
    const facets = useMemo(() => getFacets(), []);
    const [result, setResult] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        let live = true;
        setResult(null);
        getProducts(filters).then((r) => live && setResult(r));
        return () => {
            live = false;
        };
    }, [filters]);

    // Patch the URL: null/empty removes a key, arrays become repeated keys.
    const update = (patch) => {
        const next = new URLSearchParams(params);
        Object.entries(patch).forEach(([key, value]) => {
            next.delete(key);
            if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
            else if (value !== null && value !== undefined && value !== "") next.set(key, value);
        });
        setParams(next, { replace: false });
    };

    const category = filters.category ? categoryBySlug(filters.category) : null;
    const parent = category?.ParentCategoryId ? categoryById(category.ParentCategoryId) : null;
    const title = filters.q ? `Results for “${filters.q}”` : category?.Name || "The whole shop";

    const chips = [
        ...filters.types.map((t) => ({ label: PRODUCT_TYPE_LABEL[t], clear: { type: filters.types.filter((x) => x !== t) } })),
        filters.classLevel && { label: filters.classLevel, clear: { class: null } },
        filters.board && { label: filters.board, clear: { board: null } },
        (filters.minPrice != null || filters.maxPrice != null) && { label: `${rupees(filters.minPrice ?? facets.minPrice)} – ${rupees(filters.maxPrice ?? facets.maxPrice)}`, clear: { min: null, max: null } },
        filters.inStock && { label: "In stock", clear: { stock: null } },
        filters.netOnly && { label: "Net price", clear: { net: null } },
    ].filter(Boolean);

    return (
        <Shell sx={{ pt: { xs: 3, md: 4.5 } }}>
            <Breadcrumbs sx={{ fontSize: 13, mb: 1.5 }}>
                <Link component={RouterLink} to="/" sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>Home</Link>
                <Link component={RouterLink} to="/shop" sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>Shop</Link>
                {parent && <Link component={RouterLink} to={`/shop?category=${parent.Slug}`} sx={{ color: brand.color.inkMuted, fontWeight: 500 }}>{parent.Name}</Link>}
                {category && <Typography sx={{ fontSize: 13, color: brand.color.ink }}>{category.Name}</Typography>}
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap", pb: 2.5, borderBottom: `1px solid ${brand.color.line}` }}>
                <Box>
                    <Typography variant="h2" component="h1">{title}</Typography>
                    {category?.Description && !filters.q && <Typography sx={{ color: brand.color.inkMuted, mt: 0.75 }}>{category.Description}</Typography>}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    {!isDesktop && (
                        <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => setSheetOpen(true)} sx={{ bgcolor: brand.color.card }}>
                            Filters{chips.length ? ` (${chips.length})` : ""}
                        </Button>
                    )}
                    <Select size="small" value={filters.sort} onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })} inputProps={{ "aria-label": "Sort by" }} sx={{ minWidth: 190 }}>
                        {Object.entries(SORTS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr" }, gap: { md: 5 }, mt: { xs: 2, md: 1 } }}>
                {isDesktop && (
                    <Box component="aside" aria-label="Filters" sx={{ position: "sticky", top: 130, alignSelf: "start", maxHeight: "calc(100vh - 150px)", overflowY: "auto", pr: 1 }}>
                        <Filters filters={filters} update={update} facets={facets} />
                    </Box>
                )}

                <Box sx={{ minWidth: 0, pt: { md: 2.25 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2.5, minHeight: 32 }}>
                        <Typography sx={{ fontSize: 13.5, color: brand.color.inkMuted, mr: 1 }}>
                            {result ? `${result.total} ${result.total === 1 ? "item" : "items"}` : "Loading…"}
                        </Typography>
                        {chips.map((c) => (
                            <Chip key={c.label} label={c.label} size="small" onDelete={() => update(c.clear)} sx={{ bgcolor: brand.color.card, border: `1px solid ${brand.color.lineStrong}` }} />
                        ))}
                        {chips.length > 1 && (
                            <Button size="small" onClick={() => setParams(new URLSearchParams(filters.category ? { category: filters.category } : {}))} sx={{ color: brand.color.steel }}>
                                Clear all
                            </Button>
                        )}
                    </Box>

                    {!result ? (
                        <ProductGrid dense>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Box key={i}>
                                    <Skeleton variant="rounded" sx={{ aspectRatio: "3/4.3", height: "auto" }} />
                                    <Skeleton width="80%" sx={{ mt: 1 }} />
                                    <Skeleton width="40%" />
                                </Box>
                            ))}
                        </ProductGrid>
                    ) : result.total === 0 ? (
                        <Box sx={{ textAlign: "center", py: 8, px: 2, border: `1px dashed ${brand.color.lineStrong}`, borderRadius: `${brand.radius.md}px`, bgcolor: brand.color.card }}>
                            <Typography variant="h3">Nothing on this shelf yet.</Typography>
                            <Typography sx={{ color: brand.color.inkMuted, mt: 1, maxWidth: 440, mx: "auto" }}>
                                Try fewer filters, or tell us what you need. We can usually get it within a few days.
                            </Typography>
                            <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                                <Button variant="outlined" onClick={() => setParams(new URLSearchParams())}>Clear filters</Button>
                                <Button component={RouterLink} to={`/request${filters.q ? `?title=${encodeURIComponent(filters.q)}` : ""}`} variant="contained" color="secondary">
                                    Request this book
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <ProductGrid dense>
                            {result.items.map((p) => (
                                <ProductCard key={p.ProductId} product={p} />
                            ))}
                        </ProductGrid>
                    )}
                </Box>
            </Box>

            {!isDesktop && (
                <Drawer anchor="bottom" open={sheetOpen} onClose={() => setSheetOpen(false)} slotProps={{ paper: { sx: { maxHeight: "86vh", borderRadius: "16px 16px 0 0" } } }}>
                    <Box sx={{ position: "sticky", top: 0, zIndex: 1, bgcolor: brand.color.bg, px: 2.5, pt: 1.5, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${brand.color.line}` }}>
                        <Typography variant="h4">Filters</Typography>
                        <IconButton onClick={() => setSheetOpen(false)} aria-label="Close filters">
                            <CloseRoundedIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ px: 2.5, pb: 2, overflowY: "auto" }}>
                        <Filters filters={filters} update={update} facets={facets} />
                    </Box>
                    <Box sx={{ position: "sticky", bottom: 0, p: 2, bgcolor: brand.color.bg, borderTop: `1px solid ${brand.color.line}` }}>
                        <Button fullWidth variant="contained" size="large" onClick={() => setSheetOpen(false)}>
                            Show {result?.total ?? ""} items
                        </Button>
                    </Box>
                </Drawer>
            )}
        </Shell>
    );
}
