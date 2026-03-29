import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

console.log("Connecting to:", process.env.DATABASE_URL?.substring(0, 40) + "...");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Arme de foc",
    slug: "arme-de-foc",
    icon: "Crosshair",
    children: [
      { name: "Arme cu teava lisa", slug: "arme-teava-lisa", icon: "Crosshair" },
      { name: "Arme cu teava ghintuit", slug: "arme-teava-ghintuit", icon: "Crosshair" },
      { name: "Arme scurte", slug: "arme-scurte", icon: "Crosshair" },
      { name: "Arme cu aer comprimat", slug: "arme-aer-comprimat", icon: "Wind" },
      { name: "Arme de colectie", slug: "arme-colectie", icon: "Archive" },
    ],
  },
  {
    name: "Munitie",
    slug: "munitie",
    icon: "Target",
    children: [
      { name: "Cartuse alice", slug: "cartuse-alice", icon: "Target" },
      { name: "Cartuse glont", slug: "cartuse-glont", icon: "Target" },
      { name: "Pelete / Alice aer comprimat", slug: "pelete-alice", icon: "Target" },
      { name: "Capsule & componente reincarcare", slug: "capsule-reincarcare", icon: "Target" },
    ],
  },
  {
    name: "Optica",
    slug: "optica",
    icon: "Eye",
    children: [
      { name: "Lunete", slug: "lunete", icon: "Eye" },
      { name: "Puncte rosii / Reflex", slug: "puncte-rosii", icon: "Eye" },
      { name: "Binocluri", slug: "binocluri", icon: "Eye" },
      { name: "Dispozitive vedere nocturna", slug: "vedere-nocturna", icon: "Moon" },
      { name: "Termoviziune", slug: "termoviziune", icon: "Thermometer" },
      { name: "Telemetrie", slug: "telemetrie", icon: "Ruler" },
    ],
  },
  {
    name: "Cutite & Unelte",
    slug: "cutite-unelte",
    icon: "Knife",
    children: [
      { name: "Cutite de vanatoare", slug: "cutite-vanatoare", icon: "Knife" },
      { name: "Cutite de supravietuire", slug: "cutite-supravietuire", icon: "Knife" },
      { name: "Unelte & accesorii", slug: "unelte-accesorii", icon: "Wrench" },
    ],
  },
  {
    name: "Arcuri & Arbalete",
    slug: "arcuri-arbalete",
    icon: "Bow",
    children: [],
  },
  {
    name: "Echipament",
    slug: "echipament",
    icon: "Shirt",
    children: [
      { name: "Imbracaminte", slug: "imbracaminte", icon: "Shirt" },
      { name: "Incaltaminte", slug: "incaltaminte", icon: "Footprints" },
      { name: "Rucsaci & genti", slug: "rucsaci-genti", icon: "Backpack" },
      { name: "Camuflaj & accesorii teren", slug: "camuflaj-teren", icon: "TreePine" },
    ],
  },
  {
    name: "Accesorii arme",
    slug: "accesorii-arme",
    icon: "Settings",
    children: [
      { name: "Seifuri & securizare", slug: "seifuri-securizare", icon: "Lock" },
      { name: "Curatare & intretinere", slug: "curatare-intretinere", icon: "Sparkles" },
      { name: "Chingi, tocuri, huse", slug: "chingi-tocuri-huse", icon: "Package" },
      { name: "Bipoduri & suporturi", slug: "bipoduri-suporturi", icon: "Settings" },
      { name: "Alte accesorii", slug: "alte-accesorii", icon: "MoreHorizontal" },
    ],
  },
  {
    name: "Caini de vanatoare",
    slug: "caini-vanatoare",
    icon: "Dog",
    children: [
      { name: "De vanzare", slug: "caini-vanzare", icon: "Dog" },
      { name: "De monta", slug: "caini-monta", icon: "Dog" },
    ],
  },
  {
    name: "Servicii",
    slug: "servicii",
    icon: "MapPin",
    children: [
      { name: "Fonduri de vanatoare", slug: "fonduri-vanatoare", icon: "TreePine" },
      { name: "Poligoane", slug: "poligoane", icon: "Target" },
      { name: "Cursuri & autorizari", slug: "cursuri-autorizari", icon: "GraduationCap" },
    ],
  },
];

async function main() {
  console.log("Seeding categories...");

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, position: i },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        position: i,
      },
    });

    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, icon: child.icon, position: j, parentId: parent.id },
        create: {
          name: child.name,
          slug: child.slug,
          icon: child.icon,
          position: j,
          parentId: parent.id,
        },
      });
    }
  }

  console.log("Seeding admin user...");
  const adminPassword = await hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@lagoana.ro" },
    update: {},
    create: {
      email: "admin@lagoana.ro",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
