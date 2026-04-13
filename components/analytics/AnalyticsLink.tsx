"use client";

import Link from "next/link";
import {
  captureAnalyticsEvent,
  type AnalyticsProperties,
} from "@/lib/analytics";

type AnalyticsLinkProps = {
  children: React.ReactNode;
  className?: string;
  eventName: string;
  href: string;
  properties?: AnalyticsProperties;
};

export function AnalyticsLink({
  children,
  className,
  eventName,
  href,
  properties,
}: AnalyticsLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        captureAnalyticsEvent(eventName, properties);
      }}
    >
      {children}
    </Link>
  );
}
