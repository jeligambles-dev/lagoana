import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Fisier lipsa." }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tip de fisier neacceptat." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Fisierul depaseste 10MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const thumbDir = path.join(uploadDir, "thumbs");
  await mkdir(uploadDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });

  const filename = `${session.user.id}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);
  const thumbpath = path.join(thumbDir, filename);

  // Get image metadata for watermark positioning
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const imgWidth = metadata.width || 800;
  const imgHeight = metadata.height || 600;

  // Create watermark SVG
  const watermarkText = "lagoana.ro";
  const fontSize = Math.max(Math.round(imgWidth * 0.03), 14);
  const watermarkSvg = Buffer.from(`
    <svg width="${imgWidth}" height="${imgHeight}">
      <style>
        .watermark {
          font-family: Arial, sans-serif;
          font-size: ${fontSize}px;
          font-weight: bold;
          fill: rgba(201, 166, 70, 0.5);
        }
      </style>
      <text x="${imgWidth - 10}" y="${imgHeight - 12}" text-anchor="end" class="watermark">${watermarkText}</text>
    </svg>
  `);

  // Process main image: resize to max 1600px, compress, add watermark
  await sharp(buffer)
    .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
    .composite([{ input: watermarkSvg, gravity: "southeast" }])
    .webp({ quality: 82 })
    .toFile(filepath);

  // Generate thumbnail: 400px wide, no watermark
  await sharp(buffer)
    .resize(400, 300, { fit: "cover" })
    .webp({ quality: 70 })
    .toFile(thumbpath);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    thumbnailUrl: `/uploads/thumbs/${filename}`,
  });
}
