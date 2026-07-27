const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const FETCH_TIMEOUT_MS = 4000;

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

/**
 * Best-effort: nunca deve derrubar a criação da descoberta. Nominatim (OpenStreetMap) é
 * gratuito, mas exige um User-Agent identificando a aplicação — sem isso ele bloqueia.
 */
export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", address);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "TrilhaApp/1.0 (planejador de viagens)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const results = (await res.json()) as NominatimResult[];
    const first = results[0];
    if (!first) return null;

    const latitude = parseFloat(first.lat);
    const longitude = parseFloat(first.lon);
    if (!isFinite(latitude) || !isFinite(longitude)) return null;

    return { latitude, longitude };
  } catch (err) {
    console.error(`Falha ao geocodificar "${address}":`, (err as Error).message);
    return null;
  }
}
