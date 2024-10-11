const { faker } = require('@faker-js/faker');
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');
const Product = require('./product');

class Review {
	constructor(client) {
		this.client = client;
	}

	async addReview(productId, reviewDetailsInfo) {
		const reviewDetails =
			faker.food.description() + ',' + reviewDetailsInfo;

		const reviewId = faker.number.int();

		const reviewUUID = uuidv4();

		const reviewCreateTimestamp = Product.randomDate(
			new Date(2020, 2, 3),
			new Date(2024, 2, 3),
		);

		const reviewUpdateTimestamp = Product.randomDate(
			reviewCreateTimestamp,
			new Date(2024, 12, 12),
		);

		const reviewCountry = this.randomCountry();

		const reviewRating = this.randomRating();

		const query =
			'INSERT INTO review_service.reviews' +
			' (review_id, review_uuid, product_id, review_details,review_create_timestamp,review_rating,review_country,review_update_time_stamp ) ' +
			'VALUES(?,?,?,?,?,?,?,?)';

		const savedReview = await this.client.execute(
			query,
			[
				reviewId,
				reviewUUID,
				productId,
				reviewDetails,
				reviewCreateTimestamp,
				reviewRating,
				reviewCountry,
				reviewUpdateTimestamp,
			],
			{ prepare: true },
		);

		return {
			reviewId,
			reviewUUID,
			productId,
			reviewDetails,
			reviewCreateTimestamp,
			reviewRating,
			reviewCountry,
			reviewUpdateTimestamp,
		};
	}

	async findbyReviewId(productId) {
		const query = 'SELECT * FROM review_service.reviews WHERE review_id=?';
		const result = await this.client.execute(query, [productId], {
			prepare: true,
		});
		console.log(result.rows);

		const reviewFetched = result.rows[0];

		const reformattedReview = {
			reviewId: reviewFetched.review_id,
			reviewUUID: reviewFetched.review_uuid,
			productId: reviewFetched.product_id,
			reviewDetails: reviewFetched.review_details,
			reviewCreateTimestamp: reviewFetched.review_create_timestamp,
			reviewRating: reviewFetched.review_rating,
			reviewCountry: reviewFetched.review_country,
			reviewUpdateTimestamp: reviewFetched.review_update_time_stamp,
		};
		return reformattedReview;
	}

	async getEveryReviews() {
		const query = 'SELECT * FROM review_service.reviews';
		const result = await this.client.execute(query, { prepare: true });

		return result.rows.map((reviewFetched) => {
			const reformattedReview = {
				reviewId: reviewFetched.review_id,
				reviewUUID: reviewFetched.review_uuid,
				productId: reviewFetched.product_id,
				reviewDetails: reviewFetched.review_details,
				reviewCreateTimestamp: reviewFetched.review_create_timestamp,
				reviewRating: reviewFetched.review_rating,
				reviewCountry: reviewFetched.review_country,
				reviewUpdateTimestamp: reviewFetched.review_update_time_stamp,
			};
			return reformattedReview;
		});
	}

	randomRating = () => {
		const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	};

	randomCountry = () => {
		const arr = [
			'IN',
			'CH',
			'GB',
			'NL',
			'US',
			'IS',
			'IR',
			'RU',
			'UC',
			'UEA',
			'JP',
		];
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	};
}
module.exports = Review;
