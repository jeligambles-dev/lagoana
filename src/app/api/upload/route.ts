import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const HOSTGATE_UPLOAD_URL = process.env.HOSTGATE_UPLOAD_URL; // e.g. https://images.lagoana.ro/upload.php
const HOSTGATE_AUTH_TOKEN = process.env.HOSTGATE_AUTH_TOKEN;

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

  // Load the logo and resize it for watermark (scales with image size)
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const watermarkSize = Math.max(60, Math.round(imgWidth * 0.12)); // 12% of image width, min 60px
  const padding = Math.round(watermarkSize * 0.15);

  let processedBuffer: Buffer;
  try {
    const logoBuffer = await readFile(logoPath);
    const watermarkLogo = await sharp(logoBuffer)
      .resize({ width: watermarkSize, height: watermarkSize, fit: "inside" })
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.round(255 * 0.4)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    // Apply logo watermark in bottom-right and convert to WebP
    processedBuffer = await sharp(resizedBuffer)
      .composite([
        {
          input: watermarkLogo,
          top: imgHeight - watermarkSize - padding,
          left: imgWidth - watermarkSize - padding,
        },
      ])
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    // Fallback: no watermark if logo fails to load
    processedBuffer = await sharp(resizedBuffer).webp({ quality: 80 }).toBuffer();
  }

  const filename = `${session.user.id}-${Date.now()}.webp`;

  // If hostgate is configured, upload there; otherwise fall back to local storage
  if (HOSTGATE_UPLOAD_URL && HOSTGATE_AUTH_TOKEN) {
    try {
      const uploadForm = new FormData();
      const blob = new Blob([new Uint8Array(processedBuffer)], { type: "image/webp" });
      uploadForm.append("file", blob, filename);
      uploadForm.append("filename", filename);

      const hostgateRes = await fetch(HOSTGATE_UPLOAD_URL, {
        method: "POST",
        headers: { "X-Auth-Token": HOSTGATE_AUTH_TOKEN },
        body: uploadForm,
      });

      if (hostgateRes.ok) {
        const data = await hostgateRes.json();
        return NextResponse.json({
          url: data.url,
          thumbnailUrl: data.url,
        });
      }
      // If hostgate fails, fall through to local storage as backup
      console.error("Hostgate upload failed:", await hostgateRes.text());
    } catch (err) {
      console.error("Hostgate upload error:", err);
    }
  }

  // Fallback: save locally
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, processedBuffer);

  return NextResponse.json({
    url: `/api/uploads/${filename}`,
    thumbnailUrl: `/api/uploads/${filename}`,
  });
}
