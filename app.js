const express = require("express");
require("express-async-errors");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const flocBlock = require("floc-block");
const logger = require("./utils/logger");
const config = require("./utils/config");
const productsRouter = require("./controllers/products");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware");

mongoose
	.connect(config.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => {
		logger.info("connected to db");
	})
	.catch(err => {
		logger.error("Error connecting to db", err.message);
	});
// app.set('trust proxy', 1) // When using rate limiter
app.use(cors());
app.use(helmet());
app.use(flocBlock()); // F*ck Google 🖕🏻
app.use(express.json());
app.use(middleware.tokenExtractor);
app.use(middleware.requestLogger);

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);

// const rateLimit = require("express-rate-limit");
// const apiLimiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 100,
// });
// app.use("/api/login", apiLimiter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
