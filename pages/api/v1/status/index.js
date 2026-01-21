function status(request, response) {
  response.status(200).json({ chave: "amo a suelen" });
}

export default status;
