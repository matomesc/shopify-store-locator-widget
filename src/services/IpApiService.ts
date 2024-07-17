import ky from 'ky';
import { singleton } from 'tsyringe';
import { z } from 'zod';

export const GetOutput = z.object({
  countryCode: z.string(),
  lat: z.number(),
  lon: z.number(),
});

@singleton()
export class IpApiService {
  public async get() {
    const json = await ky
      .get(
        `https://pro.ip-api.com/json/?key=${process.env.REACT_APP_IP_API_KEY}`,
      )
      .json();

    const parsed = GetOutput.parse(json);

    return parsed;
  }
}
