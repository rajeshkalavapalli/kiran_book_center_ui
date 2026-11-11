// Customer account service: sign in, register, profile, password and saved addresses.
// Calls the customer API: POST /auth/login, POST /auth/register, GET /auth/me, PUT /auth/password, /account/*.
import { del, get, post, put, readSession, saveSession } from "../configurations/api-config";
import { isEmail, isMobile } from "../configurations/shopRules";

// The signed-in customer ({ CustomerId, Name, Mobile, Email, ... }) or null.
export const getSessionCustomer = () => readSession()?.customer || null;

// Stores the customer and token the API sent back after sign-in, sign-up or a first order.
export const startSession = ({ customer, token, expiresAt }) => {
    saveSession({ customer, token, expiresAt });
    return customer;
};

export const signOut = () => saveSession(null);

export const login = async ({ mobile, password }) => {
    if (!isMobile(mobile) || !password) throw Object.assign(new Error("Enter your 10-digit mobile number and password."), { status: 400 });
    return startSession(await post("/auth/login", { mobile: mobile.trim(), password }));
};

// Checks a new customer's details before sending (the API checks the same rules again).
export const validateNewCustomer = ({ name, mobile, email, password }) => {
    if (!String(name || "").trim()) return "Enter your name.";
    if (!isMobile(mobile)) return "Enter a valid 10-digit mobile number.";
    if (!isEmail(email)) return "That email address doesn't look right.";
    if (String(password || "").length < 8) return "Choose a password of at least 8 characters.";
    return null;
};

export const register = async (form) => {
    const problem = validateNewCustomer(form);
    if (problem) throw Object.assign(new Error(problem), { status: 400 });
    return startSession(await post("/auth/register", { name: form.name, mobile: form.mobile, email: form.email || null, password: form.password }));
};

// Re-checks the session with the API (signs out if the account was paused or the session ended).
export const getMe = async () => {
    const { customer } = await get("/auth/me");
    const s = readSession();
    if (s) saveSession({ ...s, customer });
    return customer;
};

export const getAddresses = () => get("/account/addresses");

export const addAddress = (address) => post("/account/addresses", address);

export const deleteAddress = (addressId) => del(`/account/addresses/${addressId}`);

export const updateProfile = async (customerId, { name, email }) => {
    if (!String(name || "").trim()) throw Object.assign(new Error("Enter your name."), { status: 400 });
    if (!isEmail(email)) throw Object.assign(new Error("That email address doesn't look right."), { status: 400 });
    const { customer } = await put("/account/profile", { name, email: email || null });
    const s = readSession();
    if (s) saveSession({ ...s, customer });
    return customer;
};

export const changePassword = (customerId, { current, next }) => put("/auth/password", { current, next });
