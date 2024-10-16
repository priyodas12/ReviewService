const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');
const { faker } = require('@faker-js/faker');
let dateGenerator = require('random-date-generator');
class Product {
	static products = [];

	static productIndex = 1;

	constructor(client) {
		this.client = client;
	}

	async addProducts(id, name, desc) {
		const productUUID = uuidv4();

		console.log('addProducts', productUUID);

		const productName = faker.food.dish() + '' + name;

		const productDesc = faker.food.ingredient() + '' + desc;

		const productId = id;

		const productCreateDate = Product.randomDate(
			new Date(2020, 2, 3),
			new Date(2024, 2, 3),
		);

		const isAvailableNow = Product.randomBooleanValue();

		const productPrice = Product.randomDeciamlValue();

		console.log(
			'addProducts',
			productId,
			productUUID,
			productName,
			productDesc,
		);
		const query =
			'INSERT INTO products (product_id,product_uuid,product_name,product_description,product_create_date,is_available_now,price) VALUES (?,?,?,?,?,?,?)';

		const savedProduct = await this.client.execute(
			query,
			[
				productId,
				productUUID,
				productName,
				productDesc,
				productCreateDate,
				isAvailableNow,
				productPrice,
			],
			{ prepare: true },
		);

		return {
			productId,
			productUUID,
			productName,
			productDesc,
			productCreateDate,
			isAvailableNow,
			productPrice,
		};
	}

	async findbyProductName(productName) {
		const query =
			'SELECT * FROM review_service.products WHERE product_name=?';
		const result = await this.client.execute(query, [productName], {
			prepare: true,
		});

		const reviewFetched = result.rows[0];

		const reformattedProduct = {
			newlyCreatedProductId: reviewFetched.product_id,
			productUUID: reviewFetched.product_uuid,
			productName: reviewFetched.product_name,
			productDesc: reviewFetched.product_desc,
			productCreateDate: reviewFetched.product_create_date,
			isAvailableNow: reviewFetched.is_available_now,
			productPrice: reviewFetched.price,
		};
		return reformattedProduct;
	}

	async doesProductNameExists(productName) {
		const query =
			'COUNT(*) FROM review_service.products WHERE product_name=?';
		const result = await this.client.execute(query, [productName], {
			prepare: true,
		});
		console.log(result.data);
		return result.rows[0];
	}

	async findbyProductId(productId) {
		const query =
			'SELECT * FROM review_service.products WHERE product_id=?';
		const result = await this.client.execute(query, [productId], {
			prepare: true,
		});
		console.log(result.rows);

		const productFetched = result.rows[0];

		const reformattedProduct = {
			productId: productFetched.product_id,
			productUUID: productFetched.product_uuid,
			productName: productFetched.product_name,
			productDesc: productFetched.product_description,
			productCreateDate: productFetched.product_create_date,
			isAvailableNow: productFetched.is_available_now,
			productPrice: productFetched.price,
		};
		return reformattedProduct;
	}

	async getEveryProducts() {
		const query = 'SELECT * FROM review_service.products';
		const result = await this.client.execute(query, { prepare: true });

		return result.rows.map((productFetched) => {
			const reformattedProduct = {
				productId: productFetched.product_id,
				productUUID: productFetched.product_uuid,
				productName: productFetched.product_name,
				productDesc: productFetched.product_description,
				productCreateDate: productFetched.product_create_date,
				isAvailableNow: productFetched.is_available_now,
				productPrice: productFetched.price,
			};
			return reformattedProduct;
		});
	}

	static randomDate = (start, end) => {
		return dateGenerator.getRandomDateInRange(start, end);
	};

	static randomBooleanValue = () => {
		return Math.random() >= 0.5;
	};

	static randomDeciamlValue = () => {
		return Math.random() * 100000;
	};
}

module.exports = Product;
