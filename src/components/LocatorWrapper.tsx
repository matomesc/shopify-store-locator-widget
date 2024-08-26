import { useMutation, useQuery } from '@tanstack/react-query';
import ky from 'ky';
import React, { useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { v4 } from 'uuid';
import {
  GetLocatorOutput,
  PostSessionsInput,
  PostSessionsOutput,
} from '../dto/api';
import { Locator } from './Locator';
import { Spinner } from './Spinner';
import { geolocate } from '../lib/ipApi';
import { useAppStore } from '../stores/appStore';

export const LocatorWrapper: React.FC = () => {
  const shopId = window.neutekLocatorId;
  const { language } = window.navigator;
  const setSessionId = useAppStore((state) => state.setSessionId);
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
  // Extracting mutateAsync function is required to prevent an infinite loop.
  // Since the useMutation return value changes after each mutation and we pass
  // this into useEffect it results in an infinite loop. See this issue /
  // comment:
  // https://github.com/TanStack/query/issues/1858#issuecomment-2252209713
  const { mutateAsync: postSessionsMutateAsync } = useMutation({
    mutationFn: async (input: PostSessionsInput) => {
      return ky
        .post(`${process.env.REACT_APP_API_URL}/sessions`, {
          json: input,
        })
        .json<PostSessionsOutput>();
    },
  });
  useEffect(() => {
    if (
      geolocationQuery.isPending ||
      geolocationQuery.isError ||
      geolocationQuery.data === null ||
      geolocationQuery.data.status === 'fail'
    ) {
      return;
    }

    const geolocationQueryData = geolocationQuery.data;
    const sessionId = v4();

    const createSession = async () => {
      const output = await postSessionsMutateAsync({
        id: sessionId,
        shopId,
        ip: geolocationQueryData.query,
        country: geolocationQueryData.country || '',
        countryCode: geolocationQueryData.countryCode || '',
        region: geolocationQueryData.region || '',
        regionName: geolocationQueryData.regionName || '',
        city: geolocationQueryData.city || '',
        zip: geolocationQueryData.zip || '',
        ipGeolocationLat: geolocationQueryData.lat,
        ipGeolocationLng: geolocationQueryData.lon,
        browserGeolocationLat: null,
        browserGeolocationLng: null,
        language,
        mobile: geolocationQueryData.mobile,
      });

      if (output.ok) {
        setSessionId(sessionId);
      }
    };

    createSession().catch((err) => {
      console.log('Failed to create session:');
      console.log(err);
    });
  }, [
    setSessionId,
    geolocationQuery.data,
    geolocationQuery.isError,
    geolocationQuery.isPending,
    language,
    shopId,
    postSessionsMutateAsync,
  ]);

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
          countryCode:
            geolocationQuery.data?.status === 'success'
              ? geolocationQuery.data?.country || 'US'
              : 'US',
          lat:
            geolocationQuery.data?.status === 'success'
              ? geolocationQuery.data?.lat || 39
              : 39,
          lng:
            geolocationQuery.data?.status === 'success'
              ? geolocationQuery.data?.lon || 34
              : 34,
        }}
      />
    </APIProvider>
  );
};
