import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors.js"; 

describe("models/authorization", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can()
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures"
      }
      expect(() => {
        authorization.can(createdUser)
      }).toThrow(InternalServerError);
    });

    test("without unknow `features`", () => {
      const createdUser = {
        features: []
      }
      expect(() => {
        authorization.can(createdUser, "unknow:features")
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and know `feature`", () => {
      const createdUser = {
        features: ["create:user"]
      }
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput()
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures"
      }
      expect(() => {
        authorization.filterOutput(createdUser)
      }).toThrow(InternalServerError);
    });

    test("without unknow `features`", () => {
      const createdUser = {
        features: []
      }
      expect(() => {
        authorization.filterOutput(createdUser, "unknow:features")
      }).toThrow(InternalServerError);
    });

    test("without valid `user`, know `features` but no `resource`", () => {
      const createdUser = {
        features: ["read:user"]
      }
      expect(() => {
        authorization.filterOutput(createdUser, "read:user")
      }).toThrow(InternalServerError);
    });

    test("with valid `user`, know `feature` and `resource`", () => {
      const createdUser = {
        features: ["read:user"]
      }

      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-010T00:00:00:00Z",
        updated_at: "2026-010T00:00:00:00Z",
        email: "resource@example.com",
        password: "resource"
      }

      const results = authorization.filterOutput(createdUser, "read:user", resource);

      expect(results).toEqual({
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-010T00:00:00:00Z",
        updated_at: "2026-010T00:00:00:00Z",
      });
    });
  });
});