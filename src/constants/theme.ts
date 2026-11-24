import { Platform, TextStyle } from "react-native";

export const colors = {
  primary: "#D4502F",
  primarySoft: "#FCEBE6",
  background: "#FFFFFF",
  surface: "#F7F7F7",
  text: "#1B1B1B",
  textSecondary: "#555555",
  muted: "#8C8C8C",
  border: "#E9E9E9",
  star: "#F5A623",
  verified: "#2F80ED",
  white: "#FFFFFF",
  teal : "#0E9384",
  success: "#1E9E5A",
  successSoft: "#E4F5EC",
  warning: "#D98200",
  warningSoft: "#FFF1D6",
  danger: "#D93025",
  dangerSoft: "#FDE7E5",
  placeholder: "#E4E4E4",
  overlay: "rgba(0,0,0,0.35)",
};

// Kategoriya ranglari: faqat ikonka va yengil fon uchun (asosiy rang qizil bo'lib qoladi)
export const categoryColors = {
  all: { accent: "#D4502F", soft: "#FCEBE6" },
  countries: { accent: "#2F6FED", soft: "#EAF2FF" },
  city: { accent: "#7A4DE0", soft: "#F3EDFF" },
  mountain: { accent: "#1E9E5A", soft: "#E8F7EE" },
  sea: { accent: "#0E9384", soft: "#E3F7F7" },
  culture: { accent: "#C27A12", soft: "#FFF3DE" },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 24, pill: 999 };

// Matn o'lchamlari shkalasi
export const typography = {
  caption: { fontSize: 12, lineHeight: 16 },
  small: { fontSize: 13, lineHeight: 18 },
  body: { fontSize: 14, lineHeight: 20 },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: "700" as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: "700" as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: "800" as const },
  headline: { fontSize: 24, lineHeight: 30, fontWeight: "800" as const },
};

// Yengil soyalar
export const shadows = {
  card: {
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  soft: {
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
};

// Teginish maydoni uchun minimal o'lcham (44 px)
export const TOUCH = 44;

// Veb brauzerda input fokuslanganda chiqadigan standart qora outline'ni o'chiradi
export const noFocusOutline: TextStyle =
  Platform.OS === "web"
    ? ({ outlineStyle: "none", outlineWidth: 0 } as unknown as TextStyle)
    : {};
