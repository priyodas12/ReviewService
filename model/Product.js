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

	async addProducts(name, desc) {
		console.log('addProducts');

		const uuid = uuidv4();

		console.log('addProducts', uuid);

		const name1 = faker.food.dish() + '' + name;

		const desc1 = faker.food.ingredient() + '' + desc;

		const newlyCreatedProductId = faker.number.int();

		const availableFromDate = Product.randomDate(
			new Date(2020, 2, 3),
			new Date(2024, 2, 3),
		);

		const isAvailableNow = Product.randomBooleanValue();

		const price = Product.randomDeciamlValue();

		console.log('addProducts', newlyCreatedProductId, uuid, name1, desc1);
		const query =
			'INSERT INTO products (product_id,product_uuid,product_name,product_description,available_creation_date,is_available_now,price) VALUES (?,?,?,?,?,?,?)';

		const savedProduct = await this.client.execute(
			query,
			[
				newlyCreatedProductId,
				uuid,
				name1,
				desc1,
				availableFromDate,
				isAvailableNow,
				price,
			],
			{ prepare: true },
		);

		console.log('After saving product', savedProduct);

		return newlyCreatedProductId;
	}

	async findbyProductName(productName) {
		const query =
			'SELECT * FROM review_service.products WHERE product_name=?';
		const result = await this.client.execute(query, [productName], {
			prepare: true,
		});

		return result.rows[0];
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
		return result.rows[0];
	}

	async getEveryProducts() {
		const query = 'SELECT * FROM review_service.products';
		const result = await this.client.execute(query, { prepare: true });

		return result.rows;
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
