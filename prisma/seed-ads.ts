import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const sampleAds = [
  {
    title: "Blaser R8 Professional Success .308 Win",
    description: "Vand carabina Blaser R8 Professional Success, calibru .308 Winchester. Arma este in stare excelenta, folosita doar la poligon de cateva ori. Include teava originala, pat din lemn de nuc, si sistem de inchidere directa. Vine cu cutia originala si certificatul de garantie. Motivul vanzarii: upgrade la alt calibru.",
    price: 12500,
    condition: "LIKE_NEW" as const,
    county: "Cluj",
    city: "Cluj-Napoca",
    categorySlug: "arme-teava-ghintuit",
  },
  {
    title: "Luneta Zeiss Victory V8 2.8-20x56",
    description: "Luneta Zeiss Victory V8 2.8-20x56, reticulul 60 iluminat. Claritate exceptionala, zoom fluid, turele balistice ASV+. Folosita un sezon de vanatoare, fara zgarieturi sau defecte. Include capacele originale si cutia. Ideala pentru vanatoare la distanta medie si lunga.",
    price: 8900,
    condition: "LIKE_NEW" as const,
    county: "Brasov",
    city: "Brasov",
    categorySlug: "lunete",
  },
  {
    title: "Beretta 686 Silver Pigeon I 12/76",
    description: "Beretta 686 Silver Pigeon I, calibru 12/76, tevi de 71cm. Arma clasica de vanatoare si trap, in stare foarte buna. Mecanismul functioneaza perfect, tevile sunt curate si fara uzura vizibila. Include 5 soctori mobili si cheia pentru schimbat. Ideala pentru vanatoare la pasari sau tir sportiv.",
    price: 5800,
    condition: "USED" as const,
    county: "Timis",
    city: "Timisoara",
    categorySlug: "arme-teava-lisa",
  },
  {
    title: "Termoviziune Pulsar Thermion 2 XP50 Pro",
    description: "Vand luneta cu termoviziune Pulsar Thermion 2 XP50 Pro. Senzor de 640x480, refresh rate 50Hz, detectie pana la 2000m. Display AMOLED de inalta rezolutie. Baterie integrata + baterie externa inclusa. Perfecta pentru vanatoare nocturna la mistret. Achizitionata in urma cu 6 luni, factura si garantie.",
    price: 18500,
    condition: "LIKE_NEW" as const,
    county: "Hunedoara",
    city: "Deva",
    categorySlug: "termoviziune",
  },
  {
    title: "Cutit de vanatoare Joker Ember flat",
    description: "Cutit de vanatoare Joker model Ember, lama fixa din otel inoxidabil (11cm). Maner din lemn de maslin. Fabricat in Spania. Nou, nefolosit, in teaca de piele originala. Ideal pentru prelucrarea vanatului.",
    price: 320,
    condition: "NEW" as const,
    county: "Bucuresti",
    city: "Bucuresti",
    categorySlug: "cutite-vanatoare",
  },
  {
    title: "Binoclu Swarovski EL 10x42",
    description: "Binoclu Swarovski EL 10x42 WB, generatia actuala. Optica impecabila, camp vizual larg, ergonomie perfecta. Folosit cu grija, pastrat in husa originala. Include curea de gat si capacele de protectie. Unul dintre cele mai bune binocluri de vanatoare din lume.",
    price: 7200,
    condition: "USED" as const,
    county: "Sibiu",
    city: "Sibiu",
    categorySlug: "binocluri",
  },
  {
    title: "CZ 557 Lux .30-06 Springfield",
    description: "Carabina CZ 557 Lux, calibru .30-06 Springfield. Pat din lemn de nuc, teva de 60cm, tragaci reglabil. Arma noua, 0 cartuse trase, achizitionata recent dar am ales alt model. Vine cu toata documentatia si cutia originala.",
    price: 4200,
    condition: "NEW" as const,
    county: "Iasi",
    city: "Iasi",
    categorySlug: "arme-teava-ghintuit",
  },
  {
    title: "Bocanci Meindl Island MFS Active 42",
    description: "Bocanci de vanatoare Meindl Island MFS Active, marimea 42. Membrana Gore-Tex, talpa Vibram, suport glezna excelent. Folositi doua sezoane, inca in stare foarte buna. Ideali pentru teren montan.",
    price: 450,
    condition: "USED" as const,
    county: "Neamt",
    city: "Piatra Neamt",
    categorySlug: "incaltaminte",
  },
  {
    title: "Glock 17 Gen5 9mm Para",
    description: "Vand pistol Glock 17 Gen5, calibru 9x19mm. Arma in stare perfecta, aproximativ 500 cartuse trase. Include 2 incarcatoare originale, cutie, perie de curatat si cheie pentru spate. Toate actele la zi. Predare doar prin armurier autorizat.",
    price: 3200,
    condition: "LIKE_NEW" as const,
    county: "Constanta",
    city: "Constanta",
    categorySlug: "arme-scurte",
  },
  {
    title: "Cartuse Rottweil Brenneke Classic 12/70 - 100buc",
    description: "Lot de 100 cartuse Rottweil Brenneke Classic, calibru 12/70, glont de 31.5g. Ideale pentru vanatoarea la mistret. Sigilate, nefolosite. Pret pentru tot lotul. Se pot trimite doar prin armurier autorizat.",
    price: 550,
    condition: "NEW" as const,
    county: "Prahova",
    city: "Ploiesti",
    categorySlug: "cartuse-glont",
  },
  {
    title: "Rucsac Beretta Modular 35L camuflaj",
    description: "Rucsac Beretta Modular Backpack 35 litri, camuflaj Optifade. Compartimente multiple, sistem MOLLE, bretele ergonomice. Folosit o singura data, practic nou. Include husa pentru arma montata lateral.",
    price: 380,
    condition: "LIKE_NEW" as const,
    county: "Dolj",
    city: "Craiova",
    categorySlug: "rucsaci-genti",
  },
  {
    title: "Seif arme Rottner Guntronic 5 - 5 arme",
    description: "Seif pentru arme lungi Rottner Guntronic 5, capacitate 5 arme. Inchidere electronica cu cod, clasa de securitate S1. Dimensiuni: 150x30x28cm. Folosit 2 ani, functioneaza perfect. Include 2 chei de urgenta. Se poate livra in Bucuresti sau se ridica personal.",
    price: 1800,
    condition: "USED" as const,
    county: "Bucuresti",
    city: "Bucuresti",
    categorySlug: "seifuri-securizare",
  },
  {
    title: "Punct rosu Aimpoint Micro H-2 2MOA",
    description: "Red dot Aimpoint Micro H-2, 2 MOA. Baterie dureaza pana la 5 ani in utilizare continua. Montura Blaser inclusa. In stare perfecta, fara zgarieturi pe lentile. Ideal pentru vanatoare la aproape si tir dinamic.",
    price: 3400,
    condition: "LIKE_NEW" as const,
    county: "Mures",
    city: "Targu Mures",
    categorySlug: "puncte-rosii",
  },
  {
    title: "Haina vanatoare Harkila Pro Hunter X Gore-Tex - L",
    description: "Haina de vanatoare Harkila Pro Hunter X, marimea L. Membrana Gore-Tex, impermeabila si respirabila. Culoare verde inchis. Buzunare multiple, captuseala calda detasabila. Folosita un sezon, stare excelenta.",
    price: 900,
    condition: "LIKE_NEW" as const,
    county: "Suceava",
    city: "Suceava",
    categorySlug: "imbracaminte",
  },
  {
    title: "Brat Hatsan Escort AS 12/76 semi-auto",
    description: "Arma semiautomata Hatsan Escort AS, calibru 12/76 magnum. Sistem cu gaze, tevi de 71cm, camera de 76mm. Include 5 soctori. Functioneaza impecabil, folosita la vanatoare de pasari timp de 3 sezoane. Pret negociabil.",
    price: 1600,
    condition: "USED" as const,
    county: "Galati",
    city: "Galati",
    categorySlug: "arme-teava-lisa",
    isNegotiable: true,
  },
  {
    title: "Telemetru Leica Rangemaster CRF 2800.COM",
    description: "Telemetru laser Leica Rangemaster CRF 2800.COM cu Bluetooth. Masurare pana la 2800 yarzi, calcul balistic integrat (temperatura, presiune, unghi). Conectare la Leica Ballistics app. Nou, in cutie sigilata.",
    price: 4100,
    condition: "NEW" as const,
    county: "Brasov",
    city: "Brasov",
    categorySlug: "telemetrie",
  },
];

async function main() {
  // Get or create a demo user
  let demoUser = await prisma.user.findUnique({ where: { email: "demo@lagoana.ro" } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: "demo@lagoana.ro",
        name: "Vanator Pasionat",
        isPhoneVerified: true,
        county: "Cluj",
        city: "Cluj-Napoca",
        phone: "0745 123 456",
        bio: "Vanator cu experienta de peste 15 ani. Vand echipament de calitate.",
      },
    });
  }

  // Get a second demo user for variety
  let demoUser2 = await prisma.user.findUnique({ where: { email: "demo2@lagoana.ro" } });
  if (!demoUser2) {
    demoUser2 = await prisma.user.create({
      data: {
        email: "demo2@lagoana.ro",
        name: "SportArm SRL",
        isPhoneVerified: true,
        isIdVerified: true,
        county: "Bucuresti",
        city: "Bucuresti",
        phone: "0721 456 789",
        bio: "Magazin autorizat de arme si echipament de vanatoare.",
      },
    });
  }

  const users = [demoUser, demoUser2];

  console.log("Creating sample ads...");

  for (let i = 0; i < sampleAds.length; i++) {
    const ad = sampleAds[i];

    const category = await prisma.category.findUnique({ where: { slug: ad.categorySlug } });
    if (!category) {
      console.log(`  Skipping "${ad.title}" - category "${ad.categorySlug}" not found`);
      continue;
    }

    const slug = ad.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60) + "-" + Date.now().toString(36) + i;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Stagger creation dates so they don't all show the same time
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - (sampleAds.length - i) * 3);

    await prisma.ad.create({
      data: {
        userId: users[i % 2].id,
        categoryId: category.id,
        title: ad.title,
        slug,
        description: ad.description,
        price: ad.price,
        currency: "RON",
        isNegotiable: (ad as { isNegotiable?: boolean }).isNegotiable || false,
        condition: ad.condition,
        county: ad.county,
        city: ad.city,
        status: "ACTIVE",
        createdAt,
        expiresAt,
      },
    });

    console.log(`  Created: ${ad.title}`);
  }

  console.log(`\nDone! Created ${sampleAds.length} sample ads.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
