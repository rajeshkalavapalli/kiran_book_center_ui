import { Alert, Box, Button, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { NavLink, Navigate, useParams } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { settings, zones } from "../../services/shopData";
import { rupees, whatsappLink } from "../../configurations/format";

/* ---------------- Contact ---------------- */
export function Contact() {
    const { brand } = useTheme();
    const items = [
        { icon: <PlaceOutlinedIcon />, label: "Visit", value: `${settings["shop.addressLine1"]}, ${settings["shop.addressLine2"]}, ${settings["shop.city"]}, ${settings["shop.state"]} ${settings["shop.pincode"]}` },
        { icon: <ScheduleRoundedIcon />, label: "Open", value: settings["shop.hours"] },
        { icon: <PhoneRoundedIcon />, label: "Call", value: settings["shop.phone"], href: `tel:${settings["shop.phone"].replace(/\s/g, "")}` },
        { icon: <WhatsAppIcon />, label: "WhatsApp", value: `${settings["shop.phone2"]} · ${settings["shop.phone3"]}`, href: whatsappLink(settings["shop.whatsapp"], "Hello Kiran Book Center,") },
        { icon: <ReceiptLongOutlinedIcon />, label: "GSTIN", value: settings["gst.gstin"] },
        { icon: <MailOutlineRoundedIcon />, label: "Email", value: settings["shop.email"], href: `mailto:${settings["shop.email"]}` },
    ];
    return (
        <Shell sx={{ py: { xs: 4, md: 7 } }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 4, md: 7 }, alignItems: "start" }}>
                <Box>
                    <Typography variant="overline" sx={{ color: brand.color.accent }}>Contact</Typography>
                    <Typography variant="h1" sx={{ fontSize: "clamp(2rem, 4vw, 3rem)", mt: 0.5 }}>Come by the counter, or just message us.</Typography>
                    <Typography sx={{ color: brand.color.inkSoft, mt: 2, maxWidth: 480 }}>
                        Questions about a book, an order or a school list? WhatsApp is the quickest way to reach us during shop hours.
                    </Typography>
                    <Button
                        component="a"
                        href={whatsappLink(settings["shop.whatsapp"], "Hello Kiran Book Center,")}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="large"
                        startIcon={<WhatsAppIcon />}
                        sx={{ mt: 3, bgcolor: "#1F7A4D", "&:hover": { bgcolor: "#18623D" } }}
                    >
                        Chat on WhatsApp
                    </Button>
                    <Box component="dl" sx={{ mt: 4, m: 0, pt: 4, display: "grid", gap: 2.25 }}>
                        {items.map((it) => (
                            <Box key={it.label} sx={{ display: "grid", gridTemplateColumns: "28px 80px 1fr", gap: 1.5, alignItems: "start" }}>
                                <Box sx={{ color: brand.color.steel }}>{it.icon}</Box>
                                <Box component="dt" sx={{ fontWeight: 700, fontSize: 14, pt: 0.25 }}>{it.label}</Box>
                                <Box component="dd" sx={{ m: 0, fontSize: 14.5, color: brand.color.inkSoft, pt: 0.25 }}>
                                    {it.href ? <Link href={it.href}>{it.value}</Link> : it.value}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
                {/* Google Maps embed (no API key needed) + link to open directions */}
                <Box>
                    <Box sx={{ position: "relative", aspectRatio: { xs: "4 / 3", md: "4 / 5" }, borderRadius: `${brand.radius.lg}px`, overflow: "hidden", bgcolor: brand.color.surface, border: `1px solid ${brand.color.line}` }}>
                        <Box component="iframe" title="Kiran Book Center on Google Maps" src={settings["shop.mapEmbed"]} loading="lazy" referrerPolicy="no-referrer-when-downgrade" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
                    </Box>
                    <Button component="a" href={settings["shop.mapUrl"]} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<PlaceOutlinedIcon />} sx={{ mt: 1.5 }}>
                        Get directions
                    </Button>
                </Box>
            </Box>
        </Shell>
    );
}

/* ---------------- Policies ----------------
   ORIGINAL PLACEHOLDER TEXT written for this project. The shop owner (and their adviser) must
   review and adjust it before going live; Razorpay also checks these pages during onboarding. */
const POLICIES = {
    shipping: {
        title: "Shipping & delivery",
        body: () => (
            <>
                <p>We pack orders on the same working day when they're placed before 5 PM and payment (for UPI orders) has reached us. Orders placed later, or on Sundays and holidays, are packed the next working day.</p>
                <h3>Delivery charges</h3>
                <ul>
                    {zones.map((z) => (
                        <li key={z.Code}>
                            <strong>{z.Name}:</strong> {rupees(z.Charge)}, free on orders of {rupees(z.FreeAbove)} or more. Usually {z.EtaDays} working days.
                        </li>
                    ))}
                    <li><strong>Pickup from the shop:</strong> always free. We'll message you when your order is ready at the counter.</li>
                </ul>
                <h3>Tracking</h3>
                <p>Once your parcel ships, the courier name and tracking number appear on your order page, and we share them on WhatsApp.</p>
                <h3>Damaged or missing items</h3>
                <p>If a parcel arrives damaged or an item is missing, please message us within 48 hours of delivery with a photo of the parcel and the items. We'll replace or refund the affected items.</p>
            </>
        ),
    },
    cancellation: {
        title: "Cancellation & refunds",
        body: () => (
            <>
                <h3>Cancelling an order</h3>
                <p>You can cancel an order yourself from your account until it is packed. After that, please call or WhatsApp us and we'll do our best to help.</p>
                <h3>Refunds</h3>
                <p>If you've already paid for a cancelled order, we refund the full amount to the same UPI ID or bank account within 5–7 working days.</p>
                <h3>Returns</h3>
                <p>Books and stationery in their original condition can be returned at the shop within 7 days with the invoice. Government textbooks sold at net price, opened kits and items marked "non-returnable" can be returned only if they are damaged or the wrong item was supplied.</p>
                <h3>Requests and bulk orders</h3>
                <p>Items ordered specially for you (requests and school/college orders) can be cancelled free of charge until you pay the quote. After payment, cancellations depend on whether our supplier accepts returns. We'll tell you before charging anything.</p>
            </>
        ),
    },
    privacy: {
        title: "Privacy",
        body: () => (
            <>
                <p>We collect only what we need to run your orders: your name, mobile number, optional email, delivery addresses and order history.</p>
                <h3>How we use it</h3>
                <ul>
                    <li>To process, deliver and invoice your orders and requests.</li>
                    <li>To send you order updates by WhatsApp, SMS or email.</li>
                    <li>To keep the GST and accounting records the law requires.</li>
                </ul>
                <h3>Who we share it with</h3>
                <p>Only with the courier delivering your parcel and, when online payments are switched on, the payment provider. We never sell your details.</p>
                <h3>Your choices</h3>
                <p>You can update your details from your account, or ask us to delete your account. Records we must keep for tax purposes are retained for the legally required period.</p>
            </>
        ),
    },
    terms: {
        title: "Terms of use",
        body: () => (
            <>
                <p>By using this website and placing an order with Kiran Book Center, you agree to these terms.</p>
                <h3>Prices</h3>
                <p>All prices are in Indian rupees and include GST. Items marked "Net price" are sold at the printed price without discount. If a price is shown wrongly because of an error, we'll contact you before processing the order.</p>
                <h3>Stock</h3>
                <p>Stock is checked when you place an order. In the rare case an item can't be supplied, we'll inform you and refund any amount paid for it.</p>
                <h3>Accounts</h3>
                <p>Keep your password private. You're responsible for orders placed from your account.</p>
                <h3>Contact</h3>
                <p>Questions about these terms: {settings["shop.email"]} or {settings["shop.phone"]}.</p>
            </>
        ),
    },
};

export function Policy() {
    const { brand } = useTheme();
    const { policy } = useParams();
    const page = POLICIES[policy];
    if (!page) return <Navigate to="/policies/shipping" replace />;
    const Body = page.body;

    return (
        <Shell sx={{ py: { xs: 4, md: 7 } }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: { xs: 3, md: 6 }, alignItems: "start" }}>
                <Box component="nav" aria-label="Policies" sx={{ display: "flex", flexDirection: { xs: "row", md: "column" }, gap: 0.5, flexWrap: "wrap", position: { md: "sticky" }, top: { md: 140 } }}>
                    {Object.entries(POLICIES).map(([key, p]) => (
                        <Box
                            key={key}
                            component={NavLink}
                            to={`/policies/${key}`}
                            sx={{ px: 1.5, py: 0.9, borderRadius: `${brand.radius.sm}px`, fontSize: 14, fontWeight: 600, color: brand.color.inkSoft, textDecoration: "none", "&:hover": { bgcolor: brand.color.surface }, "&.active": { bgcolor: brand.color.ink, color: brand.color.bg } }}
                        >
                            {p.title}
                        </Box>
                    ))}
                </Box>
                <Box component="article" sx={{ maxWidth: 720 }}>
                    <Typography variant="h2" component="h1">{page.title}</Typography>
                    <Alert severity="warning" variant="outlined" sx={{ mt: 2.5, bgcolor: brand.color.amberMist, borderColor: brand.color.amber }}>
                        Draft text for review by the shop owner before the site goes live.
                    </Alert>
                    <Box
                        sx={{
                            mt: 3,
                            color: brand.color.inkSoft,
                            fontSize: 15.5,
                            lineHeight: 1.75,
                            "& h3": { fontFamily: brand.font.display, color: brand.color.ink, fontSize: 19, fontWeight: 600, mt: 4, mb: 1 },
                            "& p": { my: 1.5 },
                            "& ul": { pl: 2.5, my: 1.5 },
                            "& li": { mb: 0.75 },
                            "& strong": { color: brand.color.ink },
                        }}
                    >
                        <Body />
                    </Box>
                </Box>
            </Box>
        </Shell>
    );
}
