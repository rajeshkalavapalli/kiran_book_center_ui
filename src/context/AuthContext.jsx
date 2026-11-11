import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import * as account from "../services/account";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [customer, setCustomer] = useState(() => account.getSessionCustomer());

    // When the site opens with a saved sign-in, check it with the server once.
    // A paused account or an ended session signs out here instead of failing later.
    useEffect(() => {
        if (!account.getSessionCustomer()) return;
        account
            .getMe()
            .then(setCustomer)
            .catch((e) => {
                if (e.status === 401 || e.status === 403) {
                    account.signOut();
                    setCustomer(null);
                }
            });
    }, []);

    const login = useCallback(async (form) => {
        const c = await account.login(form);
        setCustomer(c);
        return c;
    }, []);

    const register = useCallback(async (form) => {
        const c = await account.register(form);
        setCustomer(c);
        return c;
    }, []);

    // After checkout creates an account, pick up the new session.
    const refresh = useCallback(() => setCustomer(account.getSessionCustomer()), []);

    const signOut = useCallback(() => {
        account.signOut();
        setCustomer(null);
    }, []);

    const value = useMemo(() => ({ customer, login, register, refresh, signOut, setCustomer }), [customer, login, register, refresh, signOut]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");
    return value;
};

// Pages that need a signed-in customer send visitors to /login and bring them back afterwards.
export function RequireCustomer({ children }) {
    const { customer } = useAuth();
    const location = useLocation();
    if (!customer) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    return children;
}
