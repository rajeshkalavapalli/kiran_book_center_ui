import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./index.css";
import App from "./App.jsx";
import theme from "./Theme/Theme.js";
import { ShopProvider } from "./context/ShopContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { loadShopData } from "./services/shopData";
import ShopUnavailable from "./components/Common/ShopUnavailable.jsx";

const root = createRoot(document.getElementById("root"));

const renderShop = () =>
    root.render(
        <StrictMode>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <ShopProvider>
                        <App />
                    </ShopProvider>
                </AuthProvider>
            </ThemeProvider>
        </StrictMode>
    );

const renderUnavailable = () =>
    root.render(
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ShopUnavailable onRetry={start} />
        </ThemeProvider>
    );

// Shop details, categories and filters come from the customer API before the first page is shown.
async function start() {
    try {
        await loadShopData();
        renderShop();
    } catch {
        renderUnavailable();
    }
}

start();
