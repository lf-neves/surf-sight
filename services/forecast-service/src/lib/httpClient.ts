import { request } from "undici";

export interface Spot {
  id: string;
  lat: number;
  lng: number;
  name?: string;
}

export interface SpotsResponse {
  spots: Spot[];
}

/**
 * Fetches all spots from the spot service
 */
export async function fetchAllSpots(spotServiceUrl: string): Promise<Spot[]> {
  const url = `${spotServiceUrl}/api/spots`;

  try {
    const { statusCode, body } = await request(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (statusCode !== 200) {
      throw new Error(`Failed to fetch spots: HTTP ${statusCode}.`);
    }

    const data = (await body.json()) as SpotsResponse;
    return data.spots || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching spots: ${error.message}.`);
    }
    throw new Error("Unknown error fetching spots.");
  }
}
