/** Where the dashboard lives. Set VITE_APP_URL at build time to point somewhere else. */
export const APP_URL = (import.meta.env.VITE_APP_URL || "https://ship.oche.io").replace(/\/$/, "");
export const SIGN_IN_URL = `${APP_URL}/`;
