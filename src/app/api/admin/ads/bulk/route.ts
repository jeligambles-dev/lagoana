import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Neautorizat" }, { status: 403 });

  const { adIds, action } = (await request.json()) as {
    adIds: string[];
    action: "approve" | "remove" | "delete";
  };

  if (!Array.isArray(adIds) || adIds.length === 0) {
    return NextResponse.json({ error: "Niciun anunt selectat." }, { status: 400 });
  }

  if (!["approve", "remove", "delete"].includes(action)) {
    return NextResponse.json({ error: "Actiune necunoscuta." }, { status: 400 });
  }

  let affected = 0;

  switch (action) {
    case "approve": {
      const result = await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { status: "ACTIVE" },
      });
      affected = result.count;
      break;
    }
    case "remove": {
      const result = await prisma.ad.updateMany({
        where: { id: { in: adIds } },
        data: { status: "REMOVED" },
      });
      affected = result.count;
      break;
    }
    case "delete": {
      const result = await prisma.ad.deleteMany({
        where: { id: { in: adIds } },
      });
      affected = result.count;
      break;
    }
  }

  // Create audit logs for each ad
  await prisma.adminAuditLog.createMany({
    data: adIds.map((adId) => ({
      adminId: session.user.id,
      action: `bulk_${action}`,
      targetType: "ad",
      targetId: adId,
    })),
  });

  return NextResponse.json({ success: true, affected });
}
