import ky from 'ky';
import { z } from 'zod';

const GeolocateOutput = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('success'),
    query: z.string(),
    country: z.string().nullable().optional(),
    countryCode: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    regionName: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
    lat: z.number(),
    lon: z.number(),
    mobile: z.boolean(),
  }),
  z.object({
    status: z.literal('fail'),
    message: z.string(),
  }),
]);

/**
 * This api call returns a 200 status regardless of success or error. The status
 * property in the response should be checked to determine if the call completed
 * successfully or failed.
 */
export async function geolocate() {
  const json = await ky
    .get(
      `https://pro.ip-api.com/json/?key=${process.env.REACT_APP_IP_API_KEY}&fields=123135`,
    )
    .json();

  const parsed = GeolocateOutput.parse(json);

  return parsed;
}
