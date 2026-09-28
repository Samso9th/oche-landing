/** Where the dashboard lives. Set VITE_APP_URL at build time to point somewhere else. */
export const APP_URL = (import.meta.env.VITE_APP_URL || "https://ship.oche.io").replace(/\/$/, "");
/** The Oche server, for the waitlist form. Set VITE_API_URL at build time to point somewhere else. */
export const API_URL = (import.meta.env.VITE_API_URL || "https://deploy.oche.io").replace(/\/$/, "");
