import { useEffect, useState } from "react";
import { Alert, Box, Button, Link, Skeleton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import { Link as RouterLink, useParams } from "react-router-dom";

import { HistoryNotes, StatusStamp, StatusTrack } from "../../components/Status/Status";
import { FormError, Panel, PaymentDetails } from "../../components/Forms/Forms";
import { useAuth } from "../../context/AuthContext";
import { acceptQuote, cancelRequest, getRequest, listRequests } from "../../services/requests";
import { rupees } from "../../configurations/format";
import { REQUEST_CAN_CANCEL, REQUEST_STATUS_LABEL, REQUEST_STEPS, formatDate } from "../../configurations/shopRules";

export function RequestsList() {
    const { brand } = useTheme();
    const { customer } = useAuth();
    const [requests, setRequests] = useState(null);

    useEffect(() => {
        let live = true;
        listRequests(customer.CustomerId).then((r) => live && setRequests(r));
        return () => {
            live = false;
        };
    }, [customer.CustomerId]);

    return (
        <Box sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                <Button component={RouterLink} to="/request" variant="contained" color="secondary">Request a book</Button>
                <Button component={RouterLink} to="/school-orders" variant="outlined" sx={{ bgcolor: brand.color.card }}>School / college enquiry</Button>
            </Box>
            {!requests ? (
                <Skeleton variant="rounded" height={180} />
            ) : !requests.length ? (
                <Panel>
                    <Typography sx={{ color: brand.color.inkMuted, textAlign: "center", py: 3 }}>You haven't sent any requests yet.</Typography>
                </Panel>
            ) : (
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gap: 1.5 }}>
                    {requests.map((r) => (
                        <Box component="li" key={r.RequestNo}>
                            <Box
                                component={RouterLink}
                                to={`/account/requests/${r.RequestNo}`}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto auto",
                                    alignItems: "center",
                                    gap: 2,
                                    p: { xs: 2, sm: 2.25 },
                                    bgcolor: brand.color.card,
                                    border: `1px solid ${r.Status === "QUOTED" ? brand.color.amber : brand.color.line}`,
                                    borderRadius: `${brand.radius.md}px`,
                                    textDecoration: "none",
                                    color: brand.color.ink,
                                    "&:hover": { borderColor: brand.color.ink },
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                                        <Typography sx={{ fontFamily: brand.font.mono, fontSize: 13.5 }}>{r.RequestNo}</Typography>
                                        <StatusStamp status={r.Status} label={REQUEST_STATUS_LABEL[r.Status]} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 600, mt: 0.5, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {r.RequestType === "BULK" ? `${r.InstitutionName} · ${r.Items.length} titles` : r.Items[0]?.Title || "Book list (attached)"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: brand.color.inkMuted }}>{r.RequestType === "BULK" ? "Bulk enquiry" : "Book request"} · {formatDate(r.CreatedOn)}</Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 700 }}>{r.QuoteTotal != null ? rupees(r.QuoteTotal) : ""}</Typography>
                                <ChevronRightRoundedIcon sx={{ color: brand.color.inkFaint }} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export function RequestDetail() {
    const { brand } = useTheme();
    const { requestNo } = useParams();
    const { customer } = useAuth();
    const [req, setReq] = useState(undefined);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let live = true;
        getRequest(customer.CustomerId, requestNo)
            .then((r) => live && setReq(r))
            .catch((e) => live && (setReq(null), setError(e.message)));
        return () => {
            live = false;
        };
    }, [customer.CustomerId, requestNo]);

    if (req === undefined) return <Skeleton variant="rounded" height={320} />;
    if (!req) return <FormError message={error} />;

    const act = async (fn) => {
        setBusy(true);
        setError("");
        try {
            setReq(await fn(customer.CustomerId, req.RequestNo));
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const quoted = req.QuoteTotal != null;
    const expired = req.QuoteValidUntil && req.QuoteValidUntil < new Date().toISOString().slice(0, 10);
    const th = { textAlign: "left", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: brand.color.inkMuted, py: 1, px: 1, borderBottom: `1px solid ${brand.color.lineStrong}` };
    const td = { py: 1.25, px: 1, borderBottom: `1px solid ${brand.color.steelMist}`, fontSize: 14, verticalAlign: "top" };

    return (
        <Box sx={{ display: "grid", gap: 2.5 }}>
            <Box>
                <Link component={RouterLink} to="/account/requests" sx={{ fontSize: 13 }}>← All requests</Link>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.75, flexWrap: "wrap" }}>
                    <Typography variant="h3" component="h2" sx={{ fontFamily: brand.font.mono, fontWeight: 500, fontSize: 22 }}>{req.RequestNo}</Typography>
                    <StatusStamp status={req.Status} label={REQUEST_STATUS_LABEL[req.Status]} />
                </Box>
                <Typography variant="body2" sx={{ color: brand.color.inkMuted, mt: 0.5 }}>
                    {req.RequestType === "BULK" ? `Bulk enquiry for ${req.InstitutionName}` : "Book request"} · sent {formatDate(req.CreatedOn, true)}
                </Typography>
            </Box>
            <FormError message={error} />

            {req.Status === "QUOTED" && !req.AcceptedOn && (
                <Box sx={{ p: { xs: 2.25, sm: 3 }, borderRadius: `${brand.radius.md}px`, bgcolor: brand.color.amberMist, border: `1.5px solid ${brand.color.amber}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Box>
                        <Typography variant="h4">Your quote is ready: {rupees(req.QuoteTotal)}</Typography>
                        <Typography variant="body2" sx={{ color: brand.color.inkSoft, mt: 0.5 }}>
                            {expired ? "This quote has expired. Ask the shop for a fresh one." : `Valid until ${formatDate(req.QuoteValidUntil)}. Accept it to see the payment details.`}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant="outlined" disabled={busy} onClick={() => act(cancelRequest)} sx={{ bgcolor: brand.color.card }}>No thanks</Button>
                        <Button variant="contained" disabled={busy || expired} onClick={() => act(acceptQuote)}>Accept quote</Button>
                    </Box>
                </Box>
            )}

            {req.Status === "QUOTED" && req.AcceptedOn && (
                <Panel title="Pay to confirm" sx={{ borderColor: brand.color.amber }}>
                    <PaymentDetails amount={rupees(req.QuoteTotal)} reference={req.RequestNo} />
                </Panel>
            )}

            {req.Status === "REJECTED" && req.RejectReason && <Alert severity="info">{req.RejectReason}</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" }, gap: 2.5, alignItems: "start" }}>
                <Panel title={quoted ? "Quote" : "What you asked for"}>
                    <Box sx={{ overflowX: "auto" }}>
                        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                            <thead>
                                <tr>
                                    <Box component="th" sx={th}>Title</Box>
                                    <Box component="th" sx={{ ...th, textAlign: "right" }}>Qty</Box>
                                    {quoted && <Box component="th" sx={{ ...th, textAlign: "right" }}>Price</Box>}
                                    {quoted && <Box component="th" sx={{ ...th, textAlign: "right" }}>Amount</Box>}
                                </tr>
                            </thead>
                            <tbody>
                                {req.Items.map((it) => (
                                    <tr key={it.LineNumber}>
                                        <Box component="td" sx={td}>
                                            <Box sx={{ fontWeight: 600 }}>{it.Title}</Box>
                                            <Box sx={{ fontSize: 12.5, color: brand.color.inkMuted }}>{[it.Author, it.Publisher, it.ClassLevel].filter(Boolean).join(" · ")}</Box>
                                            {it.IsAvailable === false && <Box sx={{ fontSize: 12.5, color: brand.color.danger, fontWeight: 600 }}>Not available</Box>}
                                        </Box>
                                        <Box component="td" sx={{ ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{it.Qty}</Box>
                                        {quoted && <Box component="td" sx={{ ...td, textAlign: "right" }}>{it.QuotedUnitPrice != null ? rupees(it.QuotedUnitPrice) : "–"}</Box>}
                                        {quoted && <Box component="td" sx={{ ...td, textAlign: "right", fontWeight: 600 }}>{it.QuotedUnitPrice != null && it.IsAvailable !== false ? rupees(it.QuotedUnitPrice * it.Qty) : "–"}</Box>}
                                    </tr>
                                ))}
                            </tbody>
                        </Box>
                    </Box>
                    {quoted && (
                        <Box sx={{ mt: 1.5, ml: "auto", maxWidth: 280, fontSize: 14 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}><span>Items</span><span>{rupees(req.QuoteItemsTotal)}</span></Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}><span>Delivery</span><span>{req.QuoteShipping ? rupees(req.QuoteShipping) : "Free"}</span></Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75, mt: 0.5, borderTop: `1px solid ${brand.color.line}`, fontWeight: 700, fontSize: 16 }}><span>Total (incl. GST)</span><span>{rupees(req.QuoteTotal)}</span></Box>
                        </Box>
                    )}
                    {req.QuoteNote && <Typography variant="body2" sx={{ mt: 2, p: 1.5, bgcolor: brand.color.surface, borderRadius: `${brand.radius.sm}px` }}><strong>From the shop:</strong> {req.QuoteNote}</Typography>}
                    {req.Note && <Typography variant="body2" sx={{ mt: 1.5, color: brand.color.inkMuted }}><strong>Your note:</strong> {req.Note}</Typography>}
                    {req.Attachments?.length > 0 && (
                        <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {req.Attachments.map((a) => (
                                <Box key={a.FileName} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.4, border: `1px solid ${brand.color.line}`, borderRadius: `${brand.radius.xs}px`, fontSize: 12.5 }}>
                                    <AttachFileRoundedIcon sx={{ fontSize: 15 }} /> {a.FileName}
                                </Box>
                            ))}
                        </Box>
                    )}
                </Panel>

                <Panel title="Progress">
                    <StatusTrack steps={REQUEST_STEPS[req.FulfilmentType]} labels={REQUEST_STATUS_LABEL} status={req.Status} history={req.History} endedNote={req.RejectReason} />
                    {req.TrackingNo && (
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            <strong>{req.CourierName}</strong> · <Box component="span" sx={{ fontFamily: brand.font.mono }}>{req.TrackingNo}</Box>
                        </Typography>
                    )}
                    <Box sx={{ mt: 2.5 }}>
                        <HistoryNotes history={req.History} />
                    </Box>
                    {REQUEST_CAN_CANCEL.includes(req.Status) && req.Status !== "QUOTED" && (
                        <Button size="small" disabled={busy} onClick={() => act(cancelRequest)} sx={{ mt: 2, color: brand.color.danger }}>
                            Cancel this request
                        </Button>
                    )}
                </Panel>
            </Box>
        </Box>
    );
}
