import articleOrbiCity from "@/assets/kb/orbi-city-sea-view.md?raw";
import manifesto from "@/assets/kb/serviced-apartments-manifesto.md?raw";
import checkin from "@/assets/kb/checkin-protocol.md?raw";
import faq50 from "@/assets/kb/faq-50.md?raw";

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
  {
    id: "serviced-apartments-manifesto",
    title: "ORBI CITY: მასპინძლობის ახალი პარადიგმა (Serviced Apartments Manifesto)",
    tags: ["overview", "hospitality", "operations"],
    content: manifesto,
  },
  {
    id: "checkin-protocol",
    title: "Check-in ოპერაციული პროტოკოლი",
    tags: ["check-in", "operations", "reception"],
    content: checkin,
  },
  {
    id: "faq-50",
    title: "FAQ — 50 კითხვა/პასუხი",
    tags: ["faq", "guests", "policies", "support"],
    content: faq50,
  },
];
