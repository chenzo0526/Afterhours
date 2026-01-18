// Analytics placeholder - ready for integration with tracking services
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Placeholder for analytics integration
    // Example: Google Analytics, Plausible, etc.
    console.log('[Analytics]', eventName, properties);
  }
}

export function trackPageView(path: string) {
  if (typeof window !== 'undefined') {
    console.log('[Analytics] Page View:', path);
  }
}
