import React from 'react';
import styled from 'styled-components';
import { GetLocatorOutput } from '../dto/api';

const DivValueContainer = styled.div`
  p {
    margin: 0;
    padding: 0;
    word-break: break-word;
  }
  p strong,
  p em {
    margin: 0;
    padding: 0;
  }
`;

const DivInlineValueContainer = styled.div`
  display: inline;
  p {
    margin: 0;
    padding: 0;
    word-break: break-word;
  }
  p:first-child {
    display: inline;
  }
  p strong,
  p em {
    margin: 0;
    padding: 0;
  }
`;

export interface CustomFieldsProps {
  scope: 'list' | 'map';
  location: GetLocatorOutput['locations'][number];
  customFieldsById: Record<string, GetLocatorOutput['customFields'][number]>;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  scope,
  location,
  customFieldsById,
}) => {
  return (
    <div
      className={`neutek-locator-${scope}-location-custom-fields`}
      style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
    >
      {location.customFieldValues.map((customFieldValue) => {
        const customField = customFieldsById[customFieldValue.customFieldId];
        const value = customFieldValue.value || customField.defaultValue;

        if (
          (scope === 'list' && !customField.showInList) ||
          (scope === 'map' && !customField.showInMap)
        ) {
          return null;
        }

        if (!value) {
          return null;
        }

        if (customField.hideLabel) {
          return (
            <div
              key={customFieldValue.id}
              className={`neutek-locator-${scope}-location-custom-field`}
            >
              <DivValueContainer
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          );
        }

        if (customField.labelPosition === 'top') {
          return (
            <div
              key={customFieldValue.id}
              className={`neutek-locator-${scope}-location-custom-field`}
            >
              <div style={{ fontWeight: 'bold' }}>{customField.name}:</div>
              <DivValueContainer
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          );
        }

        if (customField.labelPosition === 'inline') {
          return (
            <div
              key={customFieldValue.id}
              className={`neutek-locator-${scope}-location-custom-field`}
            >
              <span style={{ fontWeight: 'bold' }}>{customField.name}:</span>{' '}
              <DivInlineValueContainer
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: value }}
              />
            </div>
          );
        }

        // Shouldn't get here
        return null;
      })}
    </div>
  );
};
