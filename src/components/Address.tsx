import React from 'react';
import { FaDiamondTurnRight } from 'react-icons/fa6';
import { GetLocatorOutput } from '../dto/api';

export interface AddressProps {
  scope: 'list' | 'map';
  location: GetLocatorOutput['locations'][number];
  settings: GetLocatorOutput['settings'];
}

export const Address: React.FC<AddressProps> = ({
  scope,
  location,
  settings,
}) => {
  const pieces: React.ReactNode[] = [];

  if (location.address1) {
    pieces.push(<div key="address1">{location.address1}</div>);
  }

  if (location.address2) {
    pieces.push(<div key="address2">{location.address2}</div>);
  }

  if (location.city && location.state && location.zip) {
    pieces.push(
      <div key="cityStateZip">
        {location.city}, {location.state} {location.zip}
      </div>,
    );
  } else if (location.city && location.state) {
    pieces.push(
      <div key="cityState">
        {location.city}, {location.state}
      </div>,
    );
  } else if (location.city && location.zip) {
    pieces.push(
      <div key="cityZip">
        {location.city}, {location.zip}
      </div>,
    );
  } else if (location.state && location.zip) {
    pieces.push(
      <div key="stateZip">
        {location.state} {location.zip}
      </div>,
    );
  } else if (location.city) {
    pieces.push(<div key="city">{location.city}</div>);
  } else if (location.state) {
    pieces.push(<div key="state">{location.state}</div>);
  } else if (location.zip) {
    pieces.push(<div key="zip">{location.zip}</div>);
  }

  return (
    <div className={`neutek-locator-${scope}-location-address`}>
      {pieces}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <FaDiamondTurnRight
          style={{
            color:
              scope === 'list' ? settings.listLinkColor : settings.mapLinkColor,
          }}
        />
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${location.lat},${location.lng}`)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color:
              scope === 'list' ? settings.listLinkColor : settings.mapLinkColor,
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          Directions
        </a>
      </div>
    </div>
  );
};
