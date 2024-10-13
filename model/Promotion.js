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

		const promotionStartTimestamp = Product.randomDate(
			new Date(2020, 2, 3),
			new Date(2024, 2, 3),
		);

		const promotionEndTimestamp = Product.randomDate(
			promotionStartTimestamp,
			new Date(2024, 12, 12),
		);

		const promotionType = this.randomDiscoutnType();

		const discountPercentage = this.randomDiscountPercentage();

		const query =
			'INSERT INTO review_service.promotions' +
			' (promotion_id, promotion_uuid, product_id, promotion_details, promotion_start_timestamp, promotion_end_timestamp, promotion_type, discount_percentage ) ' +
			'VALUES (?,?,?,?,?,?,?,?)';

		const savedPromotion = await this.client.execute(
			query,
			[
				promotionId,
				promotionUUID,
				productId,
				promotionDetailsEnhanced,
				promotionStartTimestamp,
				promotionEndTimestamp,
				promotionType,
				discountPercentage,
			],
			{ prepare: true },
		);

		return {
			promotionId,
			promotionUUID,
			productId,
			promotionDetailsEnhanced,
			promotionStartTimestamp,
			promotionEndTimestamp,
			promotionType,
			discountPercentage,
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
			promotionStartTimestamp: promotionFetched.promotion_start_timestamp,
			promotionEndTimestamp: promotionFetched.promotion_end_timestamp,
			promotionType: promotionFetched.promotion_type,
			discountPercentage: promotionFetched.discount_percentage,
		};
		return reformattedPromotion;
	}

	async findPromotionByProductId(productId) {
		const query =
			'SELECT * FROM review_service.promotions WHERE product_id=? ALLOW FILTERING';
		const result = await this.client.execute(query, [productId], {
			prepare: true,
		});
		console.log(result.rows);
		//return result.rows[ 0 ];

		return result.rows.map((promotionFetched) => {
			const reformattedPromotion = {
				promotionId: promotionFetched.promotion_id,
				promotionUUID: promotionFetched.promotion_uuid,
				productId: promotionFetched.product_id,
				promotionDetails: promotionFetched.promotion_details,
				promotionStartTimestamp:
					promotionFetched.promotion_start_timestamp,
				promotionEndTimestamp:
					promotionFetched.promotion_end_timestamp,
				promotionType: promotionFetched.promotion_type,
				discountPercentage: promotionFetched.discount_percentage,
			};
			return reformattedPromotion;
		});
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
				promotionStartTimestamp:
					promotionFetched.promotion_start_timestamp,
				promotionEndtTimestamp:
					promotionFetched.promotion_end_timestamp,
				promotionType: promotionFetched.promotion_type,
				discountPercentage: promotionFetched.discount_percentage,
			};
			return promotionFetched;
		});
	}

	randomDiscountPercentage = () => {
		const arr = [20, 10, 25, 30, 40, 50, 60, 45, 15, 35, 5];
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	};

	randomDiscoutnType = () => {
		const arr = [
			'SUMMER',
			'WINTER',
			'CHRISTMAS',
			'DIWALI',
			'EID',
			'BBD',
			'ESTER',
			'BLACK FRIDAY',
			'CYBER MONDAY',
			'NEW YEAR',
			'YEAR END',
		];
		const randomIndex = Math.floor(Math.random() * arr.length);
		return arr[randomIndex];
	};
}
module.exports = Promotion;
