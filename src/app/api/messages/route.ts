import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail, newMessageEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { adId, receiverId, body } = await request.json();

  if (!adId || !receiverId || !body?.trim()) {
    return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
  }

  if (receiverId === session.user.id) {
    return NextResponse.json({ error: "Nu poti trimite mesaje tie insuti." }, { status: 400 });
  }

  const [message] = await Promise.all([
    prisma.message.create({
      data: {
        adId,
        senderId: session.user.id,
        receiverId,
        body: body.trim(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { lastOnline: new Date() },
    }),
  ]);

  // Send email notification to receiver
  const [sender, receiver, ad] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: receiverId }, select: { email: true } }),
    prisma.ad.findUnique({ where: { id: adId }, select: { title: true } }),
  ]);

  if (receiver?.email && sender && ad) {
    sendEmail({
      to: receiver.email,
      subject: `Mesaj nou de la ${sender.name || "un utilizator"} - Lagoana`,
      html: newMessageEmailHtml(sender.name || "Utilizator", ad.title, body.trim().substring(0, 200)),
    }).catch(() => {}); // Fire and forget
  }

  return NextResponse.json(message, { status: 201 });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const url = new URL(request.url);
  const adId = url.searchParams.get("adId");
  const otherUserId = url.searchParams.get("otherUserId");

  if (adId && otherUserId) {
    // Get thread messages
    const messages = await prisma.message.findMany({
      where: {
        adId,
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    }).then(msgs => msgs.map(m => ({
      ...m,
      status: m.readAt ? "read" : m.isRead ? "read" : "delivered",
    })));

    // Mark unread as read with timestamp
    await prisma.message.updateMany({
      where: {
        adId,
        senderId: otherUserId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    // Update last online
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastOnline: new Date() },
    });

    return NextResponse.json(messages);
  }

  // Get all messages involving this user, newest first
  const allMessages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      ad: {
        select: {
          id: true, title: true, slug: true,
          images: { take: 1, orderBy: { position: "asc" } },
          category: { select: { slug: true } },
        },
      },
    },
  });

  // Group by ad + other user to get unique threads (keep latest message)
  const threadMap = new Map<string, typeof allMessages[0]>();
  for (const msg of allMessages) {
    const otherUserId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
    const key = `${msg.adId}-${otherUserId}`;
    if (!threadMap.has(key)) {
      threadMap.set(key, msg);
    }
  }

  // Enrich threads with other user info and unread count
  const enrichedThreads = [];
  for (const [, msg] of threadMap) {
    const otherUserId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;
    const [otherUser, unreadCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true, avatarUrl: true, lastOnline: true } }),
      prisma.message.count({
        where: { adId: msg.adId, senderId: otherUserId, receiverId: session.user.id, isRead: false },
      }),
    ]);
    enrichedThreads.push({
      id: msg.id,
      adId: msg.adId,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      body: msg.body,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      ad: msg.ad,
      otherUser,
      unreadCount,
    });
  }

  return NextResponse.json(enrichedThreads);
}
