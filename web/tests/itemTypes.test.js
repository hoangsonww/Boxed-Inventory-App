// tests/itemTypes.test.js
jest.mock('../supabase/client', () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require('../supabase/client');
const {
  getItemTypes,
  createItemType,
} = require('../supabase/queries/itemTypes');

describe('itemTypes queries', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getItemTypes', () => {
    it('returns parsed array on success', async () => {
      const mockData = [
        { id: 1, name: 'Type A' },
        { id: 2, name: 'Type B' },
      ];
      const query = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getItemTypes();
      expect(supabase.from).toHaveBeenCalledWith('item_types');
      expect(query.select).toHaveBeenCalledWith('*');
      expect(query.order).toHaveBeenCalledWith('name');
      expect(result).toEqual(mockData);
    });

    it('throws if Supabase returns an error', async () => {
      const err = new Error('fetch failed');
      const query = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(getItemTypes()).rejects.toThrow('fetch failed');
    });
  });

  describe('createItemType', () => {
    it('inserts and returns new type on success', async () => {
      const newType = { name: 'NewType' };
      const returned = { id: 3, name: 'NewType' };
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: returned, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await createItemType('NewType');
      expect(supabase.from).toHaveBeenCalledWith('item_types');
      expect(query.insert).toHaveBeenCalledWith({ name: 'NewType' });
      expect(query.select).toHaveBeenCalledWith('*');
      expect(query.single).toHaveBeenCalled();
      expect(result).toEqual(returned);
    });

    it('throws if insert returns an error', async () => {
      const err = new Error('insert failed');
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(createItemType('X')).rejects.toThrow('insert failed');
    });
  });
});
