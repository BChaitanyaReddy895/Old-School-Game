/**
 * Shared in-memory game state store
 *
 * ⚠️ WARNING: This is an in-memory store that will not persist across Vercel serverless function invocations.
 * Game state may be lost between requests, especially under high load or cold starts.
 */
const games = global.games || (global.games = {});
export { games }; 