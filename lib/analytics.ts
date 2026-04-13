"use client";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

type PostHogClient = {
  capture?: (eventName: string, properties?: AnalyticsProperties) => void;
  identify?: (
    distinctId: string,
    properties?: AnalyticsProperties,
  ) => void;
  reset?: () => void;
};

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

function getPostHogClient() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.posthog ?? null;
}

export function getMarketingProperties(): AnalyticsProperties {
  if (typeof window === "undefined") {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    utm_campaign: searchParams.get("utm_campaign"),
    utm_medium: searchParams.get("utm_medium"),
    utm_source: searchParams.get("utm_source"),
  };
}

export function captureAnalyticsEvent(
  eventName: string,
  properties: AnalyticsProperties = {},
) {
  getPostHogClient()?.capture?.(eventName, {
    ...getMarketingProperties(),
    ...properties,
  });
}

export function identifyAnalyticsUser(properties: {
  email?: string | null;
  id: string;
  name?: string | null;
}) {
  getPostHogClient()?.identify?.(properties.id, {
    email: properties.email ?? null,
    name: properties.name ?? null,
  });
}

export function resetAnalyticsUser() {
  getPostHogClient()?.reset?.();
}
