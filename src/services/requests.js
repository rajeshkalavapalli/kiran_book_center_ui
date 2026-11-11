// Product requests and school/college bulk enquiries. Calls the customer API: POST /requests, GET /requests,
// GET /requests/:requestNo, POST /requests/:requestNo/accept, POST /requests/:requestNo/cancel.
import { get, post } from "../configurations/api-config";

const MAX_FILE_MB = 5;
export const ATTACHMENT_RULES = { types: ["image/jpeg", "image/png", "image/webp", "application/pdf"], maxBytes: MAX_FILE_MB * 1024 * 1024, maxFiles: 3, label: `JPG, PNG or PDF, up to ${MAX_FILE_MB} MB each` };

// Reads a picked file as a data URL so it can travel inside the JSON request.
const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(Object.assign(new Error(`Couldn't read "${file.name}". Please pick it again.`), { status: 400 }));
        reader.readAsDataURL(file);
    });

/**
 * payload: { requestType: SINGLE|BULK, institutionName, institutionGstin, contactName, mobile, email,
 *            items[{Title, Author, Publisher, ClassLevel, Qty}], note, fulfilment, address, attachments[{ FileName, file }] }
 */
export const submitRequest = async (payload) => {
    const attachments = await Promise.all((payload.attachments || []).filter((a) => a.file).map(async (a) => ({ fileName: a.FileName, dataUrl: await readAsDataUrl(a.file) })));
    return post("/requests", {
        requestType: payload.requestType,
        institutionName: payload.institutionName || null,
        institutionGstin: payload.institutionGstin || null,
        contactName: payload.contactName,
        mobile: payload.mobile,
        email: payload.email || null,
        items: payload.items || [],
        note: payload.note || null,
        fulfilment: payload.fulfilment,
        address: payload.address || null,
        attachments,
    });
};

export const listRequests = () => get("/requests");

export const getRequest = (customerId, requestNo) => get(`/requests/${encodeURIComponent(requestNo)}`);

export const acceptQuote = (customerId, requestNo) => post(`/requests/${encodeURIComponent(requestNo)}/accept`);

export const cancelRequest = (customerId, requestNo) => post(`/requests/${encodeURIComponent(requestNo)}/cancel`);
