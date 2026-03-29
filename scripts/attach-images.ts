import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const imageMap: Record<string, string> = {
  "Blaser R8": "arme",
  "Zeiss Victory": "luneta",
  "Beretta 686": "beretta",
  "Pulsar Thermion": "thermal",
  "Joker Ember": "cutit",
  "Swarovski EL": "binoclu",
  "CZ 557": "cz557",
  "Meindl Island": "bocanci",
  "Glock 17": "glock",
  "Rottweil Brenneke": "cartuse",
  "Beretta Modular": "rucsac",
  "Rottner Guntronic": "seif",
  "Aimpoint Micro": "reddot",
  "Harkila Pro": "haina",
  "Hatsan Escort": "hatsan",
  "Leica Rangemaster": "telemetru",
};

async function main() {
  const ads = await prisma.ad.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, title: true },
  });

  console.log(`Found ${ads.length} ads, attaching images...\n`);

  for (const ad of ads) {
    // Find matching image
    let imageSlug: string | null = null;
    for (const [keyword, slug] of Object.entries(imageMap)) {
      if (ad.title.includes(keyword)) {
        imageSlug = slug;
        break;
      }
    }

    if (!imageSlug) {
      console.log(`  No image match for: ${ad.title}`);
      continue;
    }

    // Check if already has images
    const existingImages = await prisma.adImage.count({ where: { adId: ad.id } });
    if (existingImages > 0) {
      console.log(`  Already has images: ${ad.title}`);
      continue;
    }

    await prisma.adImage.create({
      data: {
        adId: ad.id,
        url: `/uploads/demo/${imageSlug}.webp`,
        thumbnailUrl: `/uploads/demo/${imageSlug}.webp`,
        position: 0,
      },
    });

    console.log(`  Attached ${imageSlug}.webp -> ${ad.title}`);
  }

  console.log("\nDone!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
