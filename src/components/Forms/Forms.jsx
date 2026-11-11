import { useState } from "react";
import { Alert, Box, IconButton, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import { INDIAN_STATES } from "../../configurations/shopRules";
import { settings } from "../../services/shopData";

// Text field with the label above it (easier to read on phones than floating labels).
// Pass `custom` to place your own control under the label instead of a TextField.
export function Field({ label, hint, error, required, custom, children, ...props }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography component="label" htmlFor={props.id || props.name} sx={{ display: "block", fontSize: 13, fontWeight: 600, color: brand.color.inkSoft, mb: 0.6 }}>
                {label}
                {required && <Box component="span" sx={{ color: brand.color.danger, ml: 0.25 }}>*</Box>}
            </Typography>
            {custom ? (
                children
            ) : (
                <TextField fullWidth size="small" id={props.id || props.name} error={Boolean(error)} helperText={error || hint} {...props}>
                    {children}
                </TextField>
            )}
        </Box>
    );
}

export function PasswordField({ label = "Password", ...props }) {
    const [show, setShow] = useState(false);
    return (
        <Field
            label={label}
            type={show ? "text" : "password"}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} edge="end">
                                {show ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
            {...props}
        />
    );
}

// Mobile number with a fixed +91 prefix; keeps digits only.
export function MobileField({ value, onChange, ...props }) {
    return (
        <Field
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
            slotProps={{ input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> } }}
            {...props}
        />
    );
}

export const emptyAddress = { Name: "", Mobile: "", Line1: "", Line2: "", Landmark: "", City: "", State: "", Pincode: "" };

export function AddressFields({ value, onChange, showContact = true, errors = {} }) {
    const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            {showContact && <Field label="Full name" name="ship-name" autoComplete="name" required value={value.Name} onChange={set("Name")} error={errors.Name} />}
            {showContact && <MobileField label="Mobile number" name="ship-mobile" required value={value.Mobile} onChange={(v) => onChange({ ...value, Mobile: v })} error={errors.Mobile} />}
            <Box sx={{ gridColumn: "1 / -1" }}>
                <Field label="House / flat, street" name="ship-line1" autoComplete="address-line1" required value={value.Line1} onChange={set("Line1")} error={errors.Line1} />
            </Box>
            <Field label="Area / colony" name="ship-line2" autoComplete="address-line2" value={value.Line2} onChange={set("Line2")} />
            <Field label="Landmark" name="ship-landmark" value={value.Landmark} onChange={set("Landmark")} />
            <Field label="City / town" name="ship-city" autoComplete="address-level2" required value={value.City} onChange={set("City")} error={errors.City} />
            <Field
                label="Pincode"
                name="ship-pincode"
                autoComplete="postal-code"
                inputMode="numeric"
                required
                value={value.Pincode}
                onChange={(e) => onChange({ ...value, Pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                error={errors.Pincode}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
                <Field label="State" name="ship-state" required select value={value.State} onChange={set("State")} error={errors.State}>
                    {INDIAN_STATES.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </Field>
            </Box>
        </Box>
    );
}

export function FormError({ message }) {
    if (!message) return null;
    return (
        <Alert severity="error" variant="outlined" sx={{ bgcolor: "#FBEDEA", borderColor: "#E9B8AE" }}>
            {message}
        </Alert>
    );
}

// Shop's UPI and bank details, shown after a "Pay later via UPI" order and on accepted quotes.
// Values come from ShopSettings (payment.*). The UPI ID and QR appear once the owner adds them.
export function PaymentDetails({ amount, reference }) {
    const { brand } = useTheme();
    const [copied, setCopied] = useState("");
    const upi = settings["payment.upiId"];
    const account = settings["payment.bankAccount"];
    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(""), 1600);
        } catch {
            // clipboard blocked: the text is still visible to copy by hand
        }
    };
    const row = { display: "flex", justifyContent: "space-between", gap: 2, py: 1, borderBottom: `1px dashed ${brand.color.line}`, fontSize: 14 };
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: upi ? "150px 1fr" : "1fr" }, gap: 3, alignItems: "start" }}>
            {/* UPI QR: shown once the owner uploads it in admin Settings */}
            {upi && (
                <Box sx={{ width: { xs: 150, sm: "100%" }, mx: { xs: "auto", sm: 0 }, aspectRatio: "1", border: `1.5px dashed ${brand.color.lineStrong}`, borderRadius: `${brand.radius.sm}px`, display: "grid", placeItems: "center", textAlign: "center", bgcolor: brand.color.card, p: 1.5 }}>
                    <Typography sx={{ fontSize: 12, color: brand.color.inkMuted, lineHeight: 1.4 }}>Shop UPI QR</Typography>
                </Box>
            )}
            <Box>
                {amount != null && (
                    <Box sx={{ ...row, fontWeight: 700, fontSize: 16 }}>
                        <span>Amount to pay</span>
                        <span>{amount}</span>
                    </Box>
                )}
                {upi && (
                    <Box sx={row}>
                        <span>UPI ID</span>
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontFamily: brand.font.mono, fontSize: 13 }}>
                            {upi}
                            <IconButton size="small" onClick={() => copy(upi, "upi")} aria-label="Copy UPI ID">
                                <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                            {copied === "upi" && <Box component="span" sx={{ fontFamily: brand.font.body, fontSize: 12, color: brand.color.success }}>Copied</Box>}
                        </Box>
                    </Box>
                )}
                <Box sx={row}>
                    <span>Bank</span>
                    <span>{settings["payment.bankName"]}</span>
                </Box>
                <Box sx={row}>
                    <span>Account name</span>
                    <span>{settings["payment.bankHolder"]}</span>
                </Box>
                <Box sx={row}>
                    <span>Account number</span>
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontFamily: brand.font.mono, fontSize: 13 }}>
                        {account}
                        <IconButton size="small" onClick={() => copy(account, "acc")} aria-label="Copy account number">
                            <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                        {copied === "acc" && <Box component="span" sx={{ fontFamily: brand.font.body, fontSize: 12, color: brand.color.success }}>Copied</Box>}
                    </Box>
                </Box>
                <Box sx={row}>
                    <span>IFSC</span>
                    <Box component="span" sx={{ fontFamily: brand.font.mono, fontSize: 13 }}>{settings["payment.bankIfsc"]}</Box>
                </Box>
                {reference && (
                    <Box sx={row}>
                        <span>Write in the payment note</span>
                        <Box component="span" sx={{ fontFamily: brand.font.mono, fontSize: 13 }}>{reference}</Box>
                    </Box>
                )}
                <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 1.5 }}>
                    After paying, send the payment screenshot on WhatsApp to {settings["shop.phone2"] || settings["shop.phone"]}. We'll confirm as soon as it reaches us.
                </Typography>
            </Box>
        </Box>
    );
}

// Bordered panel with a title row, used across account pages and checkout.
export function Panel({ title, action, children, sx }) {
    const { brand } = useTheme();
    return (
        <Box sx={{ bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.md}px`, ...sx }}>
            {(title || action) && (
                <Box sx={{ px: { xs: 2, sm: 2.75 }, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: `1px solid ${brand.color.line}` }}>
                    <Typography variant="h5" component="h2">{title}</Typography>
                    {action}
                </Box>
            )}
            <Box sx={{ p: { xs: 2, sm: 2.75 } }}>{children}</Box>
        </Box>
    );
}
