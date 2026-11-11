import { useState } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { Field, FormError, MobileField } from "../../components/Forms/Forms";
import { StatusStamp, StatusTrack } from "../../components/Status/Status";
import { trackOrder } from "../../services/orders";
import { rupees } from "../../configurations/format";
import { ORDER_STATUS_LABEL, ORDER_STEPS, PAYMENT_STATUS_LABEL, formatDate } from "../../configurations/shopRules";

// Public order tracking: order number + mobile, no sign-in needed.
export default function Track() {
    const { brand } = useTheme();
    const [form, setForm] = useState({ orderNo: "", mobile: "" });
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setOrder(null);
        if (!form.orderNo.trim() || form.mobile.length !== 10) {
            setError("Enter your order number (e.g. KBC-001001) and the 10-digit mobile number used on the order.");
            return;
        }
        setBusy(true);
        try {
            setOrder(await trackOrder(form));
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Shell sx={{ py: { xs: 4, md: 7 } }}>
            <Box sx={{ maxWidth: 620, mx: "auto" }}>
                <Typography variant="overline" sx={{ color: brand.color.accent }}>No sign-in needed</Typography>
                <Typography variant="h2" component="h1" sx={{ mt: 0.5 }}>Track an order</Typography>
                <Typography sx={{ color: brand.color.inkMuted, mt: 1 }}>You'll find the order number on the confirmation page and in our WhatsApp message.</Typography>

                <Box component="form" onSubmit={submit} noValidate sx={{ mt: 3, p: { xs: 2.25, sm: 3 }, bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.md}px`, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" }, gap: 2, alignItems: "end" }}>
                    <Field label="Order number" name="t-order" placeholder="KBC-001001" value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value.toUpperCase() })} slotProps={{ htmlInput: { style: { fontFamily: brand.font.mono } } }} />
                    <MobileField label="Mobile number" name="t-mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
                    <Button type="submit" variant="contained" disabled={busy} sx={{ height: 40 }}>{busy ? "Looking…" : "Track"}</Button>
                </Box>
                <Box sx={{ mt: 2 }}><FormError message={error} /></Box>

                {order && (
                    <Box sx={{ mt: 3 }}>
                        <Box sx={{ bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderBottom: 0, boxShadow: brand.shadow.card, p: { xs: 2.5, sm: 3.5 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", pb: 2, mb: 2.5, borderBottom: `1px dashed ${brand.color.lineStrong}` }}>
                                <Box>
                                    <Typography sx={{ fontFamily: brand.font.mono, fontSize: 18 }}>{order.OrderNo}</Typography>
                                    <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>Placed {formatDate(order.PlacedOn)} · {rupees(order.GrandTotal)} · {PAYMENT_STATUS_LABEL[order.PaymentStatus]}</Typography>
                                </Box>
                                <StatusStamp status={order.Status} label={ORDER_STATUS_LABEL[order.Status]} />
                            </Box>
                            <StatusTrack steps={ORDER_STEPS[order.FulfilmentType]} labels={ORDER_STATUS_LABEL} status={order.Status} history={order.History} />
                            {order.TrackingNo && (
                                <Box sx={{ mt: 2.5, p: 1.75, bgcolor: brand.color.surface, borderRadius: `${brand.radius.sm}px`, fontSize: 14 }}>
                                    <strong>{order.CourierName}</strong> · tracking no. <Box component="span" sx={{ fontFamily: brand.font.mono }}>{order.TrackingNo}</Box>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ mt: 2, color: brand.color.inkMuted, textAlign: "center" }}>
                            <Link component={RouterLink} to="/login">Sign in</Link> to see the items, payment details and invoice.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Shell>
    );
}
