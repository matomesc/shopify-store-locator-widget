import { Marker, MarkerClusterer } from '@googlemaps/markerclusterer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { GetLocatorOutput } from '../dto/api';
import { LocationMarker } from './LocationMarker';
import { Address } from './Address';

export interface LocationMarkerClusterProps {
  locations: GetLocatorOutput['locations'];
  selectedLocation: GetLocatorOutput['locations'][number] | null;
  onSelect: (location: GetLocatorOutput['locations'][number] | null) => void;
}

export const LocationMarkerCluster: React.FC<LocationMarkerClusterProps> = ({
  locations,
  selectedLocation,
  onSelect,
}) => {
  const [state, setState] = useState<{
    markers: Record<string, Marker>;
  }>({
    markers: {},
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

  return (
    <>
      {locations.map((location) => {
        return (
          <LocationMarker
            key={location.id}
            location={location}
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
          disableAutoPan
          shouldFocus={false}
        >
          <strong>{selectedLocation.name}</strong>
          <Address location={selectedLocation} />
        </InfoWindow>
      )}
    </>
  );
};
