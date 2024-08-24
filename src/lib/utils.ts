import { GetLocatorOutput } from '../dto/api';

export function isImperial(countryCode: string) {
  return (
    countryCode === 'US' ||
    countryCode === 'GB' ||
    countryCode === 'LR' ||
    countryCode === 'MM'
  );
}

export function roundDistance(distance: number) {
  if (distance < 10) {
    return distance.toFixed(1);
  }
  return distance.toFixed(0);
}

export function shouldRenderCustomFields(
  location: GetLocatorOutput['locations'][number],
  customFieldsById: Record<string, GetLocatorOutput['customFields'][number]>,
) {
  // eslint-disable-next-line no-restricted-syntax
  for (const customFieldValue of location.customFieldValues) {
    if (customFieldValue.value) {
      return true;
    }
    if (customFieldsById[customFieldValue.customFieldId].defaultValue) {
      return true;
    }
  }
  return false;
}

export function shouldRenderCustomActions(
  location: GetLocatorOutput['locations'][number],
  customActionsById: Record<string, GetLocatorOutput['customActions'][number]>,
) {
  // eslint-disable-next-line no-restricted-syntax
  for (const customActionValue of location.customActionValues) {
    if (customActionValue.value) {
      return true;
    }
    if (customActionsById[customActionValue.customActionId].defaultValue) {
      return true;
    }
  }
  return false;
}
