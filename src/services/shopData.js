// Shop details, delivery zones, categories and shop filters, loaded once from the API when the site opens
// (see main.jsx), so menus and footers can read them straight away.
import { get } from "../configurations/api-config";

// Filled in by loadShopData(). Pages import these and read them directly.
export const settings = {};
export const zones = [];
export const categories = [];
export const facets = { classLevels: [], boards: [], minPrice: 0, maxPrice: 0 };

export const loadShopData = async () => {
    const [publicData, cats, filterValues] = await Promise.all([get("/settings/public"), get("/categories"), get("/facets")]);
    Object.assign(settings, publicData.settings || {});
    zones.splice(0, zones.length, ...(publicData.zones || []));
    categories.splice(0, categories.length, ...(cats || []));
    Object.assign(facets, filterValues || {});
};
