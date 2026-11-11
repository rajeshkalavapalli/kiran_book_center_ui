// Checkout and orders. Calls the customer API: POST /checkout/quote, POST /orders, GET /orders,
// GET /orders/:orderNo, POST /orders/:orderNo/cancel, GET /orders/:orderNo/invoice, POST /track.
// Prices, stock and delivery charges are always worked out by the API, never by the browser.
import { get, post } from "../configurations/api-config";
import { startSession } from "./account";

// Only the product and quantity go to the API; it prices everything from the database.
const cartLines = (cart = []) => cart.map((l) => ({ ProductId: l.ProductId, Qty: l.Qty }));

// Delivery charge + totals for the checkout summary: { Subtotal, MrpTotal, ShippingCharge, GrandTotal, zone, needsAddress, items }
export const quote = ({ cart, fulfilment, address }) => post("/checkout/quote", { cart: cartLines(cart), fulfilment, address: address || null });

/**
 * payload: { cart, newCustomer{name,mobile,email,password} (first order only), fulfilment, address, paymentMethod, note, saveAddress }
 * returns { order }. For a first order the account is created with it and the customer is signed in.
 */
export const placeOrder = async (payload) => {
    const result = await post("/orders", {
        cart: cartLines(payload.cart),
        newCustomer: payload.newCustomer || null,
        fulfilment: payload.fulfilment,
        address: payload.address || null,
        paymentMethod: payload.paymentMethod,
        note: payload.note || null,
        saveAddress: Boolean(payload.saveAddress),
    });
    if (result.token) startSession({ customer: result.customer, token: result.token, expiresAt: result.expiresAt });
    return { order: result.order };
};

export const listOrders = () => get("/orders");

export const getOrder = (customerId, orderNo) => get(`/orders/${encodeURIComponent(orderNo)}`);

export const cancelOrder = (customerId, orderNo, reason) => post(`/orders/${encodeURIComponent(orderNo)}/cancel`, { reason: reason || null });

export const getOrderInvoice = (orderNo) => get(`/orders/${encodeURIComponent(orderNo)}/invoice`);

// Public tracking: order number + the mobile number used on the order.
export const trackOrder = ({ orderNo, mobile }) => post("/track", { orderNo, mobile });
