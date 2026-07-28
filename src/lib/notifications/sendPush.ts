import webpush from "web-push";
import { getSupabaseServerClient } from "@/lib/supabase";

type PushPayload = {
  title: string;
  body: string;
  taskId?: string;
};

// Configuring VAPID details at module scope meant a momentarily-missing
// env var (e.g. during a dev worker's cold start) threw synchronously on
// import and crashed every route that transitively imports this module -
// not just the ones actually sending push. Doing it lazily, inside the
// function, means a config problem only fails an actual send attempt.
function configureVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;

  try {
    configureVapid();
  } catch (error) {
    console.error("Failed to configure VAPID details, skipping push send:", error);
    return;
  }

  const supabase = getSupabaseServerClient();
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (!subscriptions || subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Failed to send push notification:", error);
        }
      }
    })
  );
}
