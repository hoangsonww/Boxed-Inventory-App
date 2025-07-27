jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const { getProfile, upsertProfile } = require("../supabase/queries/profiles");
const { profileSchema } = require("../supabase/types");

const VALID_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TS = "2025-07-18T00:00:00.000Z";

describe("profiles queries", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getProfile", () => {
    it("returns parsed profile on success", async () => {
      const mockData = {
        id: VALID_UUID,
        full_name: "Jane Doe",
        avatar_url: null,
        created_at: TS,
      };
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getProfile(VALID_UUID);
      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.eq).toHaveBeenCalledWith("id", VALID_UUID);
      expect(query.single).toHaveBeenCalled();
      // compare against parsed schema output
      expect(result).toEqual(profileSchema.parse(mockData));
    });

    it("returns null when no data", async () => {
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getProfile("no-user");
      expect(result).toBeNull();
    });

    it("throws if Supabase returns an error", async () => {
      const err = new Error("select failed");
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (cb) => cb({ data: null, error: err }),
      };
      supabase.from.mockReturnValue(query);

      await expect(getProfile(VALID_UUID)).rejects.toThrow("select failed");
    });
  });
});
