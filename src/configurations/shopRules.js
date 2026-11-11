// Shop rules shared by checkout, orders and requests. Values mirror the database CHECK lists.
export const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const isMobile = (v) => /^[6-9]\d{9}$/.test(String(v || "").trim());
export const isPincode = (v) => /^[1-9]\d{5}$/.test(String(v || "").trim());
export const isEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
export const isGstin = (v) => !v || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(v).trim().toUpperCase());

export const PAYMENT_LABEL = { COD: "Cash on delivery", UPI_LATER: "Pay later via UPI", RAZORPAY: "Paid online" };
export const PAYMENT_STATUS_LABEL = { PENDING: "Payment pending", PAID: "Paid", REFUNDED: "Refunded" };

// Order steps the customer sees, per fulfilment type.
export const ORDER_STEPS = {
    DELIVERY: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"],
    PICKUP: ["PLACED", "CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP"],
};
export const ORDER_STATUS_LABEL = {
    PLACED: "Order placed",
    CONFIRMED: "Confirmed",
    PACKED: "Packed",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    READY_FOR_PICKUP: "Ready for pickup",
    PICKED_UP: "Picked up",
    CANCELLED: "Cancelled",
};
// The customer may cancel until the parcel is packed / ready.
export const CUSTOMER_CAN_CANCEL = ["PLACED", "CONFIRMED"];

export const REQUEST_STEPS = {
    DELIVERY: ["SUBMITTED", "UNDER_REVIEW", "QUOTED", "PAID", "DISPATCHED", "DELIVERED"],
    PICKUP: ["SUBMITTED", "UNDER_REVIEW", "QUOTED", "PAID", "READY_FOR_PICKUP", "PICKED_UP"],
};
export const REQUEST_STATUS_LABEL = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under review",
    QUOTED: "Quote ready",
    PAID: "Paid",
    DISPATCHED: "Dispatched",
    DELIVERED: "Delivered",
    READY_FOR_PICKUP: "Ready for pickup",
    PICKED_UP: "Picked up",
    REJECTED: "Not available",
    CANCELLED: "Cancelled",
};
export const REQUEST_CAN_CANCEL = ["SUBMITTED", "UNDER_REVIEW", "QUOTED"];

// Status chip tone.
export const toneOf = (status) =>
    ({
        PLACED: "info", SUBMITTED: "info", UNDER_REVIEW: "info", CONFIRMED: "info",
        QUOTED: "action", PACKED: "progress", SHIPPED: "progress", DISPATCHED: "progress", READY_FOR_PICKUP: "action", PAID: "progress",
        DELIVERED: "done", PICKED_UP: "done",
        CANCELLED: "muted", REJECTED: "muted",
    })[status] || "info";

export const formatDate = (iso, withTime = false) =>
    iso
        ? new Date(iso).toLocaleString("en-IN", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" })
        : "";
