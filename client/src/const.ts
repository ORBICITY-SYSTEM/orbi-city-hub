export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "ORBI City Hub";

export const APP_LOGO = "/logo-orbi.jpg";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://portal.manus.im";
  const appId = import.meta.env.VITE_APP_ID || "orbi-city-hub";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Return empty string if OAuth is not configured
  if (!import.meta.env.VITE_OAUTH_PORTAL_URL || !import.meta.env.VITE_APP_ID) {
    return "";
  }

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (error) {
    console.warn("OAuth not configured, login disabled", error);
    return "";
  }
};
