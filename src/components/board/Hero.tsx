"use client";

import { getGreeting } from "@/lib/greeting";
import { PushRegistration } from "@/components/push/PushRegistration";
import styles from "./Hero.module.css";

export function Hero({ name }: { name: string }) {
  const greeting = getGreeting(new Date().getHours());

  return (
    <section className={styles.hero}>
      <div className={styles.pushIcon}>
        <PushRegistration compact />
      </div>
      <div className={styles.textBlock} suppressHydrationWarning>
        <p className={styles.greeting}>
          {greeting}, {name}.
        </p>
        <p className={styles.subtitle}>Was steht heute an?</p>
      </div>
      <div className={styles.orb} />
    </section>
  );
}
