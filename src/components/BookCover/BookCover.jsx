import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import BackpackRoundedIcon from "@mui/icons-material/BackpackRounded";
import { fileUrl } from "../../configurations/api-config";

// Product image. Shows the real photo when there is one; otherwise a clean, neutral
// placeholder (solid tint + title) so grids still look tidy before photos are uploaded.
// The tint is picked from the title, so the same product always looks the same.

const hash = (text) => [...String(text)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const ICON = { BOOK: MenuBookRoundedIcon, NOTEBOOK: EditNoteRoundedIcon, STATIONERY: CreateRoundedIcon, KIT: BackpackRoundedIcon };
const TYPE = { BOOK: "Book", NOTEBOOK: "Notebook", STATIONERY: "Stationery", KIT: "School kit" };

export default function BookCover({ product, compact = false, mini = false, sx }) {
    const { brand } = useTheme();
    const image = fileUrl(product.Images?.[0] || product.Image);
    const tint = brand.cover[hash(product.Title) % brand.cover.length];
    const Icon = ICON[product.ProductType] || MenuBookRoundedIcon;
    const isBook = product.ProductType === "BOOK" || product.ProductType === "KIT" || !product.ProductType;

    return (
        <Box sx={{ position: "relative", width: "100%", aspectRatio: "3 / 4", ...sx }}>
            {image ? (
                <Box component="img" src={image} alt={product.Title} loading="lazy" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
                <Box
                    role="img"
                    aria-label={product.Title}
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: mini ? "3px" : isBook ? "4px 8px 8px 4px" : "10px",
                        bgcolor: tint,
                        color: brand.color.white,
                        boxShadow: isBook ? brand.shadow.book : "none",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        p: mini ? 0.6 : compact ? 1.5 : 2.5,
                        pl: mini ? 0.9 : compact ? 2 : 3,
                        // a quiet spine line on books
                        "&::before": isBook ? { content: '""', position: "absolute", left: mini ? 3 : 7, top: 0, bottom: 0, width: "1px", bgcolor: "rgba(255,255,255,0.18)" } : {},
                    }}
                >
                    {!mini && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, opacity: 0.8 }}>
                            <Icon sx={{ fontSize: compact ? 14 : 18 }} />
                            <Box sx={{ fontSize: compact ? 9 : 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.ClassLevel || TYPE[product.ProductType] || "Book"}</Box>
                        </Box>
                    )}
                    <Box
                        sx={{
                            mt: mini ? 0 : compact ? 1.25 : 2,
                            fontFamily: brand.font.display,
                            fontWeight: 600,
                            fontSize: mini ? 7.5 : compact ? 13 : 20,
                            lineHeight: 1.2,
                            letterSpacing: "-0.01em",
                            display: "-webkit-box",
                            WebkitLineClamp: mini ? 4 : 5,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {product.Title}
                    </Box>
                    <Box sx={{ flex: 1 }} />
                    {!mini && product.Author && <Box sx={{ fontSize: compact ? 10 : 12, opacity: 0.75, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.Author}</Box>}
                </Box>
            )}
        </Box>
    );
}
