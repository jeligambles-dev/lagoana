import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ adId: string }> }
) {
  const { adId } = await params;

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        title: true,
        price: true,
        currency: true,
        city: true,
        county: true,
        category: { select: { name: true } },
      },
    });

    if (!ad) {
      return new Response("Anunt negasit", { status: 404 });
    }

    const priceText =
      ad.price != null
        ? `${ad.price.toLocaleString("ro-RO")} ${ad.currency}`
        : "Pret la cerere";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0B0B0B",
            padding: "60px",
          }}
        >
          {/* Top: category badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#1B3A2B",
                color: "#D4A843",
                fontSize: 24,
                padding: "8px 20px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              {ad.category.name}
            </div>
          </div>

          {/* Middle: title + price */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#EDEDED",
                lineHeight: 1.2,
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {ad.title}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "#D4A843",
              }}
            >
              {priceText}
            </div>
          </div>

          {/* Bottom: location + branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: 28,
                color: "#888888",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#888888"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {ad.city}, {ad.county}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#D4A843",
                letterSpacing: "2px",
              }}
            >
              lagoana.ro
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error("OG image generation error:", e);
    return new Response("Eroare la generarea imaginii", { status: 500 });
  }
}
