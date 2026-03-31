export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { AdCard } from "@/components/ads/AdCard";
import { CategoryFilterSidebar } from "@/components/ads/CategoryFilterSidebar";
import { MobileCategoryFilterSheet } from "@/components/ads/MobileCategoryFilterSheet";
import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    condition?: string;
    county?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    subcategory?: string;
  }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { position: "asc" },
      },
      parent: { select: { name: true, slug: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Categorie negasita" };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.lagoana.ro";
  const imageUrl = category.imageUrl
    ? `${baseUrl}${category.imageUrl}`
    : `${baseUrl}/logo.png`;

  const description =
    category.description ||
    `Descopera anunturi din categoria ${category.name} pe Lagoana. Cele mai bune oferte de vanatoare si pescuit.`;

  return {
    title: `${category.name} - Anunturi | Lagoana`,
    description,
    openGraph: {
      title: `${category.name} - Anunturi | Lagoana`,
      description,
      url: `${baseUrl}/anunturi/categorie/${category.slug}`,
      siteName: "Lagoana",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: "ro_RO",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} - Anunturi | Lagoana`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await getCategory(slug);
  if (!category) notFound();

  // Construim filtrul pentru anunturi
  const where: Record<string, unknown> = { status: "ACTIVE" as const };

  // Include subcategorii
  if (sp.subcategory) {
    const subcat = category.children.find((c) => c.slug === sp.subcategory);
    if (subcat) {
      where.categoryId = subcat.id;
    } else {
      const catIds = [category.id, ...category.children.map((c) => c.id)];
      where.categoryId = { in: catIds };
    }
  } else {
    const catIds = [category.id, ...category.children.map((c) => c.id)];
    where.categoryId = { in: catIds };
  }

  if (sp.condition) where.condition = sp.condition;
  if (sp.county) where.county = sp.county;
  if (sp.minPrice || sp.maxPrice) {
    where.price = {};
    if (sp.minPrice)
      (where.price as Record<string, number>).gte = parseFloat(sp.minPrice);
    if (sp.maxPrice)
      (where.price as Record<string, number>).lte = parseFloat(sp.maxPrice);
  }

  const orderBy: Record<string, string> = {};
  switch (sp.sort) {
    case "price_asc":
      orderBy.price = "asc";
      break;
    case "price_desc":
      orderBy.price = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { slug: true, name: true } },
      },
      orderBy: [{ promotedUntil: "desc" }, orderBy],
      take: 40,
    }),
    prisma.ad.count({ where }),
  ]);

  const baseUrl = `/anunturi/categorie/${slug}`;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A2B] to-[#0B0B0B]" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 pb-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[#888] mb-3">
            <Link href="/" className="hover:text-gold transition">
              Acasa
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/anunturi" className="hover:text-gold transition">
              Anunturi
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {category.parent && (
              <>
                <Link
                  href={`/anunturi/categorie/${category.parent.slug}`}
                  className="hover:text-gold transition"
                >
                  {category.parent.name}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-gold">{category.name}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#EDEDED]">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-[#AAAAAA] mt-2 max-w-2xl text-sm sm:text-base">
              {category.description}
            </p>
          )}
          <span className="text-sm text-[#888] mt-2">
            {total} {total === 1 ? "anunt" : "anunturi"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Subcategorii */}
        {category.children.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider mb-3">
              Subcategorii
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={baseUrl}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  !sp.subcategory
                    ? "bg-gold text-[#0B0B0B]"
                    : "bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A]"
                }`}
              >
                Toate
              </Link>
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`${baseUrl}?subcategory=${sub.slug}`}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    sp.subcategory === sub.slug
                      ? "bg-gold text-[#0B0B0B]"
                      : "bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A]"
                  }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filtre - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <CategoryFilterSidebar
              categorySlug={slug}
              currentParams={sp}
            />
          </aside>

          {/* Rezultate */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#2A2A2A]">
              <div className="flex gap-2">
                <SortLink
                  href={buildUrl(baseUrl, sp, { sort: "newest" })}
                  active={!sp.sort || sp.sort === "newest"}
                >
                  Cele mai noi
                </SortLink>
                <SortLink
                  href={buildUrl(baseUrl, sp, { sort: "price_asc" })}
                  active={sp.sort === "price_asc"}
                >
                  Pret crescator
                </SortLink>
                <SortLink
                  href={buildUrl(baseUrl, sp, { sort: "price_desc" })}
                  active={sp.sort === "price_desc"}
                >
                  Pret descrescator
                </SortLink>
              </div>
              <MobileCategoryFilterSheet
                categorySlug={slug}
                currentParams={sp}
              />
            </div>

            {ads.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-[#444] mx-auto mb-3" />
                <p className="text-[#888] text-lg">
                  Nu s-au gasit anunturi in aceasta categorie.
                </p>
                <p className="text-[#666] text-sm mt-1">
                  Incearca alte filtre sau revino mai tarziu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildUrl(
  base: string,
  currentParams: Record<string, string | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams();
  const merged = { ...currentParams, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }

  // Resetam sortarea default
  if (overrides.sort === "newest") params.delete("sort");

  return `${base}?${params.toString()}`;
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm transition ${
        active
          ? "bg-gold text-[#0B0B0B]"
          : "bg-[#1E1E1E] text-[#EDEDED] hover:bg-[#2A2A2A]"
      }`}
    >
      {children}
    </a>
  );
}
