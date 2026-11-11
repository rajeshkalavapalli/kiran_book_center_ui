import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Skeleton, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";

import BookCover from "../../components/BookCover/BookCover";
import { NetBadge } from "../../components/PriceTag/PriceTag";
import { HistoryNotes, StatusStamp, StatusTrack } from "../../components/Status/Status";
import { FormError, Panel, PaymentDetails } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { cancelOrder, getOrder, listOrders } from "../../services/orders";
import { rupees } from "../../configurations/format";
import { CUSTOMER_CAN_CANCEL, ORDER_STATUS_LABEL, ORDER_STEPS, PAYMENT_LABEL, PAYMENT_STATUS_LABEL, formatDate } from "../../configurations/shopRules";

export function OrdersList() {
    const { brand } = useTheme();
    const { customer } = useAuth();
    const [orders, setOrders] = useState(null);

    useEffect(() => {
        let live = true;
        listOrders(customer.CustomerId).then((o) => live && setOrders(o));
        return () => {
            live = false;
        };
    }, [customer.CustomerId]);

    if (!orders) return <Skeleton variant="rounded" height={220} />;

    if (!orders.length) {
        return (
            <Panel>
                <Box sx={{ textAlign: "center", py: 5 }}>
                    <Typography variant="h3">No orders yet.</Typography>
                    <Typography sx={{ color: brand.color.inkMuted, mt: 1 }}>When you order, you'll be able to follow every step here.</Typography>
                    <Button component={RouterLink} to="/shop" variant="contained" sx={{ mt: 3 }}>Browse the shop</Button>
                </Box>
            </Panel>
        );
    }

    return (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.5 }}>
            {orders.map((o) => (
                <Box component="li" key={o.OrderNo}>
                    <Box
                        component={RouterLink}
                        to={`/account/orders/${o.OrderNo}`}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr auto", sm: "auto 1fr auto auto" },
                            alignItems: "center",
                            gap: { xs: 1.5, sm: 2.5 },
                            p: { xs: 2, sm: 2.25 },
                            bgcolor: brand.color.card,
                            border: `1px solid ${brand.color.line}`,
                            borderRadius: `${brand.radius.md}px`,
                            textDecoration: "none",
                            color: brand.color.ink,
                            transition: `border-color ${brand.motion.fast}`,
                            "&:hover": { borderColor: brand.color.ink },
                        }}
                    >
                        <Box sx={{ display: { xs: "none", sm: "flex" }, ml: 0.5 }}>
                            {o.Items.slice(0, 3).map((it, i) => (
                                <Box key={it.ProductId} sx={{ width: 40, ml: i ? -1.5 : 0, }}>
                                    <BookCover product={it} mini />
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                                <Typography sx={{ fontFamily: brand.font.mono, fontSize: 13.5 }}>{o.OrderNo}</Typography>
                                <StatusStamp status={o.Status} label={ORDER_STATUS_LABEL[o.Status]} />
                            </Box>
                            <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 0.5 }}>
                                {formatDate(o.PlacedOn)} · {o.ItemCount ?? 0} {o.ItemCount === 1 ? "item" : "items"} · {o.FulfilmentType === "PICKUP" ? "Pickup" : "Delivery"}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right", gridColumn: { xs: "1", sm: "auto" } }}>
                            <Typography sx={{ fontWeight: 700 }}>{rupees(o.GrandTotal)}</Typography>
                            <Typography sx={{ fontSize: 12, color: o.PaymentStatus === "PAID" ? brand.color.success : brand.color.warn, fontWeight: 600 }}>{PAYMENT_STATUS_LABEL[o.PaymentStatus]}</Typography>
                        </Box>
                        <ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint, gridRow: { xs: "1 / span 2", sm: "auto" }, gridColumn: { xs: 2, sm: "auto" } }} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export function OrderSummaryLines({ order }) {
    const { brand } = useTheme();
    const row = { display: "flex", justifyContent: "space-between", gap: 2, py: 0.6, fontSize: 14 };
    return (
        <>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                {order.Items.map((it) => (
                    <Box component="li" key={it.ProductId} sx={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 1.75, alignItems: "center", py: 1.25, borderBottom: `1px solid ${brand.color.line}` }}>
                        <Box component={RouterLink} to={`/book/${it.Slug}`}>
                            <BookCover product={it} mini />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.35 }}>{it.Title}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, color: brand.color.inkMuted, mt: 0.25 }}>
                                {it.Qty} × {rupees(it.UnitPrice)} {it.PricingMode === "NET" && <NetBadge />}
                            </Box>
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{rupees(it.UnitPrice * it.Qty)}</Typography>
                    </Box>
                ))}
            </Box>
            <Box sx={{ pt: 1.5 }}>
                <Box sx={row}>
                    <span>Items</span>
                    <span>{rupees(order.Subtotal)}</span>
                </Box>
                {order.MrpTotal > order.Subtotal && (
                    <Box sx={{ ...row, color: brand.color.success }}>
                        <span>You saved</span>
                        <span>{rupees(order.MrpTotal - order.Subtotal)}</span>
                    </Box>
                )}
                <Box sx={row}>
                    <span>{order.FulfilmentType === "PICKUP" ? "Pickup from shop" : `Delivery${order.ZoneName ? ` (${order.ZoneName})` : ""}`}</span>
                    <span>{order.ShippingCharge ? rupees(order.ShippingCharge) : "Free"}</span>
                </Box>
                <Box sx={{ ...row, mt: 0.75, pt: 1.25, borderTop: `1px solid ${brand.color.line}`, fontWeight: 700, fontSize: 16 }}>
                    <span>Total (incl. GST)</span>
                    <span>{rupees(order.GrandTotal)}</span>
                </Box>
            </Box>
        </>
    );
}

export function OrderDetail() {
    const { brand } = useTheme();
    const { orderNo } = useParams();
    const { customer } = useAuth();
    const [order, setOrder] = useState(undefined);
    const [error, setError] = useState("");
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let live = true;
        getOrder(customer.CustomerId, orderNo)
            .then((o) => live && setOrder(o))
            .catch((e) => live && (setOrder(null), setError(e.message)));
        return () => {
            live = false;
        };
    }, [customer.CustomerId, orderNo]);

    if (order === undefined) return <Skeleton variant="rounded" height={320} />;
    if (!order) return <FormError message={error} />;

    const doCancel = async () => {
        setBusy(true);
        try {
            setOrder(await cancelOrder(customer.CustomerId, order.OrderNo, reason));
            setCancelOpen(false);
        } catch (e) {
            setError(e.message);
            setCancelOpen(false);
        } finally {
            setBusy(false);
        }
    };

    const awaitingUpi = order.PaymentMethod === "UPI_LATER" && order.PaymentStatus === "PENDING" && order.Status !== "CANCELLED";

    return (
        <Box sx={{ display: "grid", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box>
                    <Link component={RouterLink} to="/account" sx={{ fontSize: 13 }}>← All orders</Link>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.75, flexWrap: "wrap" }}>
                        <Typography variant="h3" component="h2" sx={{ fontFamily: brand.font.mono, fontWeight: 500, fontSize: 22 }}>{order.OrderNo}</Typography>
                        <StatusStamp status={order.Status} label={ORDER_STATUS_LABEL[order.Status]} />
                    </Box>
                    <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 0.5 }}>Placed {formatDate(order.PlacedOn, true)}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} disabled title="Available once the shop issues the GST invoice" sx={{ bgcolor: brand.color.card }}>
                        Invoice
                    </Button>
                    {CUSTOMER_CAN_CANCEL.includes(order.Status) && (
                        <Button variant="outlined" color="primary" onClick={() => setCancelOpen(true)} sx={{ bgcolor: brand.color.card, borderColor: brand.color.dangerMist, color: brand.color.danger }}>
                            Cancel order
                        </Button>
                    )}
                </Box>
            </Box>
            <FormError message={error} />

            {awaitingUpi && (
                <Panel title="Pay for this order" sx={{ borderColor: brand.color.amber }}>
                    <PaymentDetails amount={rupees(order.GrandTotal)} reference={order.OrderNo} />
                </Panel>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2.5, alignItems: "start" }}>
                <Panel title="Where is it?">
                    <StatusTrack steps={ORDER_STEPS[order.FulfilmentType]} labels={ORDER_STATUS_LABEL} status={order.Status} history={order.History} endedNote={order.CancelReason} />
                    {order.TrackingNo && (
                        <Box sx={{ mt: 2.5, p: 1.75, bgcolor: brand.color.surface, borderRadius: `${brand.radius.sm}px`, fontSize: 14 }}>
                            <strong>{order.CourierName}</strong> · tracking no. <Box component="span" sx={{ fontFamily: brand.font.mono }}>{order.TrackingNo}</Box>
                            {order.TrackingUrl && (
                                <> · <Link href={order.TrackingUrl} target="_blank" rel="noopener noreferrer">Track on courier site</Link></>
                            )}
                        </Box>
                    )}
                    <Box sx={{ mt: 2.5 }}>
                        <HistoryNotes history={order.History} />
                    </Box>
                </Panel>

                <Box sx={{ display: "grid", gap: 2.5 }}>
                    <Panel title="Items">
                        <OrderSummaryLines order={order} />
                    </Panel>
                    <Panel title={order.FulfilmentType === "PICKUP" ? "Pickup & payment" : "Delivery & payment"}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, fontSize: 14 }}>
                            <Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.color.inkMuted, mb: 0.5 }}>{order.FulfilmentType === "PICKUP" ? "Pickup" : "Ship to"}</Typography>
                                {order.FulfilmentType === "PICKUP" ? (
                                    <Typography variant="body2">From the shop counter. We'll message you when it's ready.</Typography>
                                ) : (
                                    <Typography variant="body2">
                                        {order.ShipName} · +91 {order.ShipMobile}
                                        <br />
                                        {order.ShipLine1}
                                        {order.ShipLine2 && <>, {order.ShipLine2}</>}
                                        <br />
                                        {order.ShipCity}, {order.ShipState} {order.ShipPincode}
                                    </Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: brand.color.inkMuted, mb: 0.5 }}>Payment</Typography>
                                <Typography variant="body2">{PAYMENT_LABEL[order.PaymentMethod]}</Typography>
                                <Typography variant="body2" sx={{ color: order.PaymentStatus === "PAID" ? brand.color.success : brand.color.warn, fontWeight: 600 }}>{PAYMENT_STATUS_LABEL[order.PaymentStatus]}</Typography>
                            </Box>
                        </Box>
                    </Panel>
                </Box>
            </Box>

            <Dialog open={cancelOpen} onClose={() => !busy && setCancelOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: brand.font.display }}>Cancel {order.OrderNo}?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: brand.color.inkSoft, mb: 2 }}>
                        The items go back on the shelf. If you've already paid by UPI, the shop will refund you.
                    </Typography>
                    <TextField fullWidth size="small" label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCancelOpen(false)} disabled={busy}>Keep order</Button>
                    <Button variant="contained" onClick={doCancel} disabled={busy}>Yes, cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
