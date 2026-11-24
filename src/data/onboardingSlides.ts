import { Ionicons } from "@expo/vector-icons";
import { ImageSourcePropType, ViewStyle } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type Slide = {
  key: string;
  icon: IconName;
  title: string;
  text: string;
  colors: readonly [string, string, string];
  chips: { icon: IconName; style: ViewStyle }[];
  // Haqiqiy foto tayyor bo'lganda: image: require("@/assets/images/onboarding-1.jpg")
  image?: ImageSourcePropType;
};

export const slides: Slide[] = [
  {
    key: "world",
    icon: "earth",
    title: "Butun dunyoni kashf eting",
    text: "Dengiz sohillari, tog'lar va tarixiy shaharlar: yuzlab yo'nalish bitta ilovada.",
    colors: ["#FF9A5C", "#D4502F", "#6E2412"],
    chips: [
      { icon: "airplane", style: { left: "2%", top: "10%" } },
      { icon: "location", style: { right: "0%", top: "22%" } },
      { icon: "camera", style: { left: "8%", bottom: "12%" } },
      { icon: "sunny", style: { right: "6%", bottom: "4%" } },
    ],
  },
  {
    key: "deals",
    icon: "flame",
    title: "Eng yaxshi takliflar",
    text: "Ishonchli agentliklarning qaynoq turlari va chegirmalarini birinchi bo'lib ko'ring.",
    colors: ["#FFB454", "#E0553A", "#7A2217"],
    chips: [
      { icon: "pricetag", style: { right: "4%", top: "8%" } },
      { icon: "star", style: { left: "0%", top: "26%" } },
      { icon: "heart", style: { right: "2%", bottom: "20%" } },
      { icon: "trending-down", style: { left: "10%", bottom: "6%" } },
    ],
  },
  {
    key: "book",
    icon: "ticket",
    title: "Oson bron qiling",
    text: "Turni tanlang, agentlik bilan suhbatlashing va bronni bir necha bosishda rasmiylashtiring.",
    colors: ["#F58A6B", "#C2412A", "#5A1B10"],
    chips: [
      { icon: "chatbubble-ellipses", style: { left: "2%", top: "12%" } },
      { icon: "card", style: { right: "2%", top: "20%" } },
      { icon: "calendar", style: { left: "6%", bottom: "10%" } },
      { icon: "checkmark-circle", style: { right: "8%", bottom: "6%" } },
    ],
  },
];