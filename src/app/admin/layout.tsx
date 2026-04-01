import Link from "next/link";
import {
  LayoutDashboard, FileText, Users, FolderTree, FileStack,
  AlertTriangle, ClipboardList, ShieldCheck, Store, Image, Mail, BookOpen,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/anunturi", icon: FileText, label: "Anunturi" },
  { href: "/admin/utilizatori", icon: Users, label: "Utilizatori" },
  { href: "/admin/categorii", icon: FolderTree, label: "Categorii" },
  { href: "/admin/bannere", icon: Image, label: "Bannere" },
  { href: "/admin/armurieri", icon: Store, label: "Armurieri" },
  { href: "/admin/pagini", icon: BookOpen, label: "Pagini" },
  { href: "/admin/sectiuni", icon: FileStack, label: "Sectiuni" },
  { href: "/admin/rapoarte", icon: AlertTriangle, label: "Rapoarte" },
  { href: "/admin/audit", icon: ClipboardList, label: "Audit log" },
  { href: "/admin/email-templates", icon: Mail, label: "Email templates" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-gold" />
        <h1 className="text-xl font-bold text-[#EDEDED]">Panou de administrare</h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 shrink-0">
          <nav className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-2 space-y-1 lg:sticky lg:top-20">
            {adminLinks.map((link) => (
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
