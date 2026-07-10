class ValidationError extends Error {
  contructor (message){
    super(message);
    this.statusCode = 400;
  }
}

function salvarUsuario(input) {
  if (!input) {
    throw new ReferenceError("É necessário enviar um input.");
  }

  if (!input.name) {
    throw new ValidationError("Preencha seu nome");
  }

  user.save(input);
}

try {
  salvarUsuario();
} catch (error) {
  if (error instanceof ReferenceError) {
    console.log(error);
    throw error;
  }
  if (error instanceof ValidationError) {
    console.log(error);
    return;
  }
  console.log("erro desconhecido");
  console.log(error.stack);
}
