// tests/items.test.js
jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const {
  getItemsByBox,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../supabase/queries/items");

const VALID_UUID = "00000000-0000-0000-0000-000000000000";
const TIMESTAMP = "2025-07-18T00:00:00.000Z";

describe("items queries", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getItemsByBox", () => {
    it("returns parsed items on success", async () => {
      const mockData = [
        {
          id: VALID_UUID,
          box_id: VALID_UUID,
          name: "Item 1",
          quantity: 2,
          created_at: TIMESTAMP,
          updated_at: TIMESTAMP,
        },
      ];
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getItemsByBox(VALID_UUID);

      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.eq).toHaveBeenCalledWith("box_id", VALID_UUID);
      expect(query.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    it("throws if Supabase returns an error", async () => {
      const err = new Error("fetch failed");
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(getItemsByBox(VALID_UUID)).rejects.toThrow("fetch failed");
    });
  });

  describe("getItem", () => {
    it("returns parsed item when found", async () => {
      const mockData = {
        id: VALID_UUID,
        box_id: VALID_UUID,
        name: "Item 1",
        quantity: 5,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      };
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getItem(VALID_UUID);

      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.eq).toHaveBeenCalledWith("id", VALID_UUID);
      expect(query.single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("returns null when not found", async () => {
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getItem("i999");
      expect(result).toBeNull();
    });

    it("throws if Supabase returns an error", async () => {
      const err = new Error("lookup failed");
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(getItem(VALID_UUID)).rejects.toThrow("lookup failed");
    });
  });

  describe("createItem", () => {
    it("inserts and returns the new item", async () => {
      const newItem = { box_id: VALID_UUID, name: "New", quantity: 1 };
      const returned = {
        id: VALID_UUID,
        ...newItem,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      };
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: returned, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await createItem(newItem);

      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(query.insert).toHaveBeenCalledWith(newItem);
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.single).toHaveBeenCalled();
      expect(result).toEqual(returned);
    });

    it("throws if insert returns an error", async () => {
      const err = new Error("insert failed");
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(createItem({})).rejects.toThrow("insert failed");
    });
  });

  describe("updateItem", () => {
    it("updates and returns the item", async () => {
      const updates = { name: "Updated" };
      const returned = {
        id: VALID_UUID,
        box_id: VALID_UUID,
        name: "Updated",
        quantity: 3,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
      };
      const query = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: returned, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await updateItem(VALID_UUID, updates);

      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(query.update).toHaveBeenCalledWith(updates);
      expect(query.eq).toHaveBeenCalledWith("id", VALID_UUID);
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.single).toHaveBeenCalled();
      expect(result).toEqual(returned);
    });

    it("throws if update returns an error", async () => {
      const err = new Error("update failed");
      const query = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(updateItem(VALID_UUID, {})).rejects.toThrow("update failed");
    });
  });

  describe("deleteItem", () => {
    it("deletes without error", async () => {
      const query = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (cb) => cb({ error: null }),
      };
      supabase.from.mockReturnValue(query);

      await expect(deleteItem(VALID_UUID)).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith("id", VALID_UUID);
    });

    it("throws if delete returns an error", async () => {
      const err = new Error("delete failed");
      const query = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (cb) => cb({ error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(deleteItem(VALID_UUID)).rejects.toThrow("delete failed");
    });
  });
});
