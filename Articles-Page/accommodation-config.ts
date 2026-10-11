import { apiClient } from './api-client';
import { API_URLS } from '../constants/api-urls';
import { store } from '../store';

interface AccommodationApiItem {
  LookupValueId: number;
  LookupTypeId?: number;
  Name: string;
  Description: string;
  Visibility: string;
  IsActive?: boolean;
}

export interface AccommodationItem {
  id: string;
  name: string;
  description: string;
  visibility: string;
}

let lookupTypeId: number | null = null;

const toAccommodationItem = (raw: AccommodationApiItem): AccommodationItem => ({
  id: String(raw?.LookupValueId ?? ''),
  name: raw?.Name ?? '',
  description: raw?.Description ?? '',
  visibility: raw?.Visibility ?? 'Internal',
});

export const getAccommodations = async (): Promise<AccommodationItem[]> => {
  const raw = await apiClient.get<AccommodationApiItem[]>(API_URLS.ACCOMMODATION_CONFIG.GET_ALL);
  if (!Array.isArray(raw)) return [];
  if (raw.length > 0 && raw[0].LookupTypeId) lookupTypeId = raw[0].LookupTypeId;
  return raw.map(toAccommodationItem);
};

export const addAccommodation = async (
  name: string,
  description: string
): Promise<AccommodationItem> => {
  const now = new Date().toISOString();
  let userId = 0;
  try {
    const state = store.getState();
    const parsed = Number(state?.authUser?.authUser?.id);
    if (!isNaN(parsed) && parsed > 0) userId = parsed;
  } catch {
    // fallback
  }

  const payload = [
    {
      CreatedDate: now,
      CreatedBy: userId,
      ModifiedDate: now,
      ModifiedBy: userId,
      LookupTypeId: lookupTypeId,
      Name: name,
      Description: description,
      IsActive: true,
      Visibility: 'Internal',
    },
  ];
  await apiClient.post<boolean>(API_URLS.ACCOMMODATION_CONFIG.ADD, payload);
  return { id: '', name, description, visibility: 'Internal' };
};

export const deleteAccommodation = async (id: string): Promise<void> => {
  await apiClient.post<boolean>(API_URLS.ACCOMMODATION_CONFIG.DELETE, { Id: Number(id) });
};

export const editAccommodation = async (
  id: string,
  name: string,
  description: string
): Promise<AccommodationItem> => {
  const now = new Date().toISOString();
  let userId = 0;
  try {
    const state = store.getState();
    const parsed = Number(state?.authUser?.authUser?.id);
    if (!isNaN(parsed) && parsed > 0) userId = parsed;
  } catch {
    // fallback
  }

  const payload = {
    Id: Number(id),
    CreatedDate: now,
    CreatedBy: userId,
    ModifiedDate: now,
    ModifiedBy: userId,
    Name: name,
    Description: description,
  };

  const response = await apiClient.put<AccommodationApiItem>(
    API_URLS.ACCOMMODATION_CONFIG.EDIT,
    payload
  );

  if (response && response.LookupValueId) {
    return toAccommodationItem(response);
  }

  return {
    id,
    name,
    description,
    visibility: 'Internal',
  };
};
