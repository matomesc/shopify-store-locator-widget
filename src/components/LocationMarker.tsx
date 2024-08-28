import React, { useCallback } from 'react';
import { Marker } from '@googlemaps/markerclusterer';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { GetLocatorOutput } from '../dto/api';

export interface LocationMarkerProps {
  location: GetLocatorOutput['locations'][number];
  settings: GetLocatorOutput['settings'];
  onClick: (location: GetLocatorOutput['locations'][number]) => void;
  setMarkerRef: (marker: Marker | null, key: string) => void;
}

export const LocationMarker: React.FC<LocationMarkerProps> = ({
  location,
  settings,
  onClick,
  setMarkerRef,
}) => {
  const handleClick = useCallback(() => onClick(location), [location, onClick]);
  const ref = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement) =>
      setMarkerRef(marker, location.id),
    [location.id, setMarkerRef],
  );

  return (
    <AdvancedMarker
      position={{ lat: location.lat, lng: location.lng }}
      ref={ref}
      onClick={handleClick}
    >
      {settings.mapMarkerType === 'pin' && (
        <Pin
          background={settings.mapMarkerBackgroundColor}
          borderColor={settings.mapMarkerBorderColor}
          glyphColor={settings.mapMarkerGlyphColor}
        />
      )}
      {settings.mapMarkerType === 'image' && (
        <img
          alt=""
          src={settings.mapMarkerImage}
          style={{ width: '32px', height: '32px' }}
        />
      )}
      {/* <span className="marker-clustering-tree">🌳</span> */}
    </AdvancedMarker>
  );
};
