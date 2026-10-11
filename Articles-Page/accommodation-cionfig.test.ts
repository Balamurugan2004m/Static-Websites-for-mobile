import { apiClient } from './api-client';
import { API_URLS } from '../constants/api-urls';
import {
  getAccommodations,
  addAccommodation,
  deleteAccommodation,
  editAccommodation,
} from './accommodation-config';

jest.mock('./api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../store', () => ({
  store: {
    getState: jest.fn(() => ({
      authUser: {
        authUser: {
          id: '9',
        },
      },
    })),
  },
}));

describe('accommodationConfig service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccommodations', () => {
    it('calls apiClient.get with GET_ALL endpoint and formats items', async () => {
      const mockRaw = [
        {
          LookupValueId: 101,
          LookupTypeId: 2145,
          Name: 'Wheelchair',
          Description: 'Wheelchair ramp',
          Visibility: 'Internal',
        },
      ];
      (apiClient.get as jest.Mock).mockResolvedValue(mockRaw);

      const result = await getAccommodations();

      expect(apiClient.get).toHaveBeenCalledWith(API_URLS.ACCOMMODATION_CONFIG.GET_ALL);
      expect(result).toEqual([
        {
          id: '101',
          name: 'Wheelchair',
          description: 'Wheelchair ramp',
          visibility: 'Internal',
        },
      ]);
    });

    it('returns empty array if response is not an array', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(null);

      const result = await getAccommodations();

      expect(result).toEqual([]);
    });
  });

  describe('addAccommodation', () => {
    it('calls apiClient.post with ADD endpoint and payload', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(true);

      const result = await addAccommodation('Braille', 'Braille docs');

      expect(apiClient.post).toHaveBeenCalledWith(
        API_URLS.ACCOMMODATION_CONFIG.ADD,
        expect.arrayContaining([
          expect.objectContaining({
            Name: 'Braille',
            Description: 'Braille docs',
            CreatedBy: 9,
            Visibility: 'Internal',
          }),
        ])
      );
      expect(result).toEqual({
        id: '',
        name: 'Braille',
        description: 'Braille docs',
        visibility: 'Internal',
      });
    });
  });

  describe('deleteAccommodation', () => {
    it('calls apiClient.post with DELETE endpoint and numeric Id', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(true);

      await deleteAccommodation('101');

      expect(apiClient.post).toHaveBeenCalledWith(API_URLS.ACCOMMODATION_CONFIG.DELETE, {
        Id: 101,
      });
    });
  });

  describe('editAccommodation', () => {
    it('calls apiClient.put with EDIT endpoint and correct payload', async () => {
      const mockApiResponse = {
        LookupValueId: 6369,
        LookupTypeId: 2145,
        Name: 'Bracey',
        Description: 'Clutcher',
        IsActive: true,
        Visibility: 'Internal',
      };
      (apiClient.put as jest.Mock).mockResolvedValue(mockApiResponse);

      const result = await editAccommodation('6369', 'Bracey', 'Clutcher');

      expect(apiClient.put).toHaveBeenCalledWith(
        API_URLS.ACCOMMODATION_CONFIG.EDIT,
        expect.objectContaining({
          Id: 6369,
          CreatedBy: 9,
          ModifiedBy: 9,
          Name: 'Bracey',
          Description: 'Clutcher',
        })
      );
      expect(result).toEqual({
        id: '6369',
        name: 'Bracey',
        description: 'Clutcher',
        visibility: 'Internal',
      });
    });

    it('handles fallback if response is empty', async () => {
      (apiClient.put as jest.Mock).mockResolvedValue(null);

      const result = await editAccommodation('6369', 'Bracey', 'Clutcher');

      expect(result).toEqual({
        id: '6369',
        name: 'Bracey',
        description: 'Clutcher',
        visibility: 'Internal',
      });
    });
  });
});
