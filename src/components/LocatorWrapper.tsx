import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GetLocatorOutput } from '../dto/api';
import { Locator } from './Locator';
import { Spinner } from './Spinner';
import { geolocate } from '../lib/ipApi';

export const LocatorWrapper: React.FC = () => {
  const shopId = window.neutekLocatorId;
  const { language } = window.navigator;
  const locatorQuery = useQuery({
    queryKey: ['locator'],
    queryFn: () => {
      return ky
        .get(
          `${process.env.REACT_APP_API_URL}/locator?id=${shopId}&language=${language}`,
        )
        .json<GetLocatorOutput>();
    },
  });
  const geolocationQuery = useQuery({
    queryKey: ['geolocation'],
    queryFn: async () => {
      try {
        return await geolocate();
      } catch (err) {
        return null;
      }
    },
  });

  if (locatorQuery.isPending || geolocationQuery.isPending) {
    return <Spinner />;
  }

  if (locatorQuery.isError) {
    return <p>Failed to load locator data</p>;
  }

  if (geolocationQuery.isError) {
    // Should never get here
    return <p>Failed to load geolocation data</p>;
  }

  return (
    <APIProvider apiKey={locatorQuery.data.settings.googleMapsApiKey}>
      <Locator
        data={locatorQuery.data}
        geolocation={{
          countryCode: geolocationQuery.data?.countryCode || 'US',
          lat: geolocationQuery.data?.lat || 39,
          lng: geolocationQuery.data?.lon || 34,
        }}
      />
    </APIProvider>
  );
};
