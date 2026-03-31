import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar de Vanatoare Romania - Sezoane si Perioade Legale",
  description:
    "Calendar complet cu sezoanele de vanatoare din Romania. Verifica perioadele legale de vanatoare pentru cerb, caprioara, mistret, fazan, rata salbatica si alte specii.",
  keywords: [
    "calendar vanatoare",
    "sezoane vanatoare Romania",
    "perioade vanatoare",
    "cerb",
    "mistret",
    "caprioara",
    "fazan",
    "vanatoare legala",
  ],
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
