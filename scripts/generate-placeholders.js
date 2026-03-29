const sharp = require("sharp");
const path = require("path");

const ads = [
  { slug: "arme", label: "BLASER R8", sub: ".308 Win", color: "#1B3A2B" },
  { slug: "luneta", label: "ZEISS V8", sub: "2.8-20x56", color: "#2A1B3A" },
  { slug: "beretta", label: "BERETTA 686", sub: "12/76", color: "#3A2B1B" },
  { slug: "thermal", label: "PULSAR", sub: "Thermion 2", color: "#1B2A3A" },
  { slug: "cutit", label: "JOKER EMBER", sub: "Cutit vanatoare", color: "#3A1B1B" },
  { slug: "binoclu", label: "SWAROVSKI", sub: "EL 10x42", color: "#1B3A35" },
  { slug: "cz557", label: "CZ 557 LUX", sub: ".30-06 Spring", color: "#2B3A1B" },
  { slug: "bocanci", label: "MEINDL", sub: "Island MFS 42", color: "#3A351B" },
  { slug: "glock", label: "GLOCK 17", sub: "Gen5 9mm", color: "#1B1B3A" },
  { slug: "cartuse", label: "ROTTWEIL", sub: "Brenneke x100", color: "#3A2A1B" },
  { slug: "rucsac", label: "BERETTA", sub: "Modular 35L", color: "#1B3A2A" },
  { slug: "seif", label: "ROTTNER", sub: "Guntronic 5", color: "#2A2A2A" },
  { slug: "reddot", label: "AIMPOINT", sub: "Micro H-2", color: "#3A1B2A" },
  { slug: "haina", label: "HARKILA", sub: "Pro Hunter X", color: "#1B2B1B" },
  { slug: "hatsan", label: "HATSAN", sub: "Escort AS 12/76", color: "#2B1B3A" },
  { slug: "telemetru", label: "LEICA", sub: "CRF 2800", color: "#1B3A3A" },
];

async function generate() {
  for (const ad of ads) {
    const width = 800;
    const height = 600;

    // Create SVG with product info
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${ad.color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0B0B0B;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>

      <!-- Crosshair decoration -->
      <circle cx="${width/2}" cy="${height/2 - 30}" r="80" fill="none" stroke="#C9A646" stroke-width="1" opacity="0.3"/>
      <line x1="${width/2}" y1="${height/2 - 130}" x2="${width/2}" y2="${height/2 + 70}" stroke="#C9A646" stroke-width="1" opacity="0.2"/>
      <line x1="${width/2 - 100}" y1="${height/2 - 30}" x2="${width/2 + 100}" y2="${height/2 - 30}" stroke="#C9A646" stroke-width="1" opacity="0.2"/>

      <!-- Brand -->
      <text x="${width/2}" y="${height/2 - 30}" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#C9A646" text-anchor="middle" letter-spacing="4">${ad.label}</text>
      <text x="${width/2}" y="${height/2 + 25}" font-family="Arial, sans-serif" font-size="24" fill="#EDEDED" text-anchor="middle" opacity="0.7">${ad.sub}</text>

      <!-- Lagoana watermark -->
      <text x="${width/2}" y="${height - 30}" font-family="Arial, sans-serif" font-size="14" fill="#C9A646" text-anchor="middle" opacity="0.3">lagoana.ro</text>
    </svg>`;

    const outputPath = path.join(__dirname, "..", "public", "uploads", "demo", `${ad.slug}.webp`);

    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`Created: ${ad.slug}.webp`);
  }

  console.log("\nAll placeholder images generated!");
}

generate().catch(console.error);
