import React, { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import styled from 'styled-components';
import { FaLocationDot } from 'react-icons/fa6';
import { useMutation } from '@tanstack/react-query';
import ky from 'ky';
import { SearchBar } from './SearchBar';
import {
  GetLocatorOutput,
  PostLocationClickEventsInput,
  PostLocationClickEventsOutput,
  PostSearchEventsInput,
  PostSearchEventsOutput,
  PutSessionsInput,
  PutSessionsOutput,
} from '../dto/api';
import { LocationMarkerCluster } from './LocationMarkerCluster';
import { Address } from './Address';
import {
  isImperial,
  roundDistance,
  shouldRenderCustomActions,
  shouldRenderCustomFields,
} from '../lib/utils';
import { SearchFiltersSelector } from './SearchFiltersSelector';
import { Contact } from './Contact';
import { SearchFilters } from './SearchFilters';
import { CustomFields } from './CustomFields';
import { CustomActions } from './CustomActions';
import { useAppStore } from '../stores/appStore';

export const defaultMapZoom = 12;

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

  /* remove the blue border that appears on focus */
  #mainMap .gm-style iframe + div {
    border: none !important;
  }
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
  const sessionId = useAppStore((state) => state.sessionId);
  const [state, setState] = useState<{
    searchBarValue: string;
    selectedLocation: GetLocatorOutput['locations'][number] | null;
    map: {
      center: { lat: number; lng: number };
      zoom: number;
      bounds: google.maps.LatLngBoundsLiteral | null;
    };
    distanceFrom: { lat: number; lng: number };
    selectedSearchFilters: string[];
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
      bounds: null,
    },
    distanceFrom: { lat: geolocation.lat, lng: geolocation.lng },
    selectedSearchFilters: [],
  });
  const map = useMap('mainMap');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const geometryLibrary = useMapsLibrary('geometry');
  const coreLibrary = useMapsLibrary('core');
  const isSmall = useMediaQuery({ query: '(max-width: 750px)' });
  const isMedium = useMediaQuery({ query: '(min-width: 750px)' });
  const isLarge = useMediaQuery({ query: '(min-width: 1000px)' });
  const isXLarge = useMediaQuery({ query: '(min-width: 1260px)' });
  const { mutateAsync: putSessionsMutateAsync } = useMutation({
    mutationFn: async (input: PutSessionsInput) => {
      return ky
        .put(`${process.env.REACT_APP_API_URL}/sessions`, {
          json: input,
        })
        .json<PutSessionsOutput>();
    },
  });
  const { mutateAsync: postSearchEventsMutateAsync } = useMutation({
    mutationFn: async (input: PostSearchEventsInput) => {
      return ky
        .post(`${process.env.REACT_APP_API_URL}/searchEvents`, {
          json: input,
        })
        .json<PostSearchEventsOutput>();
    },
  });
  const { mutateAsync: postLocationClickEventsMutateAsync } = useMutation({
    mutationFn: async (input: PostLocationClickEventsInput) => {
      return ky
        .post(`${process.env.REACT_APP_API_URL}/locationClickEvents`, {
          json: input,
        })
        .json<PostLocationClickEventsOutput>();
    },
  });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setState((prevState) => {
          return {
            ...prevState,
            map: {
              ...prevState.map,
              center: { lat, lng },
              zoom: defaultMapZoom,
            },
            distanceFrom: { lat, lng },
          };
        });

        if (sessionId) {
          putSessionsMutateAsync({
            id: sessionId,
            browserGeolocationLat: lat,
            browserGeolocationLng: lng,
          }).catch((err) => {
            console.log('Failed to update session');
            console.log(err);
          });
        }
      },
      (error) => {
        console.log('Browser geolocation: failed to get current position:');
        console.log(error);
      },
    );
  }, [map, putSessionsMutateAsync, sessionId]);
  const filteredLocationsWithDistance = useMemo(() => {
    if (!geometryLibrary || !coreLibrary || !state.map.bounds) {
      return data.locations.map((location) => {
        return { ...location, distance: 0 };
      });
    }

    const locationsWithSearchFilters = data.locations.filter((location) => {
      return state.selectedSearchFilters.every((filterId) => {
        return location.searchFilters.find((searchFilterId) => {
          return searchFilterId === filterId;
        });
      });
    });

    const bounds = new coreLibrary.LatLngBounds(state.map.bounds);

    const locationsInBounds = locationsWithSearchFilters.filter((location) => {
      return bounds.contains({ lat: location.lat, lng: location.lng });
    });

    if (locationsInBounds.length < 20) {
      const locationsInBoundsSet = new Set(locationsInBounds.map((l) => l.id));
      const locationsWithDistanceFromCenter = locationsWithSearchFilters
        .map((location) => {
          return {
            ...location,
            distance: geometryLibrary.spherical.computeDistanceBetween(
              {
                lat: state.map.center.lat,
                lng: state.map.center.lng,
              },
              { lat: location.lat, lng: location.lng },
            ),
          };
        })
        .sort((locationA, locationB) => {
          return locationA.distance - locationB.distance;
        });

      // eslint-disable-next-line no-restricted-syntax
      for (const location of locationsWithDistanceFromCenter) {
        if (locationsInBoundsSet.has(location.id)) {
          // eslint-disable-next-line no-continue
          continue;
        } else {
          locationsInBounds.push(location);
          locationsInBoundsSet.add(location.id);
          if (locationsInBounds.length === 20) {
            break;
          }
        }
      }
    }

    return locationsInBounds
      .map((location) => {
        const distance = geometryLibrary.spherical.computeDistanceBetween(
          state.distanceFrom,
          { lat: location.lat, lng: location.lng },
        );
        return { ...location, distance };
      })
      .sort((locationA, locationB) => {
        return locationA.distance - locationB.distance;
      });
  }, [
    coreLibrary,
    data.locations,
    geometryLibrary,
    state.distanceFrom,
    state.map.bounds,
    state.map.center.lat,
    state.map.center.lng,
    state.selectedSearchFilters,
  ]);
  const searchFiltersById = useMemo(() => {
    return data.searchFilters.reduce(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {} as Record<string, GetLocatorOutput['searchFilters'][number]>,
    );
  }, [data.searchFilters]);
  const customFieldsById = useMemo(() => {
    return data.customFields.reduce(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {} as Record<string, GetLocatorOutput['customFields'][number]>,
    );
  }, [data.customFields]);
  const customActionsById = useMemo(() => {
    return data.customActions.reduce(
      (acc, val) => {
        acc[val.id] = val;
        return acc;
      },
      {} as Record<string, GetLocatorOutput['customActions'][number]>,
    );
  }, [data.customActions]);
  const translationsById = useMemo(() => {
    return data.translations.reduce(
      (acc, val) => {
        if (val.target) {
          acc.targets[val.target] = val;
        } else if (val.searchFilterId) {
          acc.searchFilters[val.searchFilterId] = val;
        } else if (val.customFieldId) {
          acc.customFields[val.customFieldId] = val;
        } else if (val.customActionId) {
          acc.customActions[val.customActionId] = val;
        }

        return acc;
      },
      {
        targets: {},
        searchFilters: {},
        customFields: {},
        customActions: {},
      } as {
        targets: Record<string, GetLocatorOutput['translations'][number]>;
        searchFilters: Record<string, GetLocatorOutput['translations'][number]>;
        customFields: Record<string, GetLocatorOutput['translations'][number]>;
        customActions: Record<string, GetLocatorOutput['translations'][number]>;
      },
    );
  }, [data.translations]);

  let listAndMapContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
  };

  if (isSmall) {
    listAndMapContainerStyle = {
      ...listAndMapContainerStyle,
      flexDirection: 'column',
    };
  } else {
    listAndMapContainerStyle = {
      ...listAndMapContainerStyle,
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
    };
  }

  let mapContainerProps: MapContainerProps = {
    $borderRadius: data.settings.borderRadius,
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

  let listContainerStyle: React.CSSProperties = {
    overflowX: 'hidden',
    overflowY: 'auto',
  };

  if (isSmall) {
    listContainerStyle = {
      ...listContainerStyle,
      width: '100%',
    };
  } else {
    listContainerStyle = {
      ...listContainerStyle,
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
          settings={data.settings}
          translationsById={translationsById}
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

            setState((prevState) => {
              return {
                ...prevState,
                selectedLocation: null,
              };
            });

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
                      distanceFrom: { lat, lng },
                    };
                  });

                  if (sessionId) {
                    postSearchEventsMutateAsync({
                      sessionId,
                      query: state.searchBarValue,
                      lat,
                      lng,
                    }).catch((err) => {
                      console.log('Failed to create search event:');
                      console.log(err);
                    });
                  }
                },
              );
            } catch (err) {
              // Ignore the errors thrown here because we handle them inside the
              // callback
            }
          }}
          onPlaceChanged={({ lat, lng, address }) => {
            setState((prevState) => {
              return {
                ...prevState,
                map: {
                  ...prevState.map,
                  center: { lat, lng },
                  zoom: defaultMapZoom,
                },
                distanceFrom: { lat, lng },
                selectedLocation: null,
              };
            });

            if (sessionId) {
              postSearchEventsMutateAsync({
                sessionId,
                query: address,
                lat,
                lng,
              }).catch((err) => {
                console.log('Failed to create search event:');
                console.log(err);
              });
            }
          }}
        />

        {/* Search filters */}
        <SearchFiltersSelector
          searchFilters={data.searchFilters}
          selected={state.selectedSearchFilters}
          settings={data.settings}
          translationsById={translationsById}
          onSelect={(selected) => {
            setState((prevState) => {
              return {
                ...prevState,
                selectedSearchFilters: selected,
              };
            });
          }}
        />

        {/* List and map container */}
        <div style={listAndMapContainerStyle}>
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
                      bounds: event.detail.bounds,
                    },
                  };
                });
              }}
              onIdle={() => {
                if (
                  !state.map.bounds ||
                  !state.selectedLocation ||
                  !coreLibrary ||
                  isSmall
                ) {
                  return;
                }

                const bounds = new coreLibrary.LatLngBounds(state.map.bounds);

                if (
                  bounds.contains({
                    lat: state.selectedLocation.lat,
                    lng: state.selectedLocation.lng,
                  })
                ) {
                  const listElement = document.querySelector(
                    `.neutek-locator-list-location[data-location-id="${state.selectedLocation.id}"]`,
                  );
                  if (listElement) {
                    listElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                      inline: 'nearest',
                    });
                  }
                }
              }}
            >
              <LocationMarkerCluster
                locations={filteredLocationsWithDistance}
                selectedLocation={state.selectedLocation}
                settings={data.settings}
                customFieldsById={customFieldsById}
                searchFiltersById={searchFiltersById}
                customActionsById={customActionsById}
                translationsById={translationsById}
                onSelect={(selected) => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      selectedLocation: selected,
                    };
                  });

                  if (selected) {
                    map?.panTo({ lat: selected.lat, lng: selected.lng });

                    if (sessionId) {
                      postLocationClickEventsMutateAsync({
                        sessionId,
                        locationId: selected.id,
                      }).catch((err) => {
                        console.log('Failed to create location click event:');
                        console.log(err);
                      });
                    }
                  }
                }}
              />
            </Map>
          </MapContainer>
          <div
            className="neutek-locator-list-container"
            style={listContainerStyle}
          >
            {filteredLocationsWithDistance.slice(0, 100).map((location) => {
              return (
                <div
                  key={location.id}
                  data-location-id={location.id}
                  className="neutek-locator-list-location"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '5px',
                    borderBottom: '1px solid #f6f6f6',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingRight: '5px',
                    borderLeft:
                      state.selectedLocation?.id === location.id
                        ? `5px solid ${data.settings.listSelectedLocationBorderColor}`
                        : 'none',
                  }}
                  onClick={() => {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        selectedLocation: location,
                      };
                    });
                    map?.panTo({ lat: location.lat, lng: location.lng });

                    if (sessionId) {
                      postLocationClickEventsMutateAsync({
                        sessionId,
                        locationId: location.id,
                      }).catch((err) => {
                        console.log('Failed to create location click event:');
                        console.log(err);
                      });
                    }
                  }}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      minWidth: '70px',
                      flexGrow: 0,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <FaLocationDot
                        style={{ color: data.settings.listPinAndDistanceColor }}
                      />
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        color: data.settings.listPinAndDistanceColor,
                      }}
                    >
                      {roundDistance(
                        isImperial(geolocation.countryCode)
                          ? location.distance * 0.000621371 // meters -> miles
                          : location.distance / 1000, // meters -> kilometers
                      )}
                      &nbsp;
                      {isImperial(geolocation.countryCode) ? 'mi' : 'km'}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexDirection: 'column',
                      flexGrow: 1,
                      color: data.settings.listTextColor,
                    }}
                  >
                    <div
                      className="neutek-locator-list-location-name"
                      style={{
                        fontWeight: 'bold',
                        color: data.settings.listLocationNameColor,
                      }}
                    >
                      {location.name}
                    </div>
                    <Address
                      scope="list"
                      location={location}
                      settings={data.settings}
                    />
                    {(location.phone || location.email || location.website) && (
                      <Contact
                        scope="list"
                        location={location}
                        settings={data.settings}
                      />
                    )}
                    {shouldRenderCustomFields(location, customFieldsById) && (
                      <CustomFields
                        scope="list"
                        location={location}
                        customFieldsById={customFieldsById}
                        translationsById={translationsById}
                      />
                    )}
                    {location.searchFilters.length > 0 && (
                      <SearchFilters
                        scope="list"
                        location={location}
                        searchFiltersById={searchFiltersById}
                        settings={data.settings}
                        translationsById={translationsById}
                      />
                    )}
                    {shouldRenderCustomActions(location, customActionsById) && (
                      <CustomActions
                        scope="list"
                        location={location}
                        customActionsById={customActionsById}
                        settings={data.settings}
                        translationsById={translationsById}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
