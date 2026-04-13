"use client";

import { useEffect, useRef } from "react";
import {
  captureAnalyticsEvent,
  type AnalyticsProperties,
} from "@/lib/analytics";

type AnalyticsEventOnMountProps = {
  eventName: string;
  properties?: AnalyticsProperties;
};

export function AnalyticsEventOnMount({
  eventName,
  properties,
}: AnalyticsEventOnMountProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    captureAnalyticsEvent(eventName, properties);
  }, [eventName, properties]);

  return null;
}
