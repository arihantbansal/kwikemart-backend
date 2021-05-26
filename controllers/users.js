const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
	const { body } = request;

	if (!body.password || body.password === "") {
		return response.status(400).json({
			error: "Password is required",
		});
	}

	if (body.password.length < 3) {
		response.status(400).json({
			error: "Password should be at least 3 characters",
		});
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(body.password, saltRounds);

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash,
		role: body.role,
	});

	const savedUser = await user.save();

	response.json(savedUser);
});

usersRouter.get("/", async (request, response) => {
	const users = await User.find({});

	response.json(users.map(u => u.toJSON()));
});

usersRouter.delete("/:id", async (request, response) => {
	const { id } = request.params;

	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	// Check for valid token
	if (!request.token || !decodedToken || !decodedToken.id) {
		return response
			.status(401)
			.json({ error: "Token missing or invalid." });
	}

	const user = await User.findById(decodedToken.id);

	if (!user) {
		return response.status(404).json({ error: "User not found." });
	}

	// Check if user trying to delete it has admin role.
	if (user.role.toLowerCase() === "admin") {
		await User.findByIdAndRemove(id);
		response.status(204).end();
	} else {
		response
			.status(401)
			.json({ error: "You are not authorized to remove users." });
	}
});

module.exports = usersRouter;
