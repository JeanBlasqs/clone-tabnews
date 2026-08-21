import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match'", async () => {
      await orchestrator.createUser({
        username: "MesmoCase",
        email: "mesmo.case@blasques.com",
        password: "senha123",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/MesmoCase",
      );

      const response2Body = await response2.json();

      console.log(response2.status);
      console.log(response2Body);

      expect(response2.status).toBe(200);

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "MesmoCase",
        email: "mesmo.case@blasques.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test("With case missmatch'", async () => {
      await orchestrator.createUser({
        username: "CaseDiferente",
        email: "case.diferente@blasques.com",
        password: "senha123",
      });
      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casediferente",
      );

      const response2Body = await response2.json();

      console.log(response2.status);
      console.log(response2Body);

      expect(response2.status).toBe(200);

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseDiferente",
        email: "case.diferente@blasques.com",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBeNaN();
      expect(Date.parse(response2Body.updated_at)).not.toBeNaN();
    });
    test("With nonexistent username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );

      const responseBody = await response.json();

      expect(response.status).toBe(404);

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O usuário não foi encontrado no sistema",
        action: "Verifique o username se foi digitado corretamente",
        status_code: 404,
      });
    });
  });
});
