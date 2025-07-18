// tests/collaborators.test.js
jest.mock("../supabase/client", () => ({
  supabase: { from: jest.fn() },
}));

const { supabase } = require("../supabase/client");
const {
  getCollaborators,
  addCollaborator,
  removeCollaborator,
} = require("../supabase/queries/collaborators");

const VALID_UUID = "00000000-0000-0000-0000-000000000000";

describe("collaborators queries", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getCollaborators", () => {
    it("returns parsed collaborators on success", async () => {
      const mockData = [
        {
          box_id: VALID_UUID,
          collaborator_profile_id: VALID_UUID,
          role: "viewer",
        },
      ];

      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await getCollaborators(VALID_UUID);

      expect(supabase.from).toHaveBeenCalledWith("box_collaborators");
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.eq).toHaveBeenCalledWith("box_id", VALID_UUID);
      expect(result).toEqual(mockData);
    });

    it("throws if Supabase returns an error", async () => {
      const mockErr = new Error("fetch failed");
      const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ data: null, error: mockErr }),
      };
      supabase.from.mockReturnValue(query);

      await expect(getCollaborators(VALID_UUID)).rejects.toThrow(
        "fetch failed",
      );
    });
  });

  describe("addCollaborator", () => {
    it("inserts and returns the new collaborator", async () => {
      const mockData = {
        box_id: VALID_UUID,
        collaborator_profile_id: VALID_UUID,
        role: "admin",
      };
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ data: mockData, error: null }),
      };
      supabase.from.mockReturnValue(query);

      const result = await addCollaborator(VALID_UUID, VALID_UUID, "admin");

      expect(supabase.from).toHaveBeenCalledWith("box_collaborators");
      expect(query.insert).toHaveBeenCalledWith({
        box_id: VALID_UUID,
        collaborator_profile_id: VALID_UUID,
        role: "admin",
      });
      expect(query.select).toHaveBeenCalledWith("*");
      expect(query.single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("throws if insert returns an error", async () => {
      const mockErr = new Error("insert failed");
      const query = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ data: null, error: mockErr }),
      };
      supabase.from.mockReturnValue(query);

      await expect(addCollaborator(VALID_UUID, VALID_UUID)).rejects.toThrow(
        "insert failed",
      );
    });
  });

  describe("removeCollaborator", () => {
    it("deletes the collaborator on success", async () => {
      const query = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ error: null }),
      };
      supabase.from.mockReturnValue(query);

      await expect(
        removeCollaborator(VALID_UUID, VALID_UUID),
      ).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith("box_collaborators");
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith("box_id", VALID_UUID);
      expect(query.eq).toHaveBeenCalledWith(
        "collaborator_profile_id",
        VALID_UUID,
      );
    });

    it("throws if delete returns an error", async () => {
      const mockErr = new Error("delete failed");
      const query = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: (resolve) => resolve({ error: mockErr }),
      };
      supabase.from.mockReturnValue(query);

      await expect(removeCollaborator(VALID_UUID, VALID_UUID)).rejects.toThrow(
        "delete failed",
      );
    });
  });
});
