import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { formatDate, toneOf } from "../../configurations/shopRules";

// Status pill: soft tint, coloured dot, plain words.
export function StatusStamp({ status, label }) {
    const { brand } = useTheme();
    const c = brand.color;
    const tone = {
        info: ["#1D4ED8", "#EEF3FF"],
        action: [c.amberDark, c.amberMist],
        progress: [c.steelDark, c.steelMist],
        done: [c.accentDark, c.accentMist],
        muted: [c.inkMuted, c.surface],
    }[toneOf(status)];
    return (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.1, height: 24, borderRadius: `${brand.radius.pill}px`, color: tone[0], bgcolor: tone[1], fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: tone[0] }} />
            {label}
        </Box>
    );
}

/**
 * Courier-slip progress: the fixed steps for this order/request, filled up to the current one,
 * with the time each step happened (from the history). Cancelled / rejected show as a final red stamp.
 */
export function StatusTrack({ steps, labels, status, history, endedNote }) {
    const { brand } = useTheme();
    const reachedAt = {};
    history.forEach((h) => {
        if (!reachedAt[h.Status]) reachedAt[h.Status] = h.ChangedOn;
    });
    const ended = status === "CANCELLED" || status === "REJECTED";
    const lastReached = ended ? Math.max(...steps.map((s, i) => (reachedAt[s] ? i : -1))) : steps.indexOf(status);

    return (
        <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {steps.map((step, i) => {
                const done = i <= lastReached;
                const current = !ended && i === lastReached;
                const isLast = i === steps.length - 1 && !ended;
                return (
                    <Box component="li" key={step} sx={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 1.75, position: "relative", pb: isLast ? 0 : 2.5 }}>
                        {!isLast && <Box aria-hidden sx={{ position: "absolute", left: 13, top: 26, bottom: 0, width: "2px", bgcolor: i < lastReached ? brand.color.ink : brand.color.line, ...(i >= lastReached && { backgroundImage: `repeating-linear-gradient(180deg, ${brand.color.lineStrong} 0 4px, transparent 4px 8px)`, bgcolor: "transparent" }) }} />}
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: done ? brand.color.ink : brand.color.card,
                                border: `2px solid ${done ? brand.color.ink : brand.color.lineStrong}`,
                                color: brand.color.bg,
                                boxShadow: current ? `0 0 0 4px ${brand.color.accentMist}` : "none",
                                zIndex: 1,
                            }}
                        >
                            {done && <CheckRoundedIcon sx={{ fontSize: 16 }} />}
                        </Box>
                        <Box sx={{ pt: 0.3 }}>
                            <Typography sx={{ fontWeight: current ? 700 : 600, color: done ? brand.color.ink : brand.color.inkFaint, fontSize: 14.5 }}>{labels[step]}</Typography>
                            {reachedAt[step] && <Typography sx={{ fontFamily: brand.font.mono, fontSize: 11.5, color: brand.color.inkMuted, mt: 0.25 }}>{formatDate(reachedAt[step], true)}</Typography>}
                        </Box>
                    </Box>
                );
            })}
            {ended && (
                <Box component="li" sx={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 1.75, pt: 2.5, borderTop: `1px dashed ${brand.color.lineStrong}`, mt: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: brand.color.danger, color: brand.color.white, fontWeight: 700 }}>×</Box>
                    <Box sx={{ pt: 0.3 }}>
                        <Typography sx={{ fontWeight: 700, color: brand.color.danger, fontSize: 14.5 }}>{labels[status]}</Typography>
                        <Typography sx={{ fontFamily: brand.font.mono, fontSize: 11.5, color: brand.color.inkMuted, mt: 0.25 }}>{formatDate(reachedAt[status], true)}</Typography>
                        {endedNote && <Typography variant="body2" sx={{ color: brand.color.inkSoft, mt: 0.5 }}>{endedNote}</Typography>}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

// Notes from the history (e.g. "Payment received", courier details), newest first.
export function HistoryNotes({ history }) {
    const { brand } = useTheme();
    const notes = history.filter((h) => h.Note).slice().reverse();
    if (!notes.length) return null;
    return (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.25 }}>
            {notes.map((h, i) => (
                <Box component="li" key={i} sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1.5, fontSize: 13.5 }}>
                    <Box sx={{ fontFamily: brand.font.mono, fontSize: 11.5, color: brand.color.inkMuted, pt: 0.25, whiteSpace: "nowrap" }}>{formatDate(h.ChangedOn, true)}</Box>
                    <Box sx={{ color: brand.color.inkSoft }}>{h.Note}</Box>
                </Box>
            ))}
        </Box>
    );
}
