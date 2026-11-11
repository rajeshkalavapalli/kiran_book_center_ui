import { alpha, createTheme } from "@mui/material/styles";

// =========================================================
// KIRAN BOOK CENTER DESIGN SYSTEM · "MODERN COMMERCE"
//
// Crisp white surfaces, near-black ink and ONE confident emerald accent.
// Geometric sans for headings (Sora), a warm readable sans for text (Manrope).
// Every visual value in the app comes from BRAND below. Components read them
// through theme.brand.* and never hard-code colours, fonts or radii.
// The same file is used by the customer site and the admin panel.
// =========================================================

export const BRAND = {
    color: {
        ink: "#0E1116", // headings, primary text, dark surfaces
        inkSoft: "#374151", // body text
        inkMuted: "#6B7280", // secondary text
        inkFaint: "#9CA3AF", // hints, disabled

        bg: "#FFFFFF", // page
        surface: "#F3F5F7", // image wells, soft panels, hover
        surfaceDeep: "#E9ECF0",
        card: "#FFFFFF", // cards and panels (with a hairline border)
        line: "#E6E8EC", // hairline borders
        lineStrong: "#D1D5DB",

        accent: "#0B6E4F", // the one brand colour: primary actions, savings, active states
        accentDark: "#08573E",
        accentMist: "#E8F3EE",

        steel: "#334155", // secondary actions, icons
        steelDark: "#1E293B",
        steelMist: "#F1F5F9",

        amber: "#B45309", // attention: quotes waiting, payments due
        amberDark: "#92400E",
        amberMist: "#FEF3E2",

        success: "#15803D",
        successMist: "#E9F7EE",
        warn: "#C2410C", // low stock
        danger: "#B42318",
        dangerMist: "#FDECEA",
        white: "#FFFFFF",
        onDark: "#7FE0B4", // accent text on dark panels
    },

    // Muted tints for the placeholder shown until a product has a real photo.
    cover: ["#1F3A5F", "#7C2D12", "#4B5563", "#3F3D7A", "#134E4A", "#78350F", "#831843", "#0F172A"],

    font: {
        display: "'Sora', 'Segoe UI', system-ui, sans-serif",
        body: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace",
    },

    radius: { xs: 6, sm: 10, md: 14, lg: 20, pill: 999 },

    shadow: {
        card: "0 1px 2px rgba(14,17,22,0.04), 0 4px 16px -8px rgba(14,17,22,0.10)",
        lift: "0 2px 4px rgba(14,17,22,0.05), 0 16px 40px -16px rgba(14,17,22,0.22)",
        book: "0 1px 2px rgba(14,17,22,0.10), 0 10px 24px -12px rgba(14,17,22,0.35)",
    },

    motion: { fast: "150ms cubic-bezier(.2,.7,.3,1)", base: "220ms cubic-bezier(.2,.7,.3,1)" },

    layout: { maxWidth: 1280, gutter: { xs: 2, md: 4 } },
};

// Builds the MUI theme from a brand token set.
function makeTheme(BRAND) {
const c = BRAND.color;

const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: c.accent, dark: c.accentDark, light: c.accentMist, contrastText: c.white },
        secondary: { main: c.ink, dark: "#000000", light: c.steelMist, contrastText: c.white },
        success: { main: c.success, light: c.successMist },
        warning: { main: c.warn },
        error: { main: c.danger },
        text: { primary: c.ink, secondary: c.inkMuted, disabled: c.inkFaint },
        background: { default: c.bg, paper: c.card },
        divider: c.line,
    },
    shape: { borderRadius: BRAND.radius.sm },
    typography: {
        fontFamily: BRAND.font.body,
        fontSize: 14,
        h1: { fontFamily: BRAND.font.display, fontWeight: 600, fontSize: "clamp(2rem, 4.2vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.03em" },
        h2: { fontFamily: BRAND.font.display, fontWeight: 600, fontSize: "clamp(1.5rem, 2.6vw, 2rem)", lineHeight: 1.15, letterSpacing: "-0.02em" },
        h3: { fontFamily: BRAND.font.display, fontWeight: 600, fontSize: "clamp(1.25rem, 2vw, 1.5rem)", lineHeight: 1.2, letterSpacing: "-0.015em" },
        h4: { fontFamily: BRAND.font.display, fontWeight: 600, fontSize: "1.2rem", lineHeight: 1.25, letterSpacing: "-0.01em" },
        h5: { fontFamily: BRAND.font.display, fontWeight: 600, fontSize: "1.02rem", lineHeight: 1.3 },
        h6: { fontFamily: BRAND.font.body, fontWeight: 700, fontSize: "0.95rem" },
        subtitle1: { fontSize: "1.05rem", lineHeight: 1.65, color: c.inkSoft },
        body1: { fontSize: "0.95rem", lineHeight: 1.65 },
        body2: { fontSize: "0.875rem", lineHeight: 1.6 },
        caption: { fontSize: "0.78rem", lineHeight: 1.5 },
        overline: { fontFamily: BRAND.font.body, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", lineHeight: 1.6 },
        button: { fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: c.bg, color: c.ink, WebkitFontSmoothing: "antialiased" },
                "::selection": { backgroundColor: alpha(c.accent, 0.18) },
                a: { color: "inherit" },
                img: { maxWidth: "100%", display: "block" },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: BRAND.radius.sm, paddingInline: 18, minHeight: 42, transition: `background-color ${BRAND.motion.fast}, border-color ${BRAND.motion.fast}, transform ${BRAND.motion.fast}` },
                sizeLarge: { minHeight: 50, paddingInline: 26, fontSize: "0.98rem" },
                sizeSmall: { minHeight: 34, paddingInline: 12 },
                contained: { "&:active": { transform: "translateY(1px)" } },
                outlined: { borderColor: c.lineStrong, color: c.ink, backgroundColor: c.card, "&:hover": { borderColor: c.ink, backgroundColor: c.card } },
                text: { "&:hover": { backgroundColor: c.surface } },
            },
        },
        MuiIconButton: { styleOverrides: { root: { borderRadius: BRAND.radius.sm, color: c.ink } } },
        MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: "none" }, outlined: { borderColor: c.line } } },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: c.card,
                    borderRadius: BRAND.radius.sm,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: c.lineStrong },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.inkMuted },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: c.accent, borderWidth: 1.5 },
                    "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(c.accent, 0.12)}` },
                },
            },
        },
        MuiChip: { styleOverrides: { root: { borderRadius: BRAND.radius.pill, fontWeight: 600 } } },
        MuiBadge: { styleOverrides: { badge: { fontWeight: 700, fontSize: 11, minWidth: 18, height: 18 } } },
        MuiCheckbox: { styleOverrides: { root: { color: c.lineStrong, "&.Mui-checked": { color: c.accent } } } },
        MuiRadio: { styleOverrides: { root: { "&.Mui-checked": { color: c.accent } } } },
        MuiSwitch: { styleOverrides: { switchBase: { "&.Mui-checked": { color: c.white, "& + .MuiSwitch-track": { backgroundColor: c.accent, opacity: 1 } } } } },
        MuiLink: { defaultProps: { underline: "hover" }, styleOverrides: { root: { color: c.accent, fontWeight: 700 } } },
        MuiDivider: { styleOverrides: { root: { borderColor: c.line } } },
        MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: c.ink, fontSize: 12, borderRadius: BRAND.radius.xs } } },
        MuiDrawer: { styleOverrides: { paper: { backgroundColor: c.bg } } },
        MuiToggleButton: { styleOverrides: { root: { borderColor: c.lineStrong, color: c.inkSoft, "&.Mui-selected": { backgroundColor: c.ink, color: c.white, "&:hover": { backgroundColor: c.ink } } } } },
        MuiDialog: { styleOverrides: { paper: { borderRadius: BRAND.radius.md } } },
        MuiTab: { styleOverrides: { root: { "&.Mui-selected": { color: c.ink } } } },
        MuiTabs: { styleOverrides: { indicator: { backgroundColor: c.accent, height: 2.5 } } },
        MuiAlert: { styleOverrides: { root: { borderRadius: BRAND.radius.sm } } },
    },
});

theme.brand = BRAND;
return theme;
}

// "Ivory and oxblood": the same system with warm paper tones, an oxblood accent and serif headings.
// Matches the admin panel. This is the site's live theme (chosen 2026-11-10); BRAND above is the
// earlier "Modern commerce" green set, kept as the base the ivory tokens build on.
export const IVORY = {
    ...BRAND,
    color: {
        ...BRAND.color,
        ink: "#1B1712",
        inkSoft: "#3D362D",
        inkMuted: "#6F6658",
        inkFaint: "#A39886",
        bg: "#FBF8F2",
        surface: "#F4EEE4",
        surfaceDeep: "#EAE1D2",
        card: "#FFFFFF",
        line: "#E6DDCE",
        lineStrong: "#D3C7B3",
        accent: "#7A1F2B",
        accentDark: "#5E1621",
        accentMist: "#F5E8E7",
        steel: "#4A4238",
        steelDark: "#2E2820",
        steelMist: "#F1ECE3",
        amber: "#A3650F",
        amberDark: "#7D4B08",
        amberMist: "#FAEFD9",
        success: "#2F7A4D",
        successMist: "#E7F2E9",
        warn: "#B4501A",
        danger: "#C0362C",
        dangerMist: "#FBEAE6",
        onDark: "#D9B76E",
    },
    font: { ...BRAND.font, display: "'Fraunces', 'Iowan Old Style', Georgia, serif" },
    shadow: {
        card: "0 1px 2px rgba(60,40,20,0.05), 0 4px 16px -8px rgba(60,40,20,0.12)",
        lift: "0 2px 4px rgba(60,40,20,0.06), 0 16px 40px -16px rgba(60,40,20,0.26)",
        book: "0 1px 2px rgba(60,40,20,0.10), 0 10px 24px -12px rgba(60,40,20,0.35)",
    },
};

const theme = makeTheme(IVORY);
export default theme;
