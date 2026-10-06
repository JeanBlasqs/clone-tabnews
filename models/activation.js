import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import { NotFoundError } from "infra/errors";
import user from "models/user.js";

const EXPIRATION_IN_MILISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function findOneValidById(tokenId) {
  const newToken = await runInsertQuery(tokenId);
  return newToken;

  async function runInsertQuery(tokenId) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT
          1
      ;`,
      values: [tokenId],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O token de ativação não foi encontrado ou expirou",
        action: "Faça um novo cadastro",
      });
    }

    return results.rows[0];
  }
}
async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Finews <contato@finews.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no Finews!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro
${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente
Equipe Finews
`,
  });
}

async function markTokenAsUsed(activationTokenId) {
  const results = await database.query({
    text: `
      UPDATE
          user_activation_tokens
      SET
        used_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        * 
    `,
    values: [activationTokenId],
  });

  return results.rows[0];
}
async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
