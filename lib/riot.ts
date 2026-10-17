/**
 * Riot integration boundary.
 * Implement only against Riot-approved APIs and the RSO scopes approved for this app.
 * Never accept Riot passwords, local client tokens, or session cookies.
 */
export function isRsoConfigured(): boolean {
  return Boolean(process.env.RIOT_RSO_CLIENT_ID && process.env.RIOT_RSO_CLIENT_SECRET && process.env.RIOT_RSO_REDIRECT_URI);
}

export function getRsoReadiness() {
  return {
    configured: isRsoConfigured(),
    enabled: false,
    reason: 'RSO remains disabled until Riot approves the product and grants an RSO client.'
  };
}
