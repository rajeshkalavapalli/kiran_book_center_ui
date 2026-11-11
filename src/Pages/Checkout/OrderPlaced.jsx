import { useEffect, useState } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link as RouterLink, useParams } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { FormError, Panel, PaymentDetails } from "../../components/Forms/Forms";
import { OrderSummaryLines } from "../Account/Orders";
import { useAuth } from "../../context/AuthContext";
import { getOrder } from "../../services/orders";
import { rupees } from "../../configurations/format";
import { PAYMENT_LABEL } from "../../configurations/shopRules";

export default function OrderPlaced() {
    const { brand } = useTheme();
    const { orderNo } = useParams();
    const { customer } = useAuth();
    const [order, setOrder] = useState(undefined);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!customer) return undefined;
        let live = true;
        getOrder(customer.CustomerId, orderNo)
            .then((o) => live && setOrder(o))
            .catch((e) => live && (setOrder(null), setError(e.message)));
        return () => {
            live = false;
        };
    }, [customer, orderNo]);

    if (order === undefined) return <Shell sx={{ py: 6 }}><Skeleton variant="rounded" height={300} /></Shell>;
    if (!order) return <Shell sx={{ py: 6 }}><FormError message={error} /></Shell>;

    const upi = order.PaymentMethod === "UPI_LATER";

    return (
        <Shell sx={{ pt: { xs: 4, md: 6 } }}>
            <Box sx={{ maxWidth: 760, mx: "auto", display: "grid", gap: 3 }}>
                {/* confirmation */}
                <Box>
                    <Box sx={{ position: "relative", bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.lg}px`, boxShadow: brand.shadow.card, p: { xs: 3, md: 4.5 }, textAlign: "center", overflow: "hidden" }}>
                        <Box aria-hidden sx={{ width: 64, height: 64, mx: "auto", mb: 2.5, borderRadius: "50%", bgcolor: brand.color.accentMist, color: brand.color.accent, display: "grid", placeItems: "center" }}>
                            <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
                        </Box>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: brand.color.inkMuted }}>Order number</Typography>
                        <Typography sx={{ fontFamily: brand.font.mono, fontSize: { xs: 26, md: 32 }, mt: 0.5 }}>{order.OrderNo}</Typography>
                        <Typography variant="h2" component="h1" sx={{ mt: 2.5 }}>Thank you, {customer.Name.split(" ")[0]}.</Typography>
                        <Typography sx={{ color: brand.color.inkSoft, mt: 1, maxWidth: 480, mx: "auto" }}>
                            {upi
                                ? "Your order is saved. Pay using the details below and we'll start packing as soon as the payment reaches us."
                                : order.FulfilmentType === "PICKUP"
                                  ? "We're getting it ready. We'll message you on WhatsApp when it's waiting at the counter."
                                  : "We're packing it now. You'll get the courier tracking number as soon as it ships."}
                        </Typography>
                        <Box sx={{ mt: 2.5, display: "inline-flex", gap: 3, flexWrap: "wrap", justifyContent: "center", fontSize: 14 }}>
                            <span><Box component="span" sx={{ color: brand.color.inkMuted }}>Total </Box><strong>{rupees(order.GrandTotal)}</strong></span>
                            <span><Box component="span" sx={{ color: brand.color.inkMuted }}>Payment </Box><strong>{PAYMENT_LABEL[order.PaymentMethod]}</strong></span>
                            <span><Box component="span" sx={{ color: brand.color.inkMuted }}>{order.FulfilmentType === "PICKUP" ? "Pickup" : "Delivery"} </Box><strong>{order.FulfilmentType === "PICKUP" ? "From the shop" : order.ZoneName}</strong></span>
                        </Box>
                    </Box>
                </Box>

                {upi && (
                    <Panel title="Pay now via UPI" sx={{ borderColor: brand.color.amber, borderWidth: 1.5 }}>
                        <PaymentDetails amount={rupees(order.GrandTotal)} reference={order.OrderNo} />
                    </Panel>
                )}

                <Panel title="What you ordered">
                    <OrderSummaryLines order={order} />
                </Panel>

                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button component={RouterLink} to={`/account/orders/${order.OrderNo}`} variant="contained" size="large">Track this order</Button>
                    <Button component={RouterLink} to="/shop" variant="outlined" size="large" sx={{ bgcolor: brand.color.card }}>Keep shopping</Button>
                </Box>
            </Box>
        </Shell>
    );
}
