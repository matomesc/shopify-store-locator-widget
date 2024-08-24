import React from 'react';
import { GetLocatorOutput } from '../dto/api';

export interface SearchFiltersProps {
  scope: 'list' | 'map';
  location: GetLocatorOutput['locations'][number];
  searchFiltersById: Record<string, GetLocatorOutput['searchFilters'][number]>;
  settings: GetLocatorOutput['settings'];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  scope,
  location,
  searchFiltersById,
  settings,
}) => {
  return (
    <div className={`neutek-locator-${scope}-location-search-filters`}>
      {location.searchFilters.map((searchFilterId) => {
        const searchFilter = searchFiltersById[searchFilterId];

        if (
          (scope === 'list' && !searchFilter.showInList) ||
          (scope === 'map' && !searchFilter.showInMap)
        ) {
          return null;
        }

        return (
          <div
            key={searchFilterId}
            className={`neutek-locator-${scope}-location-search-filter`}
            style={{
              fontWeight: 'bold',
              color:
                scope === 'list'
                  ? settings.listSearchFilterColor
                  : settings.mapSearchFilterColor,
            }}
          >
            {searchFilter.name}
          </div>
        );
      })}
    </div>
  );
};
