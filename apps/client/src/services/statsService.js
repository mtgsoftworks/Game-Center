import axios from 'axios';

const API_BASE = '/api/games';

/**
 * Fetch aggregated stats for given game and date range
 * @param {'tombala'|'2048'} game
 * @param {string} from ISO date string
 * @param {string} to ISO date string
 */
export async function fetchAggregateStats(game, from, to) {
  const params = { game };
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await axios.get(`${API_BASE}/stats/aggregate`, { params });
  return data;
} 