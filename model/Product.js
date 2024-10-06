const { v4: uuidv4 } = require('uuid');
const cassandra = require('cassandra-driver');
const { faker } = require('@faker-js/faker');

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

		const id = faker.number.int();

		console.log('addProducts', id, uuid, name1, desc1);
		const query =
			'INSERT INTO products (product_id,product_uuid,product_name,product_description) VALUES (?,?,?,?)';

		const savedProduct = await this.client.execute(
			query,
			[id, uuid, name1, desc1],
			{ prepare: true },
		);

		const { productId, productUUID, productName, productDescription } =
			savedProduct;

		return { productId, productUUID, productName, productDescription };
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
}

module.exports = Product;
