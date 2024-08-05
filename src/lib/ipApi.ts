import ky from 'ky';
import { z } from 'zod';

const GeolocateOutput = z.object({
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export async function geolocate() {
  const json = await ky
    .get(`https://pro.ip-api.com/json/?key=${process.env.REACT_APP_IP_API_KEY}`)
    .json();

  const parsed = GeolocateOutput.parse(json);

  return parsed;
}
