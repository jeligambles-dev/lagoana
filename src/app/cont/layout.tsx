import Link from "next/link";
import { User, FileText, FileEdit, Heart, MessageSquare, Bell, BarChart3 } from "lucide-react";

const sidebarLinks = [
  { href: "/cont/profil", icon: User, label: "Profilul meu" },
  { href: "/cont/anunturile-mele", icon: FileText, label: "Anunturile mele" },
  { href: "/cont/ciorne", icon: FileEdit, label: "Ciorne" },
  { href: "/cont/analytics", icon: BarChart3, label: "Statistici" },
  { href: "/cont/favorite", icon: Heart, label: "Favorite" },
  { href: "/cont/mesaje", icon: MessageSquare, label: "Mesaje" },
  { href: "/cont/cautari-salvate", icon: Bell, label: "Cautari salvate" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <nav className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-2 space-y-1 lg:sticky lg:top-32">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#EDEDED]/80 hover:bg-[#1B3A2B]/30 hover:text-gold transition"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
