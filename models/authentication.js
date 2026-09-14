import user from "models/user.js";
import password from "models/password.js";
import { NotFoundError, UnathourizedError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnathourizedError) {
      throw new UnathourizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnathourizedError({
          message: "Email não confere.",
          action: "Verifique se o dado enviado esta correto",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnathourizedError({
        message: "Senha não confere.",
        action: "Verifique se o dado enviado esta correto",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
