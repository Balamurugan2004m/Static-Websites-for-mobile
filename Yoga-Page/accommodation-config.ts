import { apiClient } from './api-client';
import { API_URLS } from '../constants/api-urls';

interface AccommodationApiItem {
  LookupValueId: number;
  LookupTypeId: number;
  Name: string;
  Description: string;
  Visibility: string;
}

export interface AccommodationItem {
  id: string;
  name: string;
  description: string;
  visibility: string;
}

let lookupTypeId: number | null = null;

const toAccommodationItem = (raw: AccommodationApiItem): AccommodationItem => ({
  id: String(raw.LookupValueId),
  name: raw.Name,
  description: raw.Description,
  visibility: raw.Visibility,
});

export const getAccommodations = async (): Promise<AccommodationItem[]> => {
  const raw = await apiClient.get<AccommodationApiItem[]>(API_URLS.ACCOMMODATION_CONFIG.GET_ALL);
  if (!Array.isArray(raw)) return [];
  if (raw.length > 0) lookupTypeId = raw[0].LookupTypeId;
  return raw.map(toAccommodationItem);
};

export const addAccommodation = async (
  name: string,
  description: string
): Promise<AccommodationItem> => {
  if (lookupTypeId === null) {
    try {
      await getAccommodations();
    } catch {
      // ignore
    }
  }
  const now = new Date().toISOString();
  const payload = [
    {
      CreatedDate: now,
      CreatedBy: 0,
      ModifiedDate: now,
      ModifiedBy: 0,
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
  if (lookupTypeId === null) {
    try {
      await getAccommodations();
    } catch {
      // ignore
    }
  }
  await deleteAccommodation(id);
  return await addAccommodation(name, description);
};
