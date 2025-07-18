jest.mock("../supabase/client", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("../supabase/types", () => ({
  boxSchema: {
    array: () => ({ parse: (data) => data }),
    parse: (data) => data,
  },
}));

const { supabase } = require("../supabase/client");
const {
  getBoxesByOwner,
  getBox,
  createBox,
  updateBox,
  deleteBox,
} = require("../supabase/queries/boxes");

describe("Supabase boxes utilities", () => {
  let mockBuilder;

  beforeEach(() => {
    mockBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      data: null,
      error: null,
    };
    supabase.from.mockReturnValue(mockBuilder);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBoxesByOwner", () => {
    it("resolves with parsed data when no error", async () => {
      const fake = [{ id: "a" }, { id: "b" }];
      mockBuilder.data = fake;
      mockBuilder.error = null;

      const res = await getBoxesByOwner("owner123");
      expect(supabase.from).toHaveBeenCalledWith("boxes");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith(
        "owner_profile_id",
        "owner123",
      );
      expect(mockBuilder.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(res).toEqual(fake);
    });

    it("rejects with the Supabase error", async () => {
      const err = new Error("db fail");
      mockBuilder.error = err;
      await expect(getBoxesByOwner("owner123")).rejects.toThrow(err);
    });
  });

  describe("getBox", () => {
    it("resolves with parsed box when found", async () => {
      const box = { id: "42", name: "Test" };
      mockBuilder.data = box;
      mockBuilder.error = null;

      const res = await getBox("42");
      expect(supabase.from).toHaveBeenCalledWith("boxes");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "42");
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(res).toEqual(box);
    });

    it("resolves null when no data returned", async () => {
      mockBuilder.data = null;
      mockBuilder.error = null;
      await expect(getBox("does-not-exist")).resolves.toBeNull();
    });

    it("rejects with the Supabase error", async () => {
      const err = new Error("not found");
      mockBuilder.error = err;
      await expect(getBox("x")).rejects.toThrow(err);
    });
  });

  describe("createBox", () => {
    it("resolves with the newly created box", async () => {
      const input = { name: "NewBox", owner_profile_id: "me" };
      const returned = { id: "100", ...input };
      mockBuilder.data = returned;
      mockBuilder.error = null;

      const res = await createBox(input);
      expect(supabase.from).toHaveBeenCalledWith("boxes");
      expect(mockBuilder.insert).toHaveBeenCalledWith(input);
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(res).toEqual(returned);
    });

    it("rejects with the Supabase error", async () => {
      const err = new Error("insert failed");
      mockBuilder.error = err;
      await expect(createBox({})).rejects.toThrow(err);
    });
  });

  describe("updateBox", () => {
    it("resolves with the updated box", async () => {
      const updates = { name: "Updated!" };
      const returned = { id: "77", ...updates };
      mockBuilder.data = returned;
      mockBuilder.error = null;

      const res = await updateBox("77", updates);
      expect(supabase.from).toHaveBeenCalledWith("boxes");
      expect(mockBuilder.update).toHaveBeenCalledWith(updates);
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "77");
      expect(mockBuilder.select).toHaveBeenCalledWith("*");
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(res).toEqual(returned);
    });

    it("rejects with the Supabase error", async () => {
      const err = new Error("update fail");
      mockBuilder.error = err;
      await expect(updateBox("77", {})).rejects.toThrow(err);
    });
  });

  describe("deleteBox", () => {
    it("resolves void when delete succeeds", async () => {
      mockBuilder.error = null;
      await expect(deleteBox("55")).resolves.toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith("boxes");
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith("id", "55");
    });

    it("rejects with the Supabase error", async () => {
      const err = new Error("delete fail");
      mockBuilder.error = err;
      await expect(deleteBox("55")).rejects.toThrow(err);
    });
  });
});
