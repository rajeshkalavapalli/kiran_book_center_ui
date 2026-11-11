import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { Field, FormError, Panel, PasswordField } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { changePassword, getAddresses, updateProfile } from "../../services/account";

export default function Profile() {
    const { brand } = useTheme();
    const { customer, setCustomer } = useAuth();
    const [form, setForm] = useState({ name: customer.Name, email: customer.Email || "" });
    const [pw, setPw] = useState({ current: "", next: "" });
    const [addresses, setAddresses] = useState([]);
    const [msg, setMsg] = useState({ profile: "", password: "" });
    const [err, setErr] = useState({ profile: "", password: "" });

    useEffect(() => {
        let live = true;
        getAddresses(customer.CustomerId).then((a) => live && setAddresses(a));
        return () => {
            live = false;
        };
    }, [customer.CustomerId]);

    const saveProfile = async (e) => {
        e.preventDefault();
        setErr((x) => ({ ...x, profile: "" }));
        try {
            setCustomer(await updateProfile(customer.CustomerId, form));
            setMsg((x) => ({ ...x, profile: "Saved." }));
        } catch (ex) {
            setErr((x) => ({ ...x, profile: ex.message }));
        }
    };
    const savePassword = async (e) => {
        e.preventDefault();
        setErr((x) => ({ ...x, password: "" }));
        try {
            await changePassword(customer.CustomerId, pw);
            setPw({ current: "", next: "" });
            setMsg((x) => ({ ...x, password: "Password changed." }));
        } catch (ex) {
            setErr((x) => ({ ...x, password: ex.message }));
        }
    };

    return (
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, alignItems: "start" }}>
            <Panel title="Your details">
                <Box component="form" onSubmit={saveProfile} sx={{ display: "grid", gap: 2 }}>
                    <Field label="Name" name="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <Field label="Mobile number" name="p-mobile" value={`+91 ${customer.Mobile}`} disabled hint="Your sign-in number. To change it, contact the shop." />
                    <Field label="Email" name="p-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <FormError message={err.profile} />
                    {msg.profile && !err.profile && <Alert severity="success">{msg.profile}</Alert>}
                    <Box><Button type="submit" variant="contained">Save details</Button></Box>
                </Box>
            </Panel>
            <Panel title="Change password">
                <Box component="form" onSubmit={savePassword} sx={{ display: "grid", gap: 2 }}>
                    <PasswordField label="Current password" name="pw-current" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                    <PasswordField label="New password" name="pw-next" autoComplete="new-password" hint="At least 8 characters." value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                    <FormError message={err.password} />
                    {msg.password && !err.password && <Alert severity="success">{msg.password}</Alert>}
                    <Box><Button type="submit" variant="outlined">Change password</Button></Box>
                </Box>
            </Panel>
            <Panel title="Saved addresses" sx={{ gridColumn: { lg: "1 / -1" } }}>
                {!addresses.length ? (
                    <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>Addresses you use at checkout are saved here.</Typography>
                ) : (
                    <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                        {addresses.map((a) => (
                            <Box key={a.AddressId} sx={{ p: 2, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.sm}px`, fontSize: 14 }}>
                                <Box sx={{ fontWeight: 700 }}>{a.Name} {a.IsDefault && <Box component="span" sx={{ fontSize: 11, fontWeight: 700, color: brand.color.steel, ml: 1 }}>DEFAULT</Box>}</Box>
                                <Box sx={{ color: brand.color.inkSoft, mt: 0.5 }}>
                                    {a.Line1}{a.Line2 && `, ${a.Line2}`}<br />{a.City}, {a.State} {a.Pincode}<br />+91 {a.Mobile}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Panel>
        </Box>
    );
}
