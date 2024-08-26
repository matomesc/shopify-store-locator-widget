/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

export type GetLocatorOutput = {
  ok: boolean;
  settings: {
    googleMapsApiKey: string;
    borderRadius: string;
    searchInputBorderColor: string;
    searchInputBackgroundColor: string;
    searchInputPlaceholderColor: string;
    searchButtonTextColor: string;
    searchButtonBackgroundColor: string;
    searchButtonHoverBackgroundColor: string;
    searchFilterTextColor: string;
    searchFilterBackgroundColor: string;
    searchFilterHoverBackgroundColor: string;
    searchFilterSelectedBorderColor: string;
    searchFilterSelectedBackgroundColor: string;
    searchFilterSelectedHoverBackgroundColor: string;
    listLocationNameColor: string;
    listTextColor: string;
    listLinkColor: string;
    listSearchFilterColor: string;
    listCustomActionTextColor: string;
    listCustomActionBackgroundColor: string;
    listCustomActionHoverBackgroundColor: string;
    listSelectedLocationBorderColor: string;
    listPinAndDistanceColor: string;
    mapMarkerType: string;
    mapMarkerBackgroundColor: string;
    mapMarkerBorderColor: string;
    mapMarkerGlyphColor: string;
    mapMarkerImage: string;
    mapLocationNameColor: string;
    mapTextColor: string;
    mapLinkColor: string;
    mapSearchFilterColor: string;
    mapCustomActionTextColor: string;
    mapCustomActionBackgroundColor: string;
    mapCustomActionHoverBackgroundColor: string;
  };
  locations: Array<{
    id: string;
    name: string;
    active: boolean;
    phone: string;
    email: string;
    website: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lng: number;
    searchFilters: string[];
    customFieldValues: Array<{
      id: string;
      value: string;
      customFieldId: string;
    }>;
    customActionValues: Array<{
      id: string;
      value: string;
      customActionId: string;
    }>;
  }>;
  searchFilters: Array<{
    id: string;
    name: string;
    position: number;
    enabled: boolean;
    showInList: boolean;
    showInMap: boolean;
  }>;
  customFields: Array<{
    id: string;
    name: string;
    position: number;
    enabled: boolean;
    hideLabel: boolean;
    labelPosition: 'inline' | 'top';
    showInList: boolean;
    showInMap: boolean;
    defaultValue: string;
  }>;
  customActions: Array<{
    id: string;
    name: string;
    type: 'link' | 'js';
    position: number;
    enabled: boolean;
    showInList: boolean;
    showInMap: boolean;
    defaultValue: string;
    openInNewTab: boolean;
  }>;
  translations: Array<{
    id: string;
    value: string;
    target: string | null;
    searchFilterId: string | null;
    customFieldId: string | null;
    customActionId: string | null;
  }>;
};

export const PostSessionsInput = z.object({
  id: z.string(),
  shopId: z.string(),
  ip: z.string(),
  country: z.string(),
  countryCode: z.string(),
  region: z.string(),
  regionName: z.string(),
  city: z.string(),
  zip: z.string(),
  ipGeolocationLat: z.number(),
  ipGeolocationLng: z.number(),
  browserGeolocationLat: z.number().nullable(),
  browserGeolocationLng: z.number().nullable(),
  language: z.string(),
  mobile: z.boolean(),
});
export type PostSessionsInput = z.infer<typeof PostSessionsInput>;

export type PostSessionsOutput = {
  ok: boolean;
};

export const PutSessionsInput = z.object({
  id: z.string(),
  browserGeolocationLat: z.number(),
  browserGeolocationLng: z.number(),
});
export type PutSessionsInput = z.infer<typeof PutSessionsInput>;

export type PutSessionsOutput = {
  ok: boolean;
};

export const PostSearchEventsInput = z.object({
  sessionId: z.string(),
  query: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type PostSearchEventsInput = z.infer<typeof PostSearchEventsInput>;

export type PostSearchEventsOutput = {
  ok: boolean;
};
