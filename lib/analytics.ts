declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
    };
  }
}

export function trackEvent(eventName: string, eventData?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.umami?.track !== "function") {
    return;
  }

  window.umami.track(eventName, eventData);
}
