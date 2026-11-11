import { useState } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Navigate, Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { Field, FormError, MobileField, PasswordField } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { settings } from "../../services/shopData";
import { whatsappLink } from "../../configurations/format";

// Library-card styled sign in / create account.
export default function SignIn() {
    const { brand } = useTheme();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const next = params.get("next") || "/account";
    const { customer, login, register } = useAuth();
    const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
    const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    if (customer) return <Navigate to={next} replace />;

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            if (mode === "login") await login({ mobile: form.mobile, password: form.password });
            else await register(form);
            navigate(next, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const tab = (key, label) => (
        <Box
            component="button"
            type="button"
            role="tab"
            aria-selected={mode === key}
            onClick={() => {
                setMode(key);
                setError("");
            }}
            sx={{
                flex: 1,
                py: 1.5,
                border: 0,
                borderBottom: `2px solid ${mode === key ? brand.color.accent : "transparent"}`,
                bgcolor: "transparent",
                fontFamily: brand.font.body,
                fontWeight: 700,
                fontSize: 14.5,
                color: mode === key ? brand.color.ink : brand.color.inkMuted,
                cursor: "pointer",
            }}
        >
            {label}
        </Box>
    );

    return (
        <Shell sx={{ py: { xs: 4, md: 8 } }}>
            <Box sx={{ maxWidth: 460, mx: "auto" }}>
                <Box sx={{ bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.lg}px`, boxShadow: brand.shadow.card, overflow: "hidden" }}>
                    {/* card header like a library membership card */}
                    <Box sx={{ px: 3, pt: 2.5, pb: 2, bgcolor: brand.color.ink, color: brand.color.bg, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <Box>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, opacity: 0.7 }}>Kiran Book Center account</Typography>
                            <Typography variant="h3" component="h1" sx={{ color: brand.color.bg, mt: 0.75 }}>
                                {mode === "login" ? "Welcome back" : "Create your account"}
                            </Typography>
                        </Box>
                        
                    </Box>
                    <Box role="tablist" sx={{ display: "flex", borderBottom: `1px solid ${brand.color.line}` }}>
                        {tab("login", "Sign in")}
                        {tab("register", "New here? Register")}
                    </Box>

                    <Box component="form" onSubmit={submit} noValidate sx={{ p: 3, display: "grid", gap: 2.25 }}>
                        {mode === "register" && <Field label="Your name" name="name" autoComplete="name" required value={form.name} onChange={set("name")} />}
                        <MobileField label="Mobile number" name="mobile" required value={form.mobile} onChange={(v) => setForm((f) => ({ ...f, mobile: v }))} hint={mode === "register" ? "You'll sign in with this number." : undefined} />
                        {mode === "register" && <Field label="Email (optional)" name="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} hint="For order updates and invoices." />}
                        <PasswordField
                            label={mode === "register" ? "Choose a password" : "Password"}
                            name="password"
                            required
                            autoComplete={mode === "register" ? "new-password" : "current-password"}
                            value={form.password}
                            onChange={set("password")}
                            hint={mode === "register" ? "At least 8 characters." : undefined}
                        />
                        <FormError message={error} />
                        <Button type="submit" variant="contained" size="large" disabled={busy}>
                            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                        </Button>
                        {mode === "login" && (
                            <Typography variant="body2" sx={{ color: brand.color.inkMuted, textAlign: "center" }}>
                                Forgot your password?{" "}
                                <Link href={whatsappLink(settings["shop.whatsapp"], "Hello, I forgot my Kiran Book Center account password. My mobile number is: ")} target="_blank" rel="noopener noreferrer">
                                    Message the shop on WhatsApp
                                </Link>{" "}
                                and we'll reset it for you.
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: brand.color.inkMuted }}>
                    Just want to check an order? <Link component={RouterLink} to="/track">Track it without signing in</Link>
                </Typography>
            </Box>
        </Shell>
    );
}
