const { faker } = require('@faker-js/faker');
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');

class Review {
	constructor(client) {
		this.client = client;
	}

	async addReview(productId, reviewDetails) {
		console.log('addReview');

		const review = faker.food.description() + ',' + reviewDetails;

		const id = faker.number.int();

		const uuid = uuidv4();

		const query =
			'INSERT INTO review_service.reviews (review_id,review_uuid,product_id,review_details) VALUES (?,?,?,?)';

		const savedProduct = await this.client.execute(
			query,
			[id, uuid, productId, review],
			{ prepare: true },
		);

		return { id, uuid, productId, review };
	}

	async findbyReviewId(productId) {
		const query = 'SELECT * FROM review_service.reviews WHERE review_id=?';
		const result = await this.client.execute(query, [productId], {
			prepare: true,
		});
		console.log(result.rows);
		return result.rows[0];
	}

	async getEveryReviews() {
		const query = 'SELECT * FROM review_service.reviews';
		const result = await this.client.execute(query, { prepare: true });

		return result.rows;
	}
}
module.exports = Review;
