export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { AdGrid } from "@/components/ads/AdGrid";
import { FilterSidebar } from "@/components/ads/FilterSidebar";
import { MobileFilterSheet } from "@/components/ads/MobileFilterSheet";
import { SaveSearchButton } from "@/components/ads/SaveSearchButton";

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    county?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;
  const limit = 20;

  const where: Record<string, unknown> = { status: "ACTIVE" as const };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    const cat = await prisma.category.findUnique({
      where: { slug: params.category },
      include: { children: true },
    });
    if (cat) {
      const catIds = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: catIds };
    }
  }

  if (params.condition) where.condition = params.condition;
  if (params.county) where.county = params.county;
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
  }

  const orderBy: Record<string, string> = {};
  switch (params.sort) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    default: orderBy.createdAt = "desc";
  }

  const [ads, total, categories] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { slug: true, name: true } },
      },
      orderBy: [
        { promotedUntil: "desc" },
        orderBy,
      ],
      skip: 0,
      take: limit,
    }),
    prisma.ad.count({ where }),
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: { children: { where: { isActive: true }, orderBy: { position: "asc" } } },
      orderBy: { position: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#EDEDED]">
          {params.q ? `Rezultate pentru "${params.q}"` : "Toate anunturile"}
        </h1>
        <div className="flex items-center gap-3">
          <MobileFilterSheet categories={categories} currentParams={params} />
          <SaveSearchButton currentParams={params} />
          <span className="text-sm text-[#888]">{total} anunturi</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar categories={categories} currentParams={params} />
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#2A2A2A]">
            <div className="flex gap-2">
              <SortLink href={buildUrl(params, { sort: "newest" })} active={!params.sort || params.sort === "newest"}>
                Cele mai noi
              </SortLink>
              <SortLink href={buildUrl(params, { sort: "price_asc" })} active={params.sort === "price_asc"}>
                Pret crescator
              </SortLink>
              <SortLink href={buildUrl(params, { sort: "price_desc" })} active={params.sort === "price_desc"}>
                Pret descrescator
              </SortLink>
            </div>
          </div>

          {ads.length > 0 ? (
            <AdGrid initialAds={ads} initialTotal={total} searchParams={params} />
          ) : (
            <div className="text-center py-16">
              <p className="text-[#888] text-lg">Nu s-au gasit anunturi.</p>
              <p className="text-[#666] text-sm mt-1">Incearca alte filtre sau cuvinte cheie.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildUrl(currentParams: Record<string, string | undefined>, overrides: Record<string, string>): string {
  const params = new URLSearchParams();
  const merged = { ...currentParams, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value && key !== "page" || key === "page") {
      if (value) params.set(key, value);
    }
  }

  // Reset to page 1 if changing filters (not page)
  if (!overrides.page && params.has("page")) {
    params.delete("page");
  }

  return `/anunturi?${params.toString()}`;
}

function SortLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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
