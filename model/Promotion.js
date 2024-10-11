const { faker } = require('@faker-js/faker');
const cassandra = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');
const Product = require('./product');

class Promotion {
	constructor(client) {
		this.client = client;
	}

	async addPromotion(productId, promotionDetails) {
		const promotionDetailsEnhanced =
			faker.commerce.productDescription() + ',' + promotionDetails;

		const promotionId = faker.number.int();

		const promotionUUID = uuidv4();

		const promotionCreateTimestamp = Product.randomDate(
			new Date(2020, 2, 3),
			new Date(2024, 2, 3),
		);

		const promotionRating = this.randomRating();

		const query =
			'INSERT INTO review_service.promotions' +
			' (promotion_id, promotion_uuid, product_id, promotion_details,promotion_create_timestamp,promotion_rating ) ' +
			'VALUES(?,?,?,?,?,?)';

		const savedPromotion = await this.client.execute(
			query,
			[
				promotionId,
				promotionUUID,
				productId,
				promotionDetailsEnhanced,
				promotionCreateTimestamp,
				promotionRating,
			],
			{ prepare: true },
		);

		return {
			promotionId,
			promotionUUID,
			productId,
			promotionDetailsEnhanced,
			promotionCreateTimestamp,
			promotionRating,
		};
	}

	async findbyPromotionId(promotionId) {
		const query =
			'SELECT * FROM review_service.promotions WHERE promotion_id=?';
		const result = await this.client.execute(query, [promotionId], {
			prepare: true,
		});
		console.log(result.rows);
		//return result.rows[ 0 ];

		const promotionFetched = result.rows[0];

		const reformattedPromotion = {
			promotionId: promotionFetched.promotion_id,
			promotionUUID: promotionFetched.promotion_uuid,
			productId: promotionFetched.product_id,
			promotionDetails: promotionFetched.promotion_details,
			promotionCreateTimestamp:
				promotionFetched.promotion_create_timestamp,
			promotionRating: promotionFetched.promotion_rating,
		};
		return reformattedPromotion;
	}

	async getEveryPromotions() {
		const query = 'SELECT * FROM review_service.promotions';
		const result = await this.client.execute(query, { prepare: true });

		return result.rows.map((promotionFetched) => {
			const reformattedPromotion = {
				promotionId: promotionFetched.promotion_id,
				promotionUUID: promotionFetched.promotion_uuid,
				productId: promotionFetched.product_id,
				promotionDetails: promotionFetched.promotion_details,
				promotionCreateTimestamp:
					promotionFetched.promotion_create_timestamp,
				promotionRating: promotionFetched.promotion_rating,
			};
			return promotionFetched;
		});
	}

	randomRating = () => {
		const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	};
}
module.exports = Promotion;
