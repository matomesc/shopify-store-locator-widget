import React, { useMemo } from 'react';
import { GetLocatorOutput } from '../dto/api';

export interface SearchFiltersProps {
  searchFilters: GetLocatorOutput['searchFilters'];
  selected: string[];
  onSelect: (selected: string[]) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchFilters,
  selected,
  onSelect,
}) => {
  const searchFiltersSorted = useMemo(() => {
    return searchFilters.sort((searchFilterA, searchFilterB) => {
      return searchFilterA.position - searchFilterB.position;
    });
  }, [searchFilters]);

  return (
    <div
      className="neutek-locator-search-filters"
      style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}
    >
      {searchFiltersSorted.map((searchFilter) => {
        return (
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <div
            key={searchFilter.id}
            className="neutek-locator-search-filter"
            style={{
              padding: '5px',
              background: '#eeeeee',
              border: selected.includes(searchFilter.id)
                ? '2px solid black'
                : '2px solid transparent',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (selected.includes(searchFilter.id)) {
                onSelect(selected.filter((id) => id !== searchFilter.id));
              } else {
                onSelect([...selected, searchFilter.id]);
              }
            }}
          >
            {searchFilter.name}
          </div>
        );
      })}
    </div>
  );
};
