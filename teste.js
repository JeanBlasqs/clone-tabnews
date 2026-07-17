const user = {
  save(input) {
    console.log("Usuário salvo:", input);
  },
};

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status_code = 400;
  }
}

function salvarUsuario(input) {
  if (!input) {
    throw new ReferenceError("É necessário enviar um input.");
  }

  if (!input.name) {
    throw new ValidationError("Preencha seu nome.");
  }

  user.save(input);
}

try {
  salvarUsuario({ name: "João" });
} catch (error) {
  if (error instanceof ReferenceError) {
    console.log(error);
    throw error;
  }

  if (error instanceof ValidationError) {
    console.log(error);
  } else {
    console.log("Erro desconhecido");
    console.log(error.stack);
  }
}
