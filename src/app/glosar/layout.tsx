import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glosar de Vanatoare - Terminologie Romaneasca",
  description:
    "Glosar complet cu termeni de vanatoare in limba romana. Definitii pentru batai, goana, dibuit, panda, trofeu, calibru, luneta si multi altii.",
  keywords: [
    "glosar vanatoare",
    "termeni vanatoare",
    "terminologie vanatoare",
    "dictionar vanatoare",
    "vanatoare Romania",
  ],
};

export default function GlosarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
