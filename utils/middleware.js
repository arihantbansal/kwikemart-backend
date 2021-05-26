const logger = require("./logger");

const requestLogger = (request, response, next) => {
	// Custom request logging middleware
	logger.info("Method:", request.method);
	logger.info("Path:  ", request.path);
	logger.info("Body:  ", request.body);
	logger.info("---");
	next();

	// OR, using morgan
	// morgan.token("body", (request, response) => JSON.stringify(request.body));
	// app.use(
	// 	morgan(
	// 		":method :url :status :res[content-length] - :response-time ms :body"
	// 	)
	// );
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
	logger.error(error.message);

	if (error.name === "CastError" && error.message.includes("ObjectId")) {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	} else if (error.name === "JsonWebTokenError") {
		return response.status(401).json({
			error: "invalid token",
		});
	}

	next(error);
};

const tokenExtractor = (request, response, next) => {
	const authorization = request.get("authorization");
	if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
		request.token = authorization.substring(7);
	} else {
		request.token = null;
	}

	next();
	return request.token;
};

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
};
