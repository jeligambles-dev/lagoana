import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
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
  await mkdir(uploadDir, { recursive: true });

  // Resize to max 1920px on longest side, preserving aspect ratio
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const maxDimension = 1920;

  let resized = image;
  if (
    (metadata.width && metadata.width > maxDimension) ||
    (metadata.height && metadata.height > maxDimension)
  ) {
    resized = image.resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Get dimensions of the resized image for watermark positioning
  const resizedBuffer = await resized.toBuffer();
  const resizedMeta = await sharp(resizedBuffer).metadata();
  const imgWidth = resizedMeta.width || 1920;
  const imgHeight = resizedMeta.height || 1080;

  // Create a semi-transparent watermark SVG
  const watermarkText = "lagoana.ro";
  const fontSize = Math.max(16, Math.round(imgWidth * 0.025));
  const padding = Math.round(fontSize * 0.8);
  const watermarkSvg = Buffer.from(
    `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${imgWidth - padding}"
        y="${imgHeight - padding}"
        font-family="sans-serif"
        font-size="${fontSize}"
        fill="white"
        fill-opacity="0.3"
        text-anchor="end"
      >${watermarkText}</text>
    </svg>`
  );

  // Apply watermark and convert to WebP with quality 80
  const processedBuffer = await sharp(resizedBuffer)
    .composite([{ input: watermarkSvg, top: 0, left: 0 }])
    .webp({ quality: 80 })
    .toBuffer();

  const filename = `${session.user.id}-${Date.now()}.webp`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, processedBuffer);

  return NextResponse.json({
    url: `/api/uploads/${filename}`,
    thumbnailUrl: `/api/uploads/${filename}`,
  });
}
