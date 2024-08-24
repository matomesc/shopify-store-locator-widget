import React from 'react';
import styled from 'styled-components';
import { GetLocatorOutput } from '../dto/api';

const SearchFilter = styled.div<{
  $selected: boolean;
  $borderRadius: string;
  $textColor: string;
  $backgroundColor: string;
  $hoverBackgroundColor: string;
  $selectedBorderColor: string;
  $selectedBackgroundColor: string;
  $selectedHoverBackgroundColor: string;
}>`
  cursor: pointer;
  padding: 5px;
  border-radius: ${(props) => props.$borderRadius};
  color: ${(props) => props.$textColor};
  background: ${(props) =>
    props.$selected ? props.$selectedBackgroundColor : props.$backgroundColor};
  border: ${(props) =>
    props.$selected
      ? `2px solid ${props.$selectedBorderColor}`
      : '2px solid transparent'};

  &:hover {
    background: ${(props) =>
      props.$selected
        ? props.$selectedHoverBackgroundColor
        : props.$hoverBackgroundColor};
  }
`;

export interface SearchFiltersSelectorProps {
  searchFilters: GetLocatorOutput['searchFilters'];
  selected: string[];
  settings: GetLocatorOutput['settings'];
  onSelect: (selected: string[]) => void;
}

export const SearchFiltersSelector: React.FC<SearchFiltersSelectorProps> = ({
  searchFilters,
  selected,
  settings,
  onSelect,
}) => {
  return (
    <div
      className="neutek-locator-search-filters"
      style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
    >
      {searchFilters.map((searchFilter) => {
        return (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <SearchFilter
            key={searchFilter.id}
            className="neutek-locator-search-filter"
            $selected={selected.includes(searchFilter.id)}
            $borderRadius={settings.borderRadius}
            $textColor={settings.searchFilterTextColor}
            $backgroundColor={settings.searchFilterBackgroundColor}
            $hoverBackgroundColor={settings.searchFilterHoverBackgroundColor}
            $selectedBorderColor={settings.searchFilterSelectedBorderColor}
            $selectedBackgroundColor={
              settings.searchFilterSelectedBackgroundColor
            }
            $selectedHoverBackgroundColor={
              settings.searchFilterSelectedHoverBackgroundColor
            }
            onClick={() => {
              if (selected.includes(searchFilter.id)) {
                onSelect(selected.filter((id) => id !== searchFilter.id));
              } else {
                onSelect([...selected, searchFilter.id]);
              }
            }}
          >
            {searchFilter.name}
          </SearchFilter>
        );
      })}
    </div>
  );
};
