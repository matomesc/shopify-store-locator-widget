import { useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect, useRef } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import styled from 'styled-components';
import { GetLocatorOutput } from '../dto/api';

const SearchBarButton = styled.button<{
  $borderRadius: string;
  $color: string;
  $background: string;
  $backgroundHover: string;
}>`
  cursor: pointer;
  border-radius: ${(props) => props.$borderRadius};
  border: none;
  color: ${(props) => props.$color};
  background: ${(props) => props.$background};
  padding: 10px;
  margin: 0;
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;

  &:hover {
    background: ${(props) => props.$backgroundHover};
  }
`;

const SearchBarInput = styled.input<{
  $borderRadius: string;
  $borderColor: string;
  $backgroundColor: string;
  $placeholderColor: string;
}>`
  flex-grow: 1;
  outline: none;
  border: 1px solid ${(props) => props.$borderColor};
  background: ${(props) => props.$backgroundColor};
  box-shadow: none;
  padding: 5px;
  margin: 0px;
  border-radius: ${(props) => props.$borderRadius};
  line-height: 28px; // 40px - padding - border

  &::placeholder {
    color: ${(props) => props.$placeholderColor};
  }
`;

export interface SearchBarProps {
  value: string;
  settings: GetLocatorOutput['settings'];
  translationsById: {
    targets: Record<string, GetLocatorOutput['translations'][number]>;
    searchFilters: Record<string, GetLocatorOutput['translations'][number]>;
    customFields: Record<string, GetLocatorOutput['translations'][number]>;
    customActions: Record<string, GetLocatorOutput['translations'][number]>;
  };
  onChange: (value: string) => void;
  onSearch: () => void;
  onPlaceChanged: (value: {
    lat: number;
    lng: number;
    query: string;
    addressComponents: google.maps.GeocoderAddressComponent[];
  }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  settings,
  translationsById,
  onChange,
  onSearch,
  onPlaceChanged,
}) => {
  const placesLibrary = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLibrary || autocompleteRef.current || !inputRef.current) {
      return;
    }

    // Initialize a new autocomplete component
    autocompleteRef.current = new placesLibrary.Autocomplete(inputRef.current);
    // Select the geometry field so we can get the latitute and longitude
    // See for full list of fields: https://developers.google.com/maps/documentation/javascript/places#place_search_fields
    autocompleteRef.current.setFields([
      'geometry',
      'formatted_address',
      'address_components',
    ]);
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (
        !place ||
        !place.geometry ||
        !place.geometry.location ||
        !place.formatted_address ||
        !place.address_components
      ) {
        return;
      }

      onChange(place.formatted_address);

      onPlaceChanged({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        query: place.formatted_address,
        addressComponents: place.address_components,
      });
    });
  }, [onChange, onPlaceChanged, placesLibrary]);

  return (
    <div
      className="neutek-locator-search-bar"
      style={{ display: 'flex', gap: '10px' }}
    >
      <SearchBarInput
        type="text"
        ref={inputRef}
        value={value}
        className="neutek-locator-search-bar-input"
        $borderColor={settings.searchInputBorderColor}
        $borderRadius={settings.borderRadius}
        $backgroundColor={settings.searchInputBackgroundColor}
        $placeholderColor={settings.searchInputPlaceholderColor}
        placeholder={
          translationsById.targets.searchInputPlaceholder?.value ||
          'Search addresses, zip codes, cities'
        }
        onChange={(event) => {
          return onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSearch();
          }
        }}
      />
      <SearchBarButton
        className="neutek-locator-search-bar-button"
        $borderRadius={settings.borderRadius}
        $color={settings.searchButtonTextColor}
        $background={settings.searchButtonBackgroundColor}
        $backgroundHover={settings.searchButtonHoverBackgroundColor}
        onClick={onSearch}
      >
        <FaMagnifyingGlass />
      </SearchBarButton>
    </div>
  );
};
