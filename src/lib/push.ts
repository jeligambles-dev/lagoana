import webpush from "web-push";
import { prisma } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:contact@lagoana.ro";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Send a push notification to all of a user's subscribed devices.
 * Automatically removes expired/invalid subscriptions (410 Gone).
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured — skipping push notification");
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const jsonPayload = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          jsonPayload
        );
      } catch (error: unknown) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? (error as { statusCode: number }).statusCode
            : undefined;

        // 410 Gone or 404 means the subscription is no longer valid
        if (statusCode === 410 || statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        } else {
          console.error(
            `Push notification failed for subscription ${sub.id}:`,
            error
          );
        }
      }
    })
  );

  // Log aggregate failures (not individual — those are handled above)
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    console.error(`${failures.length}/${results.length} push sends rejected`);
  }
}
