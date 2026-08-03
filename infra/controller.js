import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "infra/errors.js";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response
    .status(publicErrorObject.status_code)
    .json(publicErrorObject.toJson());
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.status_code).json(error.toJson());
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });
  console.error(publicErrorObject);

  response
    .status(publicErrorObject.status_code)
    .json(publicErrorObject.toJson());
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};
export default controller;
