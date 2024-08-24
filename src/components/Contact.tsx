import React from 'react';
import { FaGlobe, FaPhone, FaRegEnvelope } from 'react-icons/fa6';
import { GetLocatorOutput } from '../dto/api';

export interface ContactProps {
  scope: 'list' | 'map';
  location: GetLocatorOutput['locations'][number];
  settings: GetLocatorOutput['settings'];
}

export const Contact: React.FC<ContactProps> = ({
  scope,
  location,
  settings,
}) => {
  if (!location.phone && !location.email && !location.website) {
    return null;
  }

  return (
    <div className={`neutek-locator-${scope}-location-contact`}>
      {location.phone && (
        <div
          style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <FaPhone
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          />
          <a
            href={`tel:${location.phone}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          >
            {location.phone}
          </a>
        </div>
      )}
      {location.email && (
        <div
          style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <FaRegEnvelope
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          />
          <a
            href={`mailto:${location.email}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          >
            {location.email}
          </a>
        </div>
      )}
      {location.website && (
        <div
          style={{
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <FaGlobe
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          />
          <a
            href={location.website}
            target="_blank"
            rel="noreferrer"
            style={{
              color:
                scope === 'list'
                  ? settings.listLinkColor
                  : settings.mapLinkColor,
            }}
          >
            {location.website}
          </a>
        </div>
      )}
    </div>
  );
};
