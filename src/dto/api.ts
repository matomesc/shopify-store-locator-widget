export type GetLocatorOutput = {
  ok: boolean;
  settings: {
    googleMapsApiKey: string;
  };
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
    searchFilters: Array<{ id: string }>;
    customFieldValues: Array<{
      id: string;
      value: string;
      locationId: string;
      customFieldId: string;
    }>;
    customActionValues: Array<{
      id: string;
      value: string;
      locationId: string;
      customActionId: string;
    }>;
  }>;
};
