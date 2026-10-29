/** Canonical public origin, used for metadataBase, the sitemap and robots.txt. */
export const SITE_URL = "https://www.trashtribe.lol";

/** Discord server invite. Must be a non-expiring invite ("Expire after: Never"). */
export const DISCORD_INVITE_URL = "https://discord.gg/hF2PYn4R48";

export const CONTACT_EMAIL = "hello@trashtribe.lol";

/**
 * Seller identity shown on the legal pages (EU law requires the trader's
 * name and geographic address). Fill these in; while empty the pages just
 * say "trashtribe" and point to the contact email.
 */
export const LEGAL_ENTITY = {
  /** Registered name of the person or company behind trashtribe. */
  name: "deeptribe OÜ",
  /** Estonian Business Register (e-Äriregister) code. */
  registryCode: "17130573",
  /** Full postal address, one line. Also where returns are sent. */
  address: "",
  /** EU member state where trashtribe is established. */
  country: "Estonia",
};

/** Date the legal pages were last revised. */
export const LEGAL_LAST_UPDATED = "30 October 2026";
