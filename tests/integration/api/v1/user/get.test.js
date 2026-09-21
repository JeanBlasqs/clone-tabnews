import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator.js";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidationSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");

      expect(cacheControl).toBe("no-store, max-age=0, must-revalidate");

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UserWithValidationSession",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //Session renew assertions
      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      //Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session'", async () => {
      const nonexistentToken =
        "26131472c96eccc6ee52c867b26c5df09322965c0667fadfb6a459f8cfa598de5e0a7e55088ee290aa3513a1e2fe70de";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnathourizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se o usuário está logado e tente novamente",
        status_code: 401,
      });
    });

    test("With expired session'", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnathourizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se o usuário está logado e tente novamente",
        status_code: 401,
      });
    });

    test("With almost expired session'", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS + 10000),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithAlmostExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
    });
  });
});
