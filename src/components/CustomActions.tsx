import React from 'react';
import styled from 'styled-components';
import { GetLocatorOutput } from '../dto/api';

const Button = styled.button<{
  $borderRadius: string;
  $textColor: string;
  $backgroundColor: string;
  $hoverBackgroundColor: string;
}>`
  cursor: pointer;
  border: none;
  border-radius: ${(props) => props.$borderRadius};
  color: ${(props) => props.$textColor};
  background: ${(props) => props.$backgroundColor};
  padding: 10px;
  margin: 0;
  flex-grow: 1;
  height: 40px;

  &:hover {
    background: ${(props) => props.$hoverBackgroundColor};
  }
`;

export interface CustomActionsProps {
  scope: 'list' | 'map';
  location: GetLocatorOutput['locations'][number];
  customActionsById: Record<string, GetLocatorOutput['customActions'][number]>;
  settings: GetLocatorOutput['settings'];
  translationsById: {
    targets: Record<string, GetLocatorOutput['translations'][number]>;
    searchFilters: Record<string, GetLocatorOutput['translations'][number]>;
    customFields: Record<string, GetLocatorOutput['translations'][number]>;
    customActions: Record<string, GetLocatorOutput['translations'][number]>;
  };
}

export const CustomActions: React.FC<CustomActionsProps> = ({
  scope,
  location,
  customActionsById,
  settings,
  translationsById,
}) => {
  return (
    <div
      className={`neutek-locator-${scope}-location-custom-actions`}
      style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
    >
      {location.customActionValues.map((customActionValue) => {
        const customAction =
          customActionsById[customActionValue.customActionId];
        const value = customActionValue.value || customAction.defaultValue;

        if (
          (scope === 'list' && !customAction.showInList) ||
          (scope === 'map' && !customAction.showInMap)
        ) {
          return null;
        }

        if (!value) {
          return null;
        }

        return (
          <Button
            key={customActionValue.id}
            className={`neutek-locator-${scope}-location-custom-action`}
            $borderRadius={settings.borderRadius}
            $textColor={
              scope === 'list'
                ? settings.listCustomActionTextColor
                : settings.mapCustomActionTextColor
            }
            $backgroundColor={
              scope === 'list'
                ? settings.listCustomActionBackgroundColor
                : settings.mapCustomActionBackgroundColor
            }
            $hoverBackgroundColor={
              scope === 'list'
                ? settings.listCustomActionHoverBackgroundColor
                : settings.mapCustomActionHoverBackgroundColor
            }
            onClick={(event) => {
              event.stopPropagation();

              if (customAction.type === 'link') {
                window.open(
                  value,
                  customAction.openInNewTab ? '_blank' : '_self',
                );
              } else if (customAction.type === 'js') {
                // eslint-disable-next-line no-eval
                eval(value);
              }
            }}
          >
            {translationsById.customActions[customAction.id]?.value ||
              customAction.name}
          </Button>
        );
      })}
    </div>
  );
};
