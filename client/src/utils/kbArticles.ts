import articleOrbiCity from "@/assets/kb/orbi-city-sea-view.md?raw";

export interface KBArticle {
  id: string;
  title: string;
  tags: string[];
  content: string;
}

export const kbArticles: KBArticle[] = [
  {
    id: "orbi-city-sea-view",
    title: "Orbi City Sea View – სრული აღწერა",
    tags: ["orbi city", "sea view", "sales", "offer", "batumi", "hotel", "apartments"],
    content: articleOrbiCity,
  },
];
