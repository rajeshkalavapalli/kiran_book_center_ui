import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Shell } from "../../components/Common/Common";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../configurations/shopRules";

const LINKS = [
    { to: "/account", label: "My orders", end: true },
    { to: "/account/requests", label: "Requests & enquiries" },
    { to: "/wishlist", label: "Wishlist" },
    { to: "/account/profile", label: "Profile & password" },
];

export default function AccountLayout() {
    const { brand } = useTheme();
    const { customer, signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <Shell sx={{ pt: { xs: 3, md: 5 } }}>
            <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, flexWrap: "wrap", pb: 2.5, borderBottom: `1px solid ${brand.color.line}` }}>
                <Box>
                    <Typography variant="overline" sx={{ color: brand.color.inkMuted }}>
                        Member since {formatDate(customer.CreatedOn)}
                    </Typography>
                    <Typography variant="h2" component="h1">Hello, {customer.Name.split(" ")[0]}</Typography>
                </Box>
                <Button
                    startIcon={<LogoutRoundedIcon />}
                    onClick={() => {
                        navigate("/", { replace: true });
                        signOut();
                    }}
                    sx={{ color: brand.color.inkSoft }}
                >
                    Sign out
                </Button>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: { xs: 2.5, md: 5 }, mt: { xs: 2, md: 3.5 } }}>
                <Box
                    component="nav"
                    aria-label="Account"
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "row", md: "column" },
                        gap: { xs: 1, md: 0.25 },
                        overflowX: "auto",
                        mx: { xs: -2, md: 0 },
                        px: { xs: 2, md: 0 },
                        scrollbarWidth: "none",
                        alignSelf: "start",
                        position: { md: "sticky" },
                        top: { md: 140 },
                    }}
                >
                    {LINKS.map((l) => (
                        <Box
                            key={l.to}
                            component={NavLink}
                            to={l.to}
                            end={l.end}
                            sx={{
                                flexShrink: 0,
                                px: { xs: 1.5, md: 1.75 },
                                py: { xs: 0.9, md: 1.1 },
                                borderRadius: `${brand.radius.sm}px`,
                                fontWeight: 600,
                                fontSize: 14,
                                color: brand.color.inkSoft,
                                textDecoration: "none",
                                border: { xs: `1px solid ${brand.color.line}`, md: "1px solid transparent" },
                                bgcolor: { xs: brand.color.card, md: "transparent" },
                                "&:hover": { color: brand.color.ink, bgcolor: brand.color.surface },
                                "&.active": { color: brand.color.bg, bgcolor: brand.color.ink, borderColor: brand.color.ink },
                            }}
                        >
                            {l.label}
                        </Box>
                    ))}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Outlet />
                </Box>
            </Box>
        </Shell>
    );
}
