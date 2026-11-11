import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Guest cart and wishlist, kept in this browser. After login (later phase) they are
// merged into the customer's account through the API (POST /cart/merge).
const CART_KEY = "kbcCart";
const WISH_KEY = "kbcWishlist";
const MAX_QTY = 50; // matches ShopSettings order.maxQtyPerItem

const load = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
};
const save = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage blocked: the cart still works for this visit
    }
};

// Only what the cart needs to show a line; the server re-checks price and stock at checkout.
const snapshot = (p) => ({
    ProductId: p.ProductId,
    Slug: p.Slug,
    Title: p.Title,
    Author: p.Author || null,
    Publisher: p.Publisher || null,
    ProductType: p.ProductType,
    Mrp: p.Mrp,
    SellingPrice: p.SellingPrice,
    PricingMode: p.PricingMode,
    DiscountPercent: p.DiscountPercent,
    StockQty: p.StockQty,
    Image: p.Images?.[0] || null,
});

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
    const [cart, setCart] = useState(() => load(CART_KEY));
    const [wishlist, setWishlist] = useState(() => load(WISH_KEY));
    const [toast, setToast] = useState(null);

    useEffect(() => {
        save(CART_KEY, cart);
    }, [cart]);
    useEffect(() => {
        save(WISH_KEY, wishlist);
    }, [wishlist]);

    const limit = (product) => Math.max(0, Math.min(MAX_QTY, product.StockQty));

    const addToCart = useCallback((product, qty = 1) => {
        setCart((lines) => {
            const existing = lines.find((l) => l.ProductId === product.ProductId);
            const nextQty = Math.min((existing?.Qty || 0) + qty, limit(product));
            if (nextQty <= 0) return lines;
            if (existing) return lines.map((l) => (l.ProductId === product.ProductId ? { ...l, ...snapshot(product), Qty: nextQty } : l));
            return [...lines, { ...snapshot(product), Qty: nextQty }];
        });
        setToast({ id: Date.now(), message: `Added to your bag: ${product.Title}` });
    }, []);

    const setQty = useCallback((productId, qty) => {
        setCart((lines) => lines.map((l) => (l.ProductId === productId ? { ...l, Qty: Math.max(1, Math.min(qty, limit(l))) } : l)));
    }, []);

    const removeFromCart = useCallback((productId) => setCart((lines) => lines.filter((l) => l.ProductId !== productId)), []);
    const clearCart = useCallback(() => setCart([]), []);

    const isWished = useCallback((productId) => wishlist.some((w) => w.ProductId === productId), [wishlist]);
    const toggleWish = useCallback((product) => {
        setWishlist((items) => {
            const on = items.some((w) => w.ProductId === product.ProductId);
            setToast({ id: Date.now(), message: on ? "Removed from wishlist" : "Saved to your wishlist" });
            return on ? items.filter((w) => w.ProductId !== product.ProductId) : [...items, snapshot(product)];
        });
    }, []);

    const totals = useMemo(() => {
        const count = cart.reduce((n, l) => n + l.Qty, 0);
        const subtotal = cart.reduce((n, l) => n + l.SellingPrice * l.Qty, 0);
        const mrpTotal = cart.reduce((n, l) => n + l.Mrp * l.Qty, 0);
        return { count, subtotal, mrpTotal, savings: mrpTotal - subtotal };
    }, [cart]);

    const value = useMemo(
        () => ({ cart, totals, addToCart, setQty, removeFromCart, clearCart, wishlist, isWished, toggleWish, toast, clearToast: () => setToast(null), maxQty: MAX_QTY }),
        [cart, totals, addToCart, setQty, removeFromCart, clearCart, wishlist, isWished, toggleWish, toast]
    );

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => {
    const value = useContext(ShopContext);
    if (!value) throw new Error("useShop must be used inside <ShopProvider>.");
    return value;
};
