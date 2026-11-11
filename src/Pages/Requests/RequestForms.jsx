import { useRef, useState } from "react";
import { Box, Button, IconButton, Link, Radio, RadioGroup, FormControlLabel, TextField, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { AddressFields, Field, FormError, MobileField, emptyAddress } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { ATTACHMENT_RULES, submitRequest } from "../../services/requests";

// Index-card shell shared by both forms.
function IndexCard({ kicker, title, intro, children }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ position: "relative", bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.lg}px`, boxShadow: brand.shadow.card, overflow: "hidden" }}>
            <Box sx={{ px: { xs: 2.5, sm: 4 }, pt: 2.5, pb: 2.5, borderBottom: `1px solid ${brand.color.line}` }}>
                <Typography variant="overline" sx={{ color: brand.color.accent }}>{kicker}</Typography>
                <Typography variant="h2" component="h1" sx={{ mt: 1 }}>{title}</Typography>
                <Typography sx={{ color: brand.color.inkSoft, mt: 1, maxWidth: 560 }}>{intro}</Typography>
            </Box>
            <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3.5 }}>{children}</Box>
        </Box>
    );
}

function SignInFirst({ what }) {
    const { brand } = useTheme();
    const location = `${window.location.pathname}${window.location.search}`;
    return (
        <Box sx={{ p: 2.5, borderRadius: `${brand.radius.md}px`, bgcolor: brand.color.steelMist, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ color: brand.color.steelDark, maxWidth: 460 }}>
                Sign in or create a free account to send {what}. That way you can follow the quote and delivery from your account.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button component={RouterLink} to={`/login?next=${encodeURIComponent(location)}`} variant="contained" color="secondary">Sign in</Button>
                <Button component={RouterLink} to={`/login?mode=register&next=${encodeURIComponent(location)}`} variant="outlined" sx={{ bgcolor: brand.color.card }}>Register</Button>
            </Box>
        </Box>
    );
}

function FulfilmentPicker({ value, onChange, address, setAddress, showContact }) {
    return (
        <Box>
            <RadioGroup row value={value} onChange={(e) => onChange(e.target.value)} sx={{ gap: 2, mb: value === "DELIVERY" ? 2 : 0 }}>
                <FormControlLabel value="PICKUP" control={<Radio size="small" />} label="I'll pick it up from the shop" />
                <FormControlLabel value="DELIVERY" control={<Radio size="small" />} label="Deliver it to me" />
            </RadioGroup>
            {value === "DELIVERY" && <AddressFields value={address} onChange={setAddress} showContact={showContact} />}
        </Box>
    );
}

function Done({ request }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ textAlign: "center", py: 3 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.5, height: 32, borderRadius: `${brand.radius.pill}px`, bgcolor: brand.color.accentMist, color: brand.color.accentDark, fontFamily: brand.font.mono, fontSize: 14 }}>
                {request.RequestNo}
            </Box>
            <Typography variant="h3" sx={{ mt: 3 }}>Got it. We're on it.</Typography>
            <Typography sx={{ color: brand.color.inkSoft, mt: 1, maxWidth: 440, mx: "auto" }}>
                We'll check with our suppliers and send you a quote, usually within one working day. You'll see it in your account.
            </Typography>
            <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                <Button component={RouterLink} to={`/account/requests/${request.RequestNo}`} variant="contained">View request</Button>
                <Button component={RouterLink} to="/shop" variant="outlined">Back to the shop</Button>
            </Box>
        </Box>
    );
}

/* ---------------- Single book request ---------------- */
export function RequestBook() {
    const { brand } = useTheme();
    const { customer } = useAuth();
    const [params] = useSearchParams();
    const [item, setItem] = useState({ Title: params.get("title") || "", Author: "", Publisher: "", ClassLevel: "", Qty: 1 });
    const [note, setNote] = useState("");
    const [fulfilment, setFulfilment] = useState("PICKUP");
    const [address, setAddress] = useState(emptyAddress);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);

    const set = (key) => (e) => setItem({ ...item, [key]: e.target.value });
    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            setDone(
                await submitRequest({ customerId: customer.CustomerId, requestType: "SINGLE", contactName: customer.Name, mobile: customer.Mobile, email: customer.Email, items: [item], note, fulfilment, address })
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Shell sx={{ py: { xs: 4, md: 7 } }}>
            <Box sx={{ maxWidth: 760, mx: "auto" }}>
                <IndexCard kicker="Book request" title="Request a book" intro="Tell us what you're looking for. We'll find it, send you a price, and keep you posted until it's in your hands.">
                    {done ? (
                        <Done request={done} />
                    ) : !customer ? (
                        <SignInFirst what="a request" />
                    ) : (
                        <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 2.5 }}>
                            <Field label="Book title" name="r-title" required value={item.Title} onChange={set("Title")} placeholder="E.g. Indian Polity for Civil Services" />
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <Field label="Author" name="r-author" value={item.Author} onChange={set("Author")} />
                                <Field label="Publisher" name="r-publisher" value={item.Publisher} onChange={set("Publisher")} />
                                <Field label="Class / exam / edition" name="r-class" value={item.ClassLevel} onChange={set("ClassLevel")} placeholder="E.g. Class 9, 2026 edition" />
                                <Field label="Quantity" name="r-qty" type="number" value={item.Qty} onChange={(e) => setItem({ ...item, Qty: Math.max(1, Math.min(999, Number(e.target.value) || 1)) })} slotProps={{ htmlInput: { min: 1, max: 999 } }} />
                            </Box>
                            <Field label="Anything else?" name="r-note" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="E.g. any edition is fine, or I need it before a date" />
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: brand.color.inkSoft, mb: 0.5 }}>When it arrives</Typography>
                                <FulfilmentPicker value={fulfilment} onChange={setFulfilment} address={address} setAddress={setAddress} showContact={false} />
                            </Box>
                            <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>
                                Sending as <strong>{customer.Name}</strong> · +91 {customer.Mobile}
                            </Typography>
                            <FormError message={error} />
                            <Box><Button type="submit" variant="contained" color="secondary" size="large" disabled={busy}>{busy ? "Sending…" : "Send request"}</Button></Box>
                        </Box>
                    )}
                </IndexCard>
                <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: brand.color.inkMuted }}>
                    Buying for a school or class? <Link component={RouterLink} to="/school-orders">Send a full book list instead</Link>
                </Typography>
            </Box>
        </Shell>
    );
}

/* ---------------- School & college bulk enquiry ---------------- */
const blankLine = () => ({ Title: "", ClassLevel: "", Publisher: "", Qty: "" });

export function SchoolOrders() {
    const { brand } = useTheme();
    const navigate = useNavigate();
    const { customer } = useAuth();
    const fileRef = useRef(null);
    const [info, setInfo] = useState({ institutionName: "", institutionGstin: "", contactName: customer?.Name || "", mobile: customer?.Mobile || "", email: customer?.Email || "" });
    const [lines, setLines] = useState([blankLine(), blankLine(), blankLine()]);
    const [files, setFiles] = useState([]);
    const [note, setNote] = useState("");
    const [fulfilment, setFulfilment] = useState("DELIVERY");
    const [address, setAddress] = useState(emptyAddress);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(null);

    const setLine = (i, key, value) => setLines((ls) => ls.map((l, n) => (n === i ? { ...l, [key]: value } : l)));
    const addFiles = (list) => {
        setError("");
        const picked = [...list];
        const bad = picked.find((f) => !ATTACHMENT_RULES.types.includes(f.type) || f.size > ATTACHMENT_RULES.maxBytes);
        if (bad) return setError(`"${bad.name}" can't be used. Please upload ${ATTACHMENT_RULES.label}.`);
        setFiles((fs) => [...fs, ...picked.map((f) => ({ FileName: f.name, size: f.size, file: f }))].slice(0, ATTACHMENT_RULES.maxFiles));
        return undefined;
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const items = lines.filter((l) => l.Title.trim()).map((l) => ({ ...l, Qty: Number(l.Qty) || 0 }));
            setDone(await submitRequest({ customerId: customer.CustomerId, requestType: "BULK", ...info, items, note, fulfilment, address, attachments: files }));
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const cell = { "& .MuiOutlinedInput-root": { bgcolor: "transparent" } };

    return (
        <Shell sx={{ py: { xs: 4, md: 7 } }}>
            <Box sx={{ maxWidth: 920, mx: "auto" }}>
                <IndexCard
                    kicker="Schools, colleges and coaching centres"
                    title="Send us your book list"
                    intro="One list, one quote, one delivery. Type the books below or upload a photo of the school's list. We reply with prices and a delivery date, and a GST invoice in your institution's name."
                >
                    {done ? (
                        <Done request={done} />
                    ) : !customer ? (
                        <SignInFirst what="an enquiry" />
                    ) : (
                        <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gap: 3.5 }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <Field label="School / college name" name="s-inst" required value={info.institutionName} onChange={(e) => setInfo({ ...info, institutionName: e.target.value })} />
                                <Field label="GSTIN (optional)" name="s-gstin" value={info.institutionGstin} onChange={(e) => setInfo({ ...info, institutionGstin: e.target.value.toUpperCase().slice(0, 15) })} hint="For a GST invoice in the institution's name." slotProps={{ htmlInput: { style: { fontFamily: brand.font.mono } } }} />
                                <Field label="Contact person" name="s-contact" required value={info.contactName} onChange={(e) => setInfo({ ...info, contactName: e.target.value })} />
                                <MobileField label="Contact mobile" name="s-mobile" required value={info.mobile} onChange={(v) => setInfo({ ...info, mobile: v })} />
                                <Field label="Email (optional)" name="s-email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                            </Box>

                            <Box>
                                <Typography variant="h5" component="h2" sx={{ mb: 1.25 }}>Books &amp; items</Typography>
                                <Box sx={{ border: `1px solid ${brand.color.lineStrong}`, borderRadius: `${brand.radius.sm}px`, overflow: "hidden" }}>
                                    <Box sx={{ display: { xs: "none", sm: "grid" }, gridTemplateColumns: "34px 2fr 1fr 1fr 90px 40px", gap: 1, px: 1.5, py: 1, bgcolor: brand.color.surface, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: brand.color.inkMuted }}>
                                        <span>#</span><span>Title</span><span>Class</span><span>Publisher</span><span>Qty</span><span />
                                    </Box>
                                    {lines.map((l, i) => (
                                        <Box key={i} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 80px 36px", sm: "34px 2fr 1fr 1fr 90px 40px" }, gap: 1, alignItems: "center", px: 1.5, py: 1, borderTop: i ? `1px solid ${brand.color.steelMist}` : 0 }}>
                                            <Box sx={{ display: { xs: "none", sm: "block" }, fontFamily: brand.font.mono, fontSize: 12.5, color: brand.color.inkMuted }}>{String(i + 1).padStart(2, "0")}</Box>
                                            <TextField size="small" placeholder="Book title" value={l.Title} onChange={(e) => setLine(i, "Title", e.target.value)} sx={{ ...cell, gridColumn: { xs: "1 / 2", sm: "auto" } }} slotProps={{ htmlInput: { "aria-label": `Line ${i + 1} title` } }} />
                                            <TextField size="small" placeholder="Class" value={l.ClassLevel} onChange={(e) => setLine(i, "ClassLevel", e.target.value)} sx={{ ...cell, display: { xs: "none", sm: "flex" } }} slotProps={{ htmlInput: { "aria-label": `Line ${i + 1} class` } }} />
                                            <TextField size="small" placeholder="Publisher" value={l.Publisher} onChange={(e) => setLine(i, "Publisher", e.target.value)} sx={{ ...cell, display: { xs: "none", sm: "flex" } }} slotProps={{ htmlInput: { "aria-label": `Line ${i + 1} publisher` } }} />
                                            <TextField size="small" placeholder="Qty" type="number" value={l.Qty} onChange={(e) => setLine(i, "Qty", e.target.value.replace(/\D/g, "").slice(0, 6))} sx={cell} slotProps={{ htmlInput: { min: 1, "aria-label": `Line ${i + 1} quantity` } }} />
                                            <Tooltip title="Remove line">
                                                <span>
                                                    <IconButton size="small" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((_, n) => n !== i))} aria-label={`Remove line ${i + 1}`}>
                                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                </Box>
                                <Button startIcon={<AddRoundedIcon />} onClick={() => setLines((ls) => [...ls, blankLine()])} sx={{ mt: 1, color: brand.color.steel }}>Add a line</Button>
                            </Box>

                            <Box>
                                <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>Or upload the list</Typography>
                                <Typography variant="body2" sx={{ color: brand.color.inkMuted, mb: 1.25 }}>A clear photo or PDF of the school's book list works fine. {ATTACHMENT_RULES.label}, up to {ATTACHMENT_RULES.maxFiles} files.</Typography>
                                <Box
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        addFiles(e.dataTransfer.files);
                                    }}
                                    sx={{ p: 3, border: `1.5px dashed ${brand.color.lineStrong}`, borderRadius: `${brand.radius.md}px`, textAlign: "center", bgcolor: brand.color.bg }}
                                >
                                    <UploadFileRoundedIcon sx={{ color: brand.color.inkMuted, fontSize: 30 }} />
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        Drag the file here, or{" "}
                                        <Link component="button" type="button" onClick={() => fileRef.current?.click()} sx={{ fontSize: "inherit", verticalAlign: "baseline" }}>choose a file</Link>
                                    </Typography>
                                    <input ref={fileRef} type="file" hidden multiple accept={ATTACHMENT_RULES.types.join(",")} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                                </Box>
                                {files.length > 0 && (
                                    <Box sx={{ mt: 1.25, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {files.map((f, i) => (
                                            <Box key={i} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, pl: 1.25, pr: 0.5, py: 0.25, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.xs}px`, fontSize: 13, bgcolor: brand.color.card }}>
                                                {f.FileName}
                                                <IconButton size="small" onClick={() => setFiles((fs) => fs.filter((_, n) => n !== i))} aria-label={`Remove ${f.FileName}`}><CloseRoundedIcon sx={{ fontSize: 15 }} /></IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            <Box>
                                <Typography variant="h5" component="h2" sx={{ mb: 1 }}>Delivery</Typography>
                                <FulfilmentPicker value={fulfilment} onChange={setFulfilment} address={address} setAddress={setAddress} showContact={false} />
                            </Box>

                            <Field label="Notes (optional)" name="s-note" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sections, required-by date, preferred publishers…" />
                            <FormError message={error} />
                            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                                <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</Button>
                                <Button onClick={() => navigate(-1)} sx={{ color: brand.color.inkMuted }}>Cancel</Button>
                            </Box>
                        </Box>
                    )}
                </IndexCard>
            </Box>
        </Shell>
    );
}
