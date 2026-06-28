export const BRAND_COLORS = {
  purple: "#650D57",
  blue: "#1851A2",
  gold: "#FFD912",
  gray: "#4F4E4D",
  red: "#C2232E",
  orangeDark: "#AE100F",
  orange: "#EA3E11",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
