import { logger } from '@surf-sight/core';

const STORMGLASS_TIDE_URL = 'https://api.stormglass.io/v2/tide/extremes/point';

export interface TidePoint {
  time: string; // ISO
  height: number;
  type?: 'high' | 'low';
}

export interface TidesResult {
  stationName?: string | null;
  points: TidePoint[];
}

/**
 * Fetches tide data from Stormglass API for a given lat/lng.
 * Returns tide points (and optional extremes) for the next ~2 days.
 * See https://docs.stormglass.io/#tide
 */
export async function fetchTidesByCoordinates(
  lat: number,
  lng: number,
  apiKey: string
): Promise<TidesResult> {
  logger.info('[StormglassTide] fetchTidesByCoordinates called', { lat, lng, hasApiKey: !!apiKey });
  if (!apiKey || apiKey.trim() === '') {
    logger.warn('[StormglassTide] STORMGLASS_API_KEY not set, skipping tide fetch');
    return { points: [] };
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 2);

  const start = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const end = endDate.toISOString().slice(0, 10); // YYYY-MM-DD

  const url = `${STORMGLASS_TIDE_URL}?lat=${lat}&lng=${lng}&start=${start}&end=${end}`;
  logger.info('[StormglassTide] Fetching', { url, lat, lng, start, end });

  const res = await fetch(url, {
    headers: {
      Authorization: apiKey.trim(),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error('[StormglassTide] API error', { status: res.status, body: text.slice(0, 200) });
    throw new Error(`Stormglass tide API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    data?: {
      tides?: Array<{ time: string; height?: number; waterLevel?: number }>;
      extremes?: Array<{ time: string; height?: number; waterLevel?: number; type?: string }>;
    };
    meta?: { station?: { name?: string; distance?: number } };
  };

  const points: TidePoint[] = [];
  let stationName: string | null = null;

  if (data.meta?.station?.name) {
    stationName = data.meta.station.name;
  }

  const heightOf = (e: { height?: number; waterLevel?: number }): number =>
    e.height ?? e.waterLevel ?? 0;

  // Prefer extremes (high/low) when present; otherwise use continuous tides
  const extremes = data.data?.extremes;
  const tides = data.data?.tides;

  if (extremes && extremes.length > 0) {
    for (const e of extremes) {
      points.push({
        time: e.time,
        height: heightOf(e),
        type: (e.type?.toLowerCase() === 'high' || e.type?.toLowerCase() === 'low'
          ? e.type.toLowerCase()
          : undefined) as 'high' | 'low' | undefined,
      });
    }
  } else if (tides && tides.length > 0) {
    for (const t of tides) {
      points.push({ time: t.time, height: heightOf(t) });
    }
  }

  // Sort by time
  points.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  logger.info('[StormglassTide] Result', { pointCount: points.length, stationName });
  return { stationName, points };
}
