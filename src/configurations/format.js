// Indian rupee formatting: ₹1,234 when whole, ₹316.80 when there are paise.
const whole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const paise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const rupees = (value) => {
    const n = Math.round(Number(value || 0) * 100) / 100;
    return Number.isInteger(n) ? whole.format(n) : paise.format(n);
};

export const savingPercent = (product) => (product.Mrp > product.SellingPrice ? Math.round(((product.Mrp - product.SellingPrice) / product.Mrp) * 100) : 0);

export const PRODUCT_TYPE_LABEL = { BOOK: "Book", NOTEBOOK: "Notebook", STATIONERY: "Stationery", KIT: "School kit" };

// Stock wording shown to customers (exact counts only when it is running low).
export const stockState = (product) => {
    if (product.StockQty <= 0) return { key: "out", label: "Out of stock" };
    if (product.StockQty <= 5) return { key: "low", label: `Only ${product.StockQty} left` };
    return { key: "in", label: "In stock" };
};

export const whatsappLink = (number, text) => `https://wa.me/${String(number || "").replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
