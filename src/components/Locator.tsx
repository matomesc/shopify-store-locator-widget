import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import styled from 'styled-components';
import { SearchBar } from './SearchBar';
import { GetLocatorOutput } from '../dto/api';
import { LocationMarkerCluster } from './LocationMarkerCluster';

export const defaultMapZoom = 12;

interface ListAndMapContainerProps {
  flexDirection: React.CSSProperties['flexDirection'];
  justifyContent: React.CSSProperties['justifyContent'];
}

const ListAndMapContainer = styled.div<ListAndMapContainerProps>`
  display: flex;
  gap: 10px;
  flex-direction: ${(props) => props.flexDirection};
  justify-content: ${(props) => props.justifyContent};
`;

interface MapContainerProps {
  borderRadius: string;
  width: string;
}

const MapContainer = styled.div<MapContainerProps>`
  width: ${(props) => props.width};
  height: 500px;

  /* style the correct div inside the map */
  #mainMap > div {
    border-radius: ${(props) => props.borderRadius};
  }
`;
interface ListContainerProps {
  width: string;
  height?: string;
}

const ListContainer = styled.div<ListContainerProps>`
  overflow: auto;
  width: ${(props) => props.width};
  ${(props) => (props.height ? `height: ${props.height};` : '')}
  border: 1px solid black;
`;

export interface LocatorProps {
  data: GetLocatorOutput;
  geolocation: {
    lat: number;
    lng: number;
  };
}

export const Locator: React.FC<LocatorProps> = ({ data, geolocation }) => {
  const [state, setState] = useState<{
    searchBarValue: string;
    selectedLocation: GetLocatorOutput['locations'][number] | null;
    distanceRelativeTo: { lat: number; lng: number } | null;
  }>({
    searchBarValue: '',
    selectedLocation: null,
    distanceRelativeTo: null,
  });
  const map = useMap('mainMap');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const isSmall = useMediaQuery({ query: '(max-width: 750px)' });
  const isMedium = useMediaQuery({ query: '(min-width: 750px)' });
  const isLarge = useMediaQuery({ query: '(min-width: 1000px)' });
  const isXLarge = useMediaQuery({ query: '(min-width: 1260px)' });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        map?.setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        map?.setZoom(defaultMapZoom);
      },
      (error) => {
        console.log('geolocation: failed to get current position', error);
      },
    );
  }, [map]);

  let listAndMapContainerProps: ListAndMapContainerProps;

  if (isSmall) {
    listAndMapContainerProps = {
      flexDirection: 'column',
      justifyContent: 'normal',
    };
  } else {
    listAndMapContainerProps = {
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
    };
  }

  let mapContainerProps: MapContainerProps = {
    borderRadius: '5px',
    width: '100%',
  };

  if (isXLarge) {
    mapContainerProps = {
      ...mapContainerProps,
      width: '900px',
    };
  } else if (isLarge) {
    mapContainerProps = {
      ...mapContainerProps,
      width: '675px',
    };
  } else if (isMedium) {
    mapContainerProps = {
      ...mapContainerProps,
      width: '450px',
    };
  } else if (isSmall) {
    mapContainerProps = {
      ...mapContainerProps,
      width: '100%',
    };
  }

  let listContainerProps: ListContainerProps;

  if (isSmall) {
    listContainerProps = {
      width: '100%',
    };
  } else {
    listContainerProps = {
      width: '300px',
      height: '500px',
    };
  }

  return (
    <div
      className="neutek-locator-container"
      style={{
        display: isSmall ? 'block' : 'flex',
        justifyContent: isSmall ? 'flex-start' : 'center',
        padding: '10px',
      }}
    >
      <div
        className="neutek-locator-container-inner"
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {/* Search bar */}
        <SearchBar
          value={state.searchBarValue}
          onChange={(value) => {
            setState((prevState) => {
              return {
                ...prevState,
                searchBarValue: value,
              };
            });
          }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSearch={async () => {
            if (!geocodingLibrary) {
              return;
            }
            const geocoder = new geocodingLibrary.Geocoder();

            try {
              await geocoder.geocode(
                {
                  address: state.searchBarValue,
                },
                (result, status) => {
                  if (
                    status !== geocodingLibrary.GeocoderStatus.OK ||
                    !result ||
                    result.length === 0
                  ) {
                    return;
                  }
                  const [firstResult] = result;

                  const lat = firstResult.geometry.location.lat();
                  const lng = firstResult.geometry.location.lng();

                  map?.setCenter({ lat, lng });
                  map?.setZoom(defaultMapZoom);
                },
              );
            } catch (err) {
              // Ignore the errors thrown here because we handle them inside the
              // callback
            }
          }}
          onPlaceChanged={(latLng) => {
            map?.setCenter(latLng);
            map?.setZoom(defaultMapZoom);
          }}
        />

        {/* Search filters */}
        {/* todo */}

        {/* List and map container */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ListAndMapContainer {...listAndMapContainerProps}>
          <MapContainer
            className="neutek-locator-map-container"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...mapContainerProps}
          >
            <Map
              id="mainMap"
              mapId="mainMap"
              style={{ borderRadius: '5px' }}
              defaultCenter={geolocation}
              defaultZoom={
                geolocation.lat === 39 && geolocation.lng === 34 ? 2 : 12
              }
              onBoundsChanged={(event) => {
                console.log(event);
              }}
            >
              <LocationMarkerCluster
                locations={data.locations}
                selectedLocation={state.selectedLocation}
                onSelect={(selected) => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      selectedLocation: selected,
                    };
                  });
                }}
              />
            </Map>
          </MapContainer>
          <ListContainer
            className="neutek-locator-list-container"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...listContainerProps}
          >
            List
          </ListContainer>
        </ListAndMapContainer>
      </div>
    </div>
  );
};
