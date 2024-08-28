import { Marker, MarkerClusterer } from '@googlemaps/markerclusterer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { GetLocatorOutput } from '../dto/api';
import { LocationMarker } from './LocationMarker';
import { Address } from './Address';
import { Contact } from './Contact';
import { CustomFields } from './CustomFields';
import {
  shouldRenderCustomActions,
  shouldRenderCustomFields,
} from '../lib/utils';
import { SearchFilters } from './SearchFilters';
import { CustomActions } from './CustomActions';

export interface LocationMarkerClusterProps {
  locations: GetLocatorOutput['locations'];
  selectedLocation: GetLocatorOutput['locations'][number] | null;
  settings: GetLocatorOutput['settings'];
  customFieldsById: Record<string, GetLocatorOutput['customFields'][number]>;
  searchFiltersById: Record<string, GetLocatorOutput['searchFilters'][number]>;
  customActionsById: Record<string, GetLocatorOutput['customActions'][number]>;
  translationsById: {
    targets: Record<string, GetLocatorOutput['translations'][number]>;
    searchFilters: Record<string, GetLocatorOutput['translations'][number]>;
    customFields: Record<string, GetLocatorOutput['translations'][number]>;
    customActions: Record<string, GetLocatorOutput['translations'][number]>;
  };
  onSelect: (location: GetLocatorOutput['locations'][number] | null) => void;
}

export const LocationMarkerCluster: React.FC<LocationMarkerClusterProps> = ({
  locations,
  selectedLocation,
  settings,
  customFieldsById,
  searchFiltersById,
  customActionsById,
  translationsById,
  onSelect,
}) => {
  const [state, setState] = useState<{
    markers: Record<string, Marker>;
    fontFamily: string | null;
    fontSize: string | null;
  }>({
    markers: {},
    fontFamily: null,
    fontSize: null,
  });
  const map = useMap('mainMap');
  const clusterer = useMemo(() => {
    if (!map) return null;

    return new MarkerClusterer({ map });
  }, [map]);
  useEffect(() => {
    if (!clusterer) return;

    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(state.markers));
  }, [clusterer, state.markers]);
  // this callback will effectively get passsed as ref to the markers to keep
  // tracks of markers currently on the map
  const setMarkerRef = useCallback((marker: Marker | null, id: string) => {
    setState((prevState) => {
      if (
        (marker && prevState.markers[id]) ||
        (!marker && !prevState.markers[id])
      ) {
        return prevState;
      }

      if (marker) {
        return {
          ...prevState,
          markers: {
            ...prevState.markers,
            [id]: marker,
          },
        };
      }

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { [id]: _, ...newMarkers } = prevState.markers;

      return { ...prevState, markers: newMarkers };
    });
  }, []);

  const handleMarkerClick = useCallback(
    (location: GetLocatorOutput['locations'][number]) => {
      onSelect(location);
    },
    [onSelect],
  );

  // Get the font family used in the container and apply it to the info window
  useEffect(() => {
    const container =
      document.querySelector<HTMLDivElement>('.neutek-locator-container') ||
      document.body;
    const testDiv = document.createElement('div');

    container.append(testDiv);

    const { fontFamily, fontSize } = getComputedStyle(testDiv);

    container.removeChild(testDiv);

    setState((prevState) => {
      return {
        ...prevState,
        fontFamily,
        fontSize,
      };
    });
  }, []);

  return (
    <>
      {locations.map((location) => {
        return (
          <LocationMarker
            key={location.id}
            location={location}
            settings={settings}
            onClick={handleMarkerClick}
            setMarkerRef={setMarkerRef}
          />
        );
      })}

      {selectedLocation && (
        <InfoWindow
          anchor={state.markers[selectedLocation.id]}
          onCloseClick={() => {
            onSelect(null);
          }}
          maxWidth={300}
          // disableAutoPan
          shouldFocus={false}
          style={{ maxHeight: '300px' }}
        >
          <div
            className="neutek-locator-map-location"
            style={{
              display: 'flex',
              gap: '10px',
              flexDirection: 'column',
              flexGrow: 1,
              color: settings.mapTextColor,
              maxHeight: '300px',
              fontFamily: state.fontFamily || 'inherit',
              fontSize: state.fontSize || 'inherit',
            }}
          >
            <div
              className="neutek-locator-map-location-name"
              style={{
                fontWeight: 'bold',
                color: settings.mapLocationNameColor,
              }}
            >
              {selectedLocation.name}
            </div>
            <Address
              scope="map"
              location={selectedLocation}
              settings={settings}
            />
            {(selectedLocation.phone ||
              selectedLocation.email ||
              selectedLocation.website) && (
              <Contact
                scope="map"
                location={selectedLocation}
                settings={settings}
              />
            )}
            {shouldRenderCustomFields(selectedLocation, customFieldsById) && (
              <CustomFields
                scope="map"
                location={selectedLocation}
                customFieldsById={customFieldsById}
                translationsById={translationsById}
              />
            )}
            {selectedLocation.searchFilters.length > 0 && (
              <SearchFilters
                scope="map"
                location={selectedLocation}
                searchFiltersById={searchFiltersById}
                settings={settings}
                translationsById={translationsById}
              />
            )}
            {shouldRenderCustomActions(selectedLocation, customActionsById) && (
              <CustomActions
                scope="map"
                location={selectedLocation}
                customActionsById={customActionsById}
                settings={settings}
                translationsById={translationsById}
              />
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};
