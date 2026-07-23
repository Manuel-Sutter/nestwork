"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import styles from "./PushRegistration.module.css";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushRegistration({ compact = false }: { compact?: boolean }) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator && "PushManager" in window)) return;
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  useEffect(() => {
    // registerServiceWorker's setState calls happen after its awaited
    // browser-API calls resolve, not synchronously in this tick - a false
    // positive from this experimental rule for the canonical
    // synchronize-with-an-external-system effect case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void registerServiceWorker();
  }, []);

  async function subscribeToPush() {
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      setStatus("Push wird von diesem Browser nicht unterstützt.");
      return;
    }
    setStatus(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        setStatus("Registrierung fehlgeschlagen.");
        return;
      }
      setSubscription(sub);
      setStatus("Push aktiviert.");
    } catch (error) {
      setStatus(`Push-Anmeldung fehlgeschlagen: ${(error as Error).message}`);
    }
  }

  async function sendTestPush() {
    setStatus(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    setStatus(res.ok ? "Test-Push gesendet." : "Test-Push fehlgeschlagen.");
  }

  if (compact) {
    return (
      <div className={styles.compactWrap}>
        <button
          className={styles.compactButton}
          onClick={subscription ? sendTestPush : subscribeToPush}
          aria-label={subscription ? "Test-Push senden" : "Push aktivieren"}
          title={subscription ? "Test-Push senden" : "Push aktivieren"}
        >
          {subscription ? <BellRing size={18} /> : <Bell size={18} />}
        </button>
        {status && <p className={styles.compactStatus}>{status}</p>}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {subscription ? (
        <button className={styles.button} onClick={sendTestPush}>
          Test-Push senden
        </button>
      ) : (
        <button className={styles.button} onClick={subscribeToPush}>
          Push aktivieren
        </button>
      )}
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}
