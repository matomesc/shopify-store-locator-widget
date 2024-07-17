import { useMapsLibrary } from '@vis.gl/react-google-maps';
import React, { useEffect, useRef } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import styled from 'styled-components';

const SearchBarButton = styled.button<{
  color: string;
  colorHover: string;
  background: string;
  backgroundHover: string;
  borderRadius: string;
}>`
  cursor: pointer;
  border-radius: ${(props) => props.borderRadius};
  border: none;
  color: ${(props) => props.color};
  background: ${(props) => props.background};
  padding: 10px;
  flex-grow: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;

  &:hover {
    background: ${(props) => props.backgroundHover};
    color: ${(props) => props.colorHover};
  }
`;

const SearchBarInput = styled.input<{
  borderColor: string;
  borderRadius: string;
}>`
  flex-grow: 1;
  outline: none;
  border: 1px solid ${(props) => props.borderColor};
  box-shadow: none;
  padding: 5px;
  margin: 0px;
  border-radius: ${(props) => props.borderRadius};
`;

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onPlaceChanged: (value: { lat: number; lng: number }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
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
    autocompleteRef.current.setFields(['geometry', 'address_components']);
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }
      onPlaceChanged({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }, [onPlaceChanged, placesLibrary]);

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
        borderColor="#000000"
        borderRadius="5px"
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
        color="white"
        colorHover="white"
        background="green"
        backgroundHover="blue"
        borderRadius="5px"
        onClick={onSearch}
      >
        <FaMagnifyingGlass />
      </SearchBarButton>
    </div>
  );
};
