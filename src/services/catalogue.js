// Catalogue service: categories, products, the home page and shop filters. Pages call only these functions.
// Categories, shop details and filter values are loaded once at start-up (services/shopData.js);
// products are fetched from the customer API (GET /products, /products/:slug, /home).
import { get, query } from "../configurations/api-config";
import { categories, facets, settings, zones } from "./shopData";

export const topCategories = () => categories.filter((c) => !c.ParentCategoryId).sort((a, b) => a.SortOrder - b.SortOrder);
export const childCategories = (parentId) => categories.filter((c) => c.ParentCategoryId === parentId).sort((a, b) => a.SortOrder - b.SortOrder);
export const categoryBySlug = (slug) => categories.find((c) => c.Slug === slug) || null;
export const categoryById = (id) => categories.find((c) => c.CategoryId === id) || null;

export const getSettings = async () => settings;
export const getZones = async () => zones;
export const getCategories = async () => categories;

export const SORTS = {
    relevance: "Most relevant",
    newest: "Newest first",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    discount: "Biggest saving",
};

/**
 * filters: { q, category, types[], classLevel, board, inStock, netOnly, minPrice, maxPrice, sort, page }
 * returns { items, total, page, pageSize }
 */
export const getProducts = (filters = {}) =>
    get(
        `/products${query({
            q: filters.q,
            category: filters.category,
            type: filters.types,
            class: filters.classLevel,
            board: filters.board,
            stock: filters.inStock ? 1 : null,
            net: filters.netOnly ? 1 : null,
            min: filters.minPrice,
            max: filters.maxPrice,
            sort: filters.sort,
            page: filters.page,
        })}`
    );

// Values the shop filters can offer (class levels, boards, price range), loaded at start-up.
export const getFacets = () => facets;

// { product, category, related } or null when the item doesn't exist (or is hidden).
export const getProductBySlug = async (slug) => {
    try {
        return await get(`/products/${encodeURIComponent(slug)}`);
    } catch (e) {
        if (e.status === 404) return null;
        throw e;
    }
};

// { featured, examDesk, newArrivals, counts }
export const getHome = () => get("/home");
