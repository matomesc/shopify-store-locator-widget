import React, { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import styled from 'styled-components';
import { FaLocationDot } from 'react-icons/fa6';
import { SearchBar } from './SearchBar';
import { GetLocatorOutput } from '../dto/api';
import { LocationMarkerCluster } from './LocationMarkerCluster';
import { Address } from './Address';
import { isImperial, roundDistance } from '../lib/util';

export const defaultMapZoom = 12;

interface ListAndMapContainerProps {
  $flexDirection: React.CSSProperties['flexDirection'];
  $justifyContent: React.CSSProperties['justifyContent'];
}

const ListAndMapContainer = styled.div<ListAndMapContainerProps>`
  display: flex;
  gap: 10px;
  flex-direction: ${(props) => props.$flexDirection};
  justify-content: ${(props) => props.$justifyContent};
`;

interface MapContainerProps {
  $borderRadius: string;
  $width: string;
}

const MapContainer = styled.div<MapContainerProps>`
  width: ${(props) => props.$width};
  height: 500px;

  /* style the correct div inside the map */
  #mainMap > div {
    border-radius: ${(props) => props.$borderRadius};
  }
`;
interface ListContainerProps {
  $width: string;
  $height?: string;
}

const ListContainer = styled.div<ListContainerProps>`
  overflow-x: hidden;
  overflow-y: auto;
  width: ${(props) => props.$width};
  ${(props) => (props.$height ? `height: ${props.$height};` : '')}
  border: 1px solid black;
`;

export interface LocatorProps {
  data: GetLocatorOutput;
  geolocation: {
    countryCode: string;
    lat: number;
    lng: number;
  };
}

export const Locator: React.FC<LocatorProps> = ({ data, geolocation }) => {
  const [state, setState] = useState<{
    searchBarValue: string;
    selectedLocation: GetLocatorOutput['locations'][number] | null;
    map: {
      center: { lat: number; lng: number };
      zoom: number;
    };
  }>({
    searchBarValue: '',
    selectedLocation: null,
    map: {
      center: {
        lat: geolocation.lat,
        lng: geolocation.lng,
      },
      zoom:
        geolocation.lat === 39 && geolocation.lng === 34 ? 2 : defaultMapZoom,
    },
  });
  const map = useMap('mainMap');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const geometryLibrary = useMapsLibrary('geometry');
  const isSmall = useMediaQuery({ query: '(max-width: 750px)' });
  const isMedium = useMediaQuery({ query: '(min-width: 750px)' });
  const isLarge = useMediaQuery({ query: '(min-width: 1000px)' });
  const isXLarge = useMediaQuery({ query: '(min-width: 1260px)' });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState((prevState) => {
          return {
            ...prevState,
            map: {
              ...prevState.map,
              center: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              zoom: defaultMapZoom,
            },
          };
        });
      },
      (error) => {
        console.log('geolocation: failed to get current position', error);
      },
    );
  }, [map]);
  const locationsWithDistance = useMemo(() => {
    const from = state.map.center;

    return data.locations
      .map((location) => {
        const to = { lat: location.lat, lng: location.lng };
        // The distance in meters
        const distance = geometryLibrary
          ? geometryLibrary.spherical.computeDistanceBetween(from, to)
          : 0;
        return { ...location, distance };
      })
      .sort((locationA, locationB) => {
        return locationA.distance - locationB.distance;
      });
  }, [data.locations, geometryLibrary, state.map.center]);
  const searchFiltersById = useMemo(() => {
    return data.searchFilters.reduce(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {} as Record<string, GetLocatorOutput['searchFilters'][number]>,
    );
  }, [data.searchFilters]);

  let listAndMapContainerProps: ListAndMapContainerProps;

  if (isSmall) {
    listAndMapContainerProps = {
      $flexDirection: 'column',
      $justifyContent: 'normal',
    };
  } else {
    listAndMapContainerProps = {
      $flexDirection: 'row-reverse',
      $justifyContent: 'flex-end',
    };
  }

  let mapContainerProps: MapContainerProps = {
    $borderRadius: '5px',
    $width: '100%',
  };

  if (isXLarge) {
    mapContainerProps = {
      ...mapContainerProps,
      $width: '900px',
    };
  } else if (isLarge) {
    mapContainerProps = {
      ...mapContainerProps,
      $width: '675px',
    };
  } else if (isMedium) {
    mapContainerProps = {
      ...mapContainerProps,
      $width: '450px',
    };
  } else if (isSmall) {
    mapContainerProps = {
      ...mapContainerProps,
      $width: '100%',
    };
  }

  let listContainerProps: ListContainerProps;

  if (isSmall) {
    listContainerProps = {
      $width: '100%',
    };
  } else {
    listContainerProps = {
      $width: '300px',
      $height: '500px',
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

                  setState((prevState) => {
                    return {
                      ...prevState,
                      map: {
                        ...prevState.map,
                        center: { lat, lng },
                        zoom: defaultMapZoom,
                      },
                    };
                  });
                },
              );
            } catch (err) {
              // Ignore the errors thrown here because we handle them inside the
              // callback
            }
          }}
          onPlaceChanged={(latLng) => {
            setState((prevState) => {
              return {
                ...prevState,
                map: {
                  ...prevState.map,
                  center: latLng,
                  zoom: defaultMapZoom,
                },
              };
            });
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
              center={state.map.center}
              zoom={state.map.zoom}
              onCameraChanged={(event) => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    map: {
                      ...prevState.map,
                      center: event.detail.center,
                      zoom: event.detail.zoom,
                    },
                  };
                });
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
            {locationsWithDistance.slice(0, 100).map((location) => {
              return (
                <div
                  key={location.id}
                  style={{
                    display: 'flex',
                    gap: '5px',
                    borderBottom: '1px solid #f6f6f6',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                  }}
                >
                  <div style={{ width: '70px', overflow: 'hidden' }}>
                    <div style={{ textAlign: 'center' }}>
                      <FaLocationDot style={{ fill: 'black' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {roundDistance(
                        isImperial(geolocation.countryCode)
                          ? location.distance * 0.000621371 // meters -> miles
                          : location.distance / 1000, // meters -> kilometers
                      )}
                      &nbsp;
                      {isImperial(geolocation.countryCode) ? 'mi' : 'km'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#000000' }}>
                      {location.name}
                    </div>
                    <div>
                      <Address location={location} />
                    </div>
                    {location.searchFilters.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {location.searchFilters.map((searchFilter) => {
                          return (
                            <div style={{ fontWeight: 'bold' }}>
                              {searchFiltersById[searchFilter.id].name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </ListContainer>
        </ListAndMapContainer>
      </div>
    </div>
  );
};
