const productsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const User = require("../models/user");

productsRouter.get("/", async (request, response) => {
	const products = await Product.find({});
	response.json(products.map(blog => blog.toJSON()));
});

productsRouter.post("/", async (request, response) => {
	const { body } = request;

	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	// Check for valid token
	if (!request.token || !decodedToken || !decodedToken.id) {
		return response.status(401).json({ error: "Token missing or invalid" });
	}

	const user = await User.findById(decodedToken.id);

	if (!user) {
		return response.status(404).json({ error: "User not found." });
	}

	const product = new Product({
		name: body.name,
		category: body.category,
		price: body.price,
		quantity: body.quantity,
	});

	// Check if user trying to add product has admin role.
	if (user.role.toLowerCase() === "admin") {
		const savedProduct = await product.save();
		response.status(201).json(savedProduct.toJSON());
	} else {
		response
			.status(401)
			.json({ error: "You are not authorized to add products." });
	}
});

productsRouter.get("/:id", async (request, response) => {
	const { id } = request.params;
	const product = await Product.findById(id);

	if (product) {
		response.json(product.toJSON());
	} else {
		response.status(404).end();
	}
});

productsRouter.delete("/:id", async (request, response) => {
	const { id } = request.params;

	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	// Check for valid token
	if (!request.token || !decodedToken || !decodedToken.id) {
		return response.status(401).json({ error: "Token missing or invalid." });
	}

	const user = await User.findById(decodedToken.id);

	if (!user) {
		return response.status(404).json({ error: "User not found." });
	}

	// Check if user trying to delete it has admin role.
	if (user.role.toLowerCase() === "admin") {
		await Product.findByIdAndRemove(id);
		response.status(204).end();
	} else {
		response
			.status(401)
			.json({ error: "You are not authorized to remove products." });
	}
});

productsRouter.put("/:id", async (request, response) => {
	const { body } = request;
	const { id } = request.params;

	const product = {
		quantity: body.quantity,
	};

	const updatedProduct = await Product.findByIdAndUpdate(id, product, {
		new: true,
	});

	if (updatedProduct) {
		response.status(200).json(updatedProduct.toJSON());
	} else {
		response.status(404).end();
	}
});

module.exports = productsRouter;
