// UTM tracking utility
// Captures UTM parameters on first page load and stores them in localStorage
// so they can be attached to orders placed later in the session.

const UTM_STORAGE_KEY = 'roboexpert_utm';
const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UtmData = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  landingPage?: string;
  referrer?: string;
};

// ---------- Capture ----------
// Call this once on app load. First-touch attribution — only stored once.

export function captureUtmFromUrl(): void {
  try {
    const existing = localStorage.getItem(UTM_STORAGE_KEY);
    if (existing) return;

    const url = new URL(window.location.href);
    const params: Record<string, string> = {};

    for (const key of UTM_PARAMS) {
      const value = url.searchParams.get(key);
      if (value) {
        params[key] = value;
      }
    }

    const hasUtm = Object.keys(params).length > 0;

    const payload: UtmData = {
      source: params.utm_source,
      medium: params.utm_medium,
      campaign: params.utm_campaign,
      term: params.utm_term,
      content: params.utm_content,
      landingPage: window.location.href,
      referrer: document.referrer || undefined,
    };

    if (hasUtm || payload.referrer) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {
    // ignore
  }
}

// ---------- Read ----------

export function getStoredUtm(): UtmData | undefined {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return undefined;
    return JSON.parse(stored);
  } catch {
    return undefined;
  }
}

// ---------- Clear (for testing) ----------

export function clearStoredUtm(): void {
  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // ignore
  }
}