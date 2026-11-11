import { useEffect, useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Link, Radio, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";

import BookCover from "../../components/BookCover/BookCover";
import { Shell } from "../../components/Common/Common";
import { AddressFields, Field, FormError, MobileField, PasswordField, emptyAddress } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";
import { getAddresses } from "../../services/account";
import { placeOrder, quote } from "../../services/orders";
import { rupees } from "../../configurations/format";
import { isMobile, isPincode } from "../../configurations/shopRules";
import { settings } from "../../services/shopData";

function Step({ n, title, children, done }) {
    const { brand } = useTheme();
    return (
        <Box component="section" sx={{ position: "relative", pl: { xs: 0, sm: 6 }, pb: 4 }}>
            <Box
                aria-hidden
                sx={{
                    display: { xs: "none", sm: "grid" },
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    placeItems: "center",
                    fontFamily: brand.font.mono,
                    fontSize: 13,
                    bgcolor: done ? brand.color.ink : brand.color.card,
                    color: done ? brand.color.bg : brand.color.ink,
                    border: `1.5px solid ${brand.color.ink}`,
                }}
            >
                {String(n).padStart(2, "0")}
            </Box>
            <Typography variant="h4" component="h2" sx={{ mb: 2, pt: { sm: 0.5 } }}>
                <Box component="span" sx={{ display: { sm: "none" }, fontFamily: brand.font.mono, fontSize: 13, color: brand.color.inkMuted, mr: 1 }}>{String(n).padStart(2, "0")}</Box>
                {title}
            </Typography>
            {children}
        </Box>
    );
}

// Big selectable card (delivery / payment choices).
function Choice({ selected, onSelect, icon, title, body, right, disabled }) {
    const { brand } = useTheme();
    return (
        <Box
            component="label"
            sx={{
                display: "grid",
                gridTemplateColumns: "auto auto 1fr auto",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderRadius: `${brand.radius.md}px`,
                border: `1.5px solid ${selected ? brand.color.ink : brand.color.line}`,
                bgcolor: disabled ? brand.color.surface : brand.color.card,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.7 : 1,
                transition: `border-color ${brand.motion.fast}`,
                "&:hover": { borderColor: disabled ? brand.color.line : brand.color.ink },
            }}
        >
            <Radio checked={selected} onChange={onSelect} disabled={disabled} size="small" sx={{ p: 0, color: brand.color.lineStrong, "&.Mui-checked": { color: brand.color.ink } }} />
            <Box sx={{ color: brand.color.steel, display: "flex" }}>{icon}</Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{title}</Typography>
                <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>{body}</Typography>
            </Box>
            {right && <Box sx={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>{right}</Box>}
        </Box>
    );
}

export default function Checkout() {
    const { brand } = useTheme();
    const navigate = useNavigate();
    const { customer, refresh } = useAuth();
    const { cart, clearCart } = useShop();

    const [me, setMe] = useState({ name: "", mobile: "", email: "", password: "" });
    const [fulfilment, setFulfilment] = useState("DELIVERY");
    const [saved, setSaved] = useState([]);
    const [addressId, setAddressId] = useState("new");
    const [address, setAddress] = useState(emptyAddress);
    const [saveAddress, setSaveAddress] = useState(true);
    const [payment, setPayment] = useState("COD");
    const [note, setNote] = useState("");
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [busy, setBusy] = useState(false);

    // Saved addresses for signed-in customers.
    useEffect(() => {
        if (!customer) return undefined;
        let live = true;
        getAddresses().then((list) => {
            if (!live) return;
            setSaved(list);
            const def = list.find((a) => a.IsDefault) || list[0];
            if (def) {
                setAddressId(def.AddressId);
                setAddress({ ...emptyAddress, ...def });
            }
        });
        return () => {
            live = false;
        };
    }, [customer]);

    // Copy name and mobile into the address for first-time customers.
    useEffect(() => {
        if (customer || addressId !== "new") return;
        setAddress((a) => ({ ...a, Name: a.Name || me.name, Mobile: a.Mobile || me.mobile }));
    }, [me.name, me.mobile, customer, addressId]);

    // Live totals and delivery charge.
    const quoteKey = useMemo(() => JSON.stringify([cart.map((l) => [l.ProductId, l.Qty]), fulfilment, address.State, address.Pincode]), [cart, fulfilment, address.State, address.Pincode]);
    useEffect(() => {
        if (!cart.length) return undefined;
        let live = true;
        quote({ cart, fulfilment, address })
            .then((q) => {
                if (!live) return;
                setSummary(q);
                setError("");
            })
            .catch((e) => live && setError(e.message));
        return () => {
            live = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quoteKey]);

    if (!cart.length && !busy) return <Navigate to="/cart" replace />;

    const pickAddress = (id) => {
        setAddressId(id);
        setAddress(id === "new" ? { ...emptyAddress, Name: customer?.Name || me.name, Mobile: customer?.Mobile || me.mobile } : { ...emptyAddress, ...saved.find((a) => a.AddressId === id) });
    };

    const validate = () => {
        const errs = {};
        if (!customer) {
            if (!me.name.trim()) errs.name = "Enter your name.";
            if (!isMobile(me.mobile)) errs.mobile = "Enter a valid 10-digit mobile number.";
            if (me.password.length < 8) errs.password = "At least 8 characters.";
        }
        if (fulfilment === "DELIVERY") {
            if (!address.Name.trim()) errs.Name = "Required.";
            if (!isMobile(address.Mobile)) errs.Mobile = "10-digit mobile.";
            if (!address.Line1.trim()) errs.Line1 = "Required.";
            if (!address.City.trim()) errs.City = "Required.";
            if (!address.State) errs.State = "Choose a state.";
            if (!isPincode(address.Pincode)) errs.Pincode = "6-digit pincode.";
        }
        setFieldErrors(errs);
        return !Object.keys(errs).length;
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!validate()) {
            setError("Please check the highlighted fields.");
            return;
        }
        setBusy(true);
        try {
            const { order } = await placeOrder({
                cart,
                customerId: customer?.CustomerId,
                newCustomer: customer ? null : me,
                fulfilment,
                address: fulfilment === "DELIVERY" ? address : null,
                paymentMethod: payment,
                note,
                saveAddress: addressId === "new" && saveAddress,
            });
            // A first order creates the account and signs the customer in (placeOrder stores the session).
            if (!customer) refresh();
            clearCart();
            navigate(`/order-placed/${order.OrderNo}`, { replace: true });
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    const row = { display: "flex", justifyContent: "space-between", gap: 2, py: 0.6, fontSize: 14 };

    return (
        <Shell sx={{ pt: { xs: 3, md: 5 } }}>
            <Box sx={{ pb: 2.5, borderBottom: `1px solid ${brand.color.line}`, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="h2" component="h1">Checkout</Typography>
                <Link component={RouterLink} to="/cart" sx={{ fontSize: 14 }}>← Back to bag</Link>
            </Box>

            <Box component="form" onSubmit={submit} noValidate sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 380px" }, gap: { xs: 2, md: 6 }, alignItems: "start", mt: { xs: 3, md: 4 } }}>
                <Box sx={{ minWidth: 0 }}>
                    <Step n={1} title="Your details" done={Boolean(customer)}>
                        {customer ? (
                            <Box sx={{ p: 2, bgcolor: brand.color.card, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.md}px`, fontSize: 14 }}>
                                Ordering as <strong>{customer.Name}</strong> · +91 {customer.Mobile}
                            </Box>
                        ) : (
                            <>
                                <Typography variant="body2" sx={{ color: brand.color.inkSoft, mb: 2 }}>
                                    We'll create your account with this order so you can track it.{" "}
                                    <Link component={RouterLink} to="/login?next=/checkout">Already have an account? Sign in</Link>
                                </Typography>
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                    <Field label="Your name" name="me-name" autoComplete="name" required value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} error={fieldErrors.name} />
                                    <MobileField label="Mobile number" name="me-mobile" required value={me.mobile} onChange={(v) => setMe({ ...me, mobile: v })} error={fieldErrors.mobile} hint="Used to sign in and for delivery updates." />
                                    <Field label="Email (optional)" name="me-email" type="email" autoComplete="email" value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} />
                                    <PasswordField label="Create a password" name="me-password" autoComplete="new-password" required value={me.password} onChange={(e) => setMe({ ...me, password: e.target.value })} error={fieldErrors.password} hint={fieldErrors.password ? undefined : "At least 8 characters."} />
                                </Box>
                            </>
                        )}
                    </Step>

                    <Step n={2} title="Delivery or pickup">
                        <Box sx={{ display: "grid", gap: 1.25, mb: fulfilment === "DELIVERY" ? 3 : 0 }}>
                            <Choice
                                selected={fulfilment === "DELIVERY"}
                                onSelect={() => setFulfilment("DELIVERY")}
                                icon={<LocalShippingOutlinedIcon />}
                                title="Deliver to my address"
                                body={summary?.zone ? `${summary.zone.Name} · usually ${summary.zone.EtaDays} days` : "Charge depends on your pincode"}
                                right={fulfilment === "DELIVERY" && summary?.zone ? (summary.ShippingCharge ? rupees(summary.ShippingCharge) : "Free") : null}
                            />
                            {settings["order.pickupEnabled"] === "true" && (
                                <Choice selected={fulfilment === "PICKUP"} onSelect={() => setFulfilment("PICKUP")} icon={<StorefrontOutlinedIcon />} title="Pick up from the shop" body={`${settings["shop.addressLine1"]}, ${settings["shop.city"]} · ${settings["shop.hours"]}`} right="Free" />
                            )}
                        </Box>
                        {fulfilment === "DELIVERY" && (
                            <>
                                {saved.length > 0 && (
                                    <Box sx={{ display: "grid", gap: 1, mb: 2.5 }}>
                                        {saved.map((a) => (
                                            <Choice key={a.AddressId} selected={addressId === a.AddressId} onSelect={() => pickAddress(a.AddressId)} icon={null} title={a.Name} body={`${a.Line1}${a.Line2 ? `, ${a.Line2}` : ""}, ${a.City}, ${a.State} ${a.Pincode}`} />
                                        ))}
                                        <Choice selected={addressId === "new"} onSelect={() => pickAddress("new")} icon={null} title="Use a new address" body="Add another delivery address" />
                                    </Box>
                                )}
                                {(addressId === "new" || !saved.length) && (
                                    <>
                                        <AddressFields value={address} onChange={setAddress} errors={fieldErrors} />
                                        {customer && (
                                            <FormControlLabel sx={{ mt: 1 }} control={<Checkbox size="small" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />} label={<Typography variant="body2">Save this address for next time</Typography>} />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Step>

                    <Step n={3} title="Payment">
                        <Box sx={{ display: "grid", gap: 1.25 }}>
                            <Choice selected={payment === "COD"} onSelect={() => setPayment("COD")} icon={<PaymentsOutlinedIcon />} title={fulfilment === "PICKUP" ? "Pay at the shop" : "Cash on delivery"} body={fulfilment === "PICKUP" ? "Cash or UPI at the counter when you collect." : "Pay the courier in cash when the parcel arrives."} />
                            <Choice selected={payment === "UPI_LATER"} onSelect={() => setPayment("UPI_LATER")} icon={<QrCode2RoundedIcon />} title="Pay via UPI after ordering" body="We'll show the shop's UPI ID and QR code on the next page. We pack once the payment reaches us." />
                            <Choice selected={false} onSelect={() => {}} disabled icon={<CreditCardRoundedIcon />} title="Pay online (UPI, cards)" body="Coming soon" />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Field label="Note for the shop (optional)" name="note" multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="E.g. call before delivery, or a preferred edition" />
                        </Box>
                    </Step>
                </Box>

                {/* Receipt summary */}
                <Box sx={{ position: { md: "sticky" }, top: { md: 140 } }}>
                    <Box sx={{ bgcolor: brand.color.card, boxShadow: brand.shadow.card, border: `1px solid ${brand.color.line}`, borderBottom: 0, p: 3 }}>
                        <Typography sx={{ fontFamily: brand.font.display, fontWeight: 700, fontSize: 18, textAlign: "center" }}>Your order</Typography>
                        <Typography sx={{ fontFamily: brand.font.mono, fontSize: 11, color: brand.color.inkMuted, textAlign: "center", mt: 0.5, pb: 2, borderBottom: `1px dashed ${brand.color.lineStrong}` }}>PRICES INCLUDE GST</Typography>
                        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, py: 1.5, maxHeight: 260, overflowY: "auto" }}>
                            {cart.map((l) => (
                                <Box component="li" key={l.ProductId} sx={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 1.5, alignItems: "center", py: 0.75 }}>
                                    <BookCover product={l} mini />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{l.Title}</Typography>
                                        <Typography sx={{ fontSize: 12, color: brand.color.inkMuted }}>Qty {l.Qty}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{rupees(l.SellingPrice * l.Qty)}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ borderTop: `1px dashed ${brand.color.lineStrong}`, pt: 1.5 }}>
                            <Box sx={row}><span>Items</span><span>{summary ? rupees(summary.Subtotal) : "…"}</span></Box>
                            {summary && summary.MrpTotal > summary.Subtotal && <Box sx={{ ...row, color: brand.color.success, fontWeight: 600 }}><span>You save</span><span>{rupees(summary.MrpTotal - summary.Subtotal)}</span></Box>}
                            <Box sx={row}>
                                <span>{fulfilment === "PICKUP" ? "Pickup" : "Delivery"}</span>
                                <span>{fulfilment === "PICKUP" ? "Free" : summary?.needsAddress ? "Enter pincode" : summary ? (summary.ShippingCharge ? rupees(summary.ShippingCharge) : "Free") : "…"}</span>
                            </Box>
                            {fulfilment === "DELIVERY" && summary?.zone?.FreeAbove && summary.ShippingCharge > 0 && (
                                <Typography sx={{ fontSize: 12, color: brand.color.inkMuted }}>Add {rupees(summary.zone.FreeAbove - summary.Subtotal)} more for free delivery.</Typography>
                            )}
                            <Box sx={{ ...row, mt: 1, pt: 1.5, borderTop: `1px solid ${brand.color.line}`, fontSize: 18, fontWeight: 700 }}>
                                <span>To pay</span>
                                <span>{summary ? rupees(summary.GrandTotal) : "…"}</span>
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <FormError message={error} />
                        </Box>
                        <Button type="submit" fullWidth variant="contained" size="large" disabled={busy || !summary} sx={{ mt: 2 }}>
                            {busy ? "Placing order…" : "Place order"}
                        </Button>
                        <Typography sx={{ fontSize: 12, color: brand.color.inkMuted, textAlign: "center", mt: 1.5 }}>
                            By placing the order you agree to our <Link component={RouterLink} to="/policies/terms">terms</Link> and <Link component={RouterLink} to="/policies/cancellation">cancellation policy</Link>.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Shell>
    );
}
