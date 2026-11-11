// The customer API (kiran_book_center_config). Every service in src/services calls it through `request`.
// Address: VITE_API in .env (default http://localhost:5100/api).

export const API = String(import.meta.env.VITE_API || "http://localhost:5100/api").replace(/\/+$/, "");

/* ---------------- signed-in customer (kept in this browser) ---------------- */
const SESSION = "kbcSession";

export const readSession = () => {
    try {
        const s = JSON.parse(localStorage.getItem(SESSION) || "null");
        if (!s?.token || !s?.customer) return null;
        if (s.expiresAt && new Date(s.expiresAt) <= new Date()) return null;
        return s;
    } catch {
        return null;
    }
};

export const saveSession = (s) => {
    try {
        if (s) localStorage.setItem(SESSION, JSON.stringify(s));
        else localStorage.removeItem(SESSION);
    } catch {
        // storage blocked: the session lasts until the tab closes
    }
};

/* ---------------- HTTP ---------------- */
export const fail = (status, message) => Object.assign(new Error(message), { status });

export const query = (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((x) => x !== "" && x != null && q.append(k, x));
        else if (v !== undefined && v !== null && v !== "") q.set(k, v);
    });
    const s = q.toString();
    return s ? `?${s}` : "";
};

// Calls the API with the customer's token (when signed in). Errors carry `status` and the API's message.
export const request = async (method, path, body) => {
    const session = readSession();
    let res;
    try {
        res = await fetch(`${API}${path}`, {
            method,
            headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw fail(0, "Can't reach the shop server right now. Please try again in a moment.");
    }
    const data = (res.headers.get("content-type") || "").includes("application/json") ? await res.json().catch(() => null) : null;
    // A signed-in request that comes back 401 means the session ended (expired or account paused).
    if (res.status === 401 && session) saveSession(null);
    if (!res.ok) throw fail(res.status, data?.message || "Something went wrong. Please try again.");
    return data;
};

export const get = (path) => request("GET", path);
export const post = (path, body = {}) => request("POST", path, body);
export const put = (path, body = {}) => request("PUT", path, body);
export const del = (path) => request("DELETE", path);

/* ---------------- photos ---------------- */
// The API stores product photos as keys like "products/<id>/<file>.jpg"; pages need a full address.
export const fileUrl = (key) => (!key || /^(data:|https?:|blob:)/.test(key) ? key : `${API}/files/${key}`);
