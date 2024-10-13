const express = require('express');
const bodyParser = require('body-parser');
const Product = require('./model/product'); // Use require instead of import
const Review = require('./model/review'); // Use require instead of import
const cassandra = require( 'cassandra-driver' );
const { v4: uuidv4 } = require('uuid');
const Promotion = require( "./model/Promotion" );
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const client = new cassandra.Client({
	contactPoints: ['localhost:9042'],
	localDataCenter: 'datacenter1',
	keyspace: 'review_service',
});

client
	.connect()
	.then(() => console.log('Connected to Cassandra!'))
	.catch((err) => console.error('Could not connect to Cassandra', err));

const product = new Product(client);
const review = new Review( client );
const promotion = new Promotion( client );

const SUCCESS = 'Success';
const FAILURE = 'Failure';

///****************** CREATE PRODUCT ****************///

const validateProduct = (productName, productDescription) => {
	return new Promise((resolve, reject) => {
		if (!productName || !productDescription) {
			console.log('Invalid product details!');
			//return reject( new Error( "Invalid product details!" ) );
		}
		resolve({ productName, productDescription });
	});
};

const saveToCassendraDb = (p) => {
	console.log('Saving object: ', p);
	return product
		.addProducts(p.productName, p.productDescription)
		.then((createdProductInfo) => {
			return createdProductInfo;
		})
		.catch((error) => console.log(error));
};

app.post('/products', (req, res) => {
	const { productName, productDescription } = req.body;

	// Validate product details
	validateProduct(productName, productDescription)
		.then((productData) => {
			console.log('1--------------->Saving to database');
			return saveToCassendraDb(productData);
		})
		.then((createdProductInfo) => {
			console.info(
				'3----------------->Successfully saved in cassendra db',
				createdProductInfo,
			);
			return res.status(201).json({
				message: SUCCESS,
				time: new Date(),
				product: createdProductInfo,
				traceId: uuidv4(),
			});
		})
		.catch((error) => {
			console.error(
				'4------------------>Failed to save in cassendra db',
				error,
			);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** CREATE PRODUCT ****************///

///****************** FETCH PRODUCT BY ID ****************///

const fetchProductById = (productId) => {
	console.log('*******************************Fetching Product: ', productId);
	return product
		.findbyProductId(productId)
		.then((fetchedProduct) => {
			console.log('fetchedProduct', fetchedProduct);
			return fetchedProduct;
		})
		.catch((error) => console.log(error));
};

app.get('/products/:productId', (req, res) => {
	const { productId } = req.params;

	fetchProductById(productId)
		.then((fetchedProductData) => {
			console.info(
				'************************Successfully fetched in cassendra db',
			);
			return res.status(201).json({
				message: SUCCESS,
				product: fetchedProductData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH PRODUCT BY ID ****************///

///****************** FETCH ALL PRODUCTS ****************///

const fetchAllProducts = (productId) => {
	console.log('Fetching All Product: ', productId);
	return product
		.getEveryProducts()
		.then((fetchedProduct) => {
			console.log('fetchedProduct', fetchedProduct);
			return fetchedProduct;
		})
		.catch((error) => console.log(error));
};

app.get('/products', (req, res) => {
	fetchAllProducts()
		.then((fetchedProductData) => {
			console.info('Successfully fetched all products from cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				productInfo: fetchedProductData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH ALL PRODUCT ****************///

///****************** CREATE REVIEW ****************///

const validateReview = (productIdDetails, description) => {
	return new Promise((resolve, reject) => {
		if (!productIdDetails || !description) {
			console.log('Invalid Review details!');
			//return reject( new Error( "Invalid product details!" ) );
		}
		const results = fetchProductById(productIdDetails);
		console.log('fetched Products::', results);
		if (!results) {
			console.log('Invalid Review details!', results);
			return reject(new Error('Invalid product id!'));
		}

		resolve({ productIdDetails, description });
	});
};

const saveReviewToCassendraDb = (r) => {
	console.log('Saving Review: ', r);
	return review
		.addReview(r.productIdDetails, r.description)
		.then((savedReviewId) => {
			console.log('Saved Review Id:: ', savedReviewId);
			return savedReviewId;
		})
		.catch((error) => console.log(error));
};

app.post('/reviews', (req, res) => {
	const { productId, reviewDetails } = req.body;
	validateReview(productId, reviewDetails)
		.then((reviewData) => {
			console.log(
				'*********************Saving to database',
				productId,
				reviewDetails,
				reviewData,
			);
			return saveReviewToCassendraDb(reviewData);
		})
		.then((savedReviewId) => {
			console.info('Successfully saved in cassendra db', savedReviewId);
			return res.status(201).json({
				message: SUCCESS,
				traceId: uuidv4(),
				time: new Date(),
				review: savedReviewId,
			});
		})
		.catch((error) => {
			console.error('Failed to saved in cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});
///****************** CREATE REVIEW ****************///

///****************** FETCH REVIEW ****************///

const fetchReviewById = (reviewId) => {
	console.log('Fetching Review: ', reviewId);
	return review
		.findbyReviewId(reviewId)
		.then((fetchedReview) => {
			console.log('fetchedProduct', fetchedReview);
			return fetchedReview;
		})
		.catch((error) => console.log(error));
};

app.get('/reviews/:reviewId', (req, res) => {
	const { reviewId } = req.params;

	fetchReviewById(reviewId)
		.then((fetchedReviewData) => {
			console.info('Successfully fetched in cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				productInfo: fetchedReviewData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH REVIEW ****************///

///****************** FETCH REVIEW BY PRODUCT ID****************///

const fetchReviewByProductId = (productId) => {
	console.log('Fetching Review: ', productId);
	return review
		.findReviewByProductId(productId)
		.then((fetchedReview) => {
			console.log('fetchedProduct', fetchedReview);
			return fetchedReview;
		})
		.catch((error) => console.log(error));
};

app.get('/reviews/product/:productId', (req, res) => {
	const { productId } = req.params;

	fetchReviewByProductId(productId)
		.then((fetchedReviewData) => {
			console.info('Successfully fetched in cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				reviewList: fetchedReviewData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH REVIEW BY PRODUCT ID ****************///

///****************** FETCH ALL REVIEW ****************///

const fetchAllReviews = () => {
	console.log('Fetching All Review: ');
	return review
		.getEveryReviews()
		.then((fetchedReview) => {
			console.log('fetchedReview', fetchedReview);
			return fetchedReview;
		})
		.catch((error) => console.log(error));
};

app.get('/reviews', (req, res) => {
	fetchAllReviews()
		.then((fetchAllReviews) => {
			console.info('Successfully fetched all reviews from cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				productInfo: fetchAllReviews,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH ALL REVIEW ****************///

///****************** CREATE PROMOTION ****************///

const validatePromotion = (productId, description) => {
	return new Promise((resolve, reject) => {
		if (!productId || !description) {
			console.log('Invalid Promotion details!');
			//return reject( new Error( "Invalid product details!" ) );
		}
		const results = fetchProductById(productId);
		console.log('fetched Products::', results);
		if (!results) {
			console.log('Invalid Review details!', results);
			return reject(new Error('Invalid product id!'));
		}
		let id = 0;
		let desc = '';
		results.then((product) => {
			// @ts-ignore
			id = product.productId;
		});

		resolve({ productId, description });
	});
};

const savePromotionToCassendraDb = (prom) => {
	console.log('Saving Review: ', prom);
	return promotion
		.addPromotion(prom.productId, prom.description)
		.then((savedPromotionData) => {
			console.log('Saved Promotion Id:: ', savedPromotionData);
			return savedPromotionData;
		})
		.catch((error) => console.log(error));
};

app.post('/promotions', (req, res) => {
	const { productId, description } = req.body;
	validatePromotion(productId, description)
		.then((promotionData) => {
			console.log('Saving to database');
			return savePromotionToCassendraDb(promotionData);
		})
		.then((savedPromotionData) => {
			console.info(
				'Successfully saved in cassendra db',
				savedPromotionData,
			);
			return res.status(201).json({
				message: SUCCESS,
				traceId: uuidv4(),
				time: new Date(),
				promotion: savedPromotionData,
			});
		})
		.catch((error) => {
			console.error('Failed to saved in cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});
///****************** CREATE PROMOTION ****************///

///****************** FETCH PROMOTION ****************///

const fetchPromotionById = (promotionId) => {
	console.log('Fetching Promotion: ', promotionId);
	return promotion
		.findbyPromotionId(promotionId)
		.then((fetchedPromotion) => {
			console.log('fetchedPromotion', fetchedPromotion);
			return fetchedPromotion;
		})
		.catch((error) => console.log(error));
};

app.get('/promotions/:promotionId', (req, res) => {
	const { promotionId } = req.params;

	fetchPromotionById(promotionId)
		.then((fetchedPromotion) => {
			console.info('Successfully fetched in cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				promotion: fetchedPromotion,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH PROMOTION ****************///

///****************** FETCH PROMOTION BY PRODUCT ID ****************///

const fetchPromotionByProductId = (productId) => {
	console.log('Fetching Promotion: ', productId);
	return promotion
		.findPromotionByProductId(productId)
		.then((fetchedPromotion) => {
			console.log('fetchedPromotion', fetchedPromotion);
			return fetchedPromotion;
		})
		.catch((error) => console.log(error));
};

app.get('/promotions/product/:productId', (req, res) => {
	const { productId } = req.params;

	fetchPromotionByProductId(productId)
		.then((fetchedPromotion) => {
			console.info('Successfully fetched from cassendra db');
			return res.status(201).json({
				message: SUCCESS,
				promotionList: fetchedPromotion,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH PROMOTION BY PRODUCT ID ****************///

///****************** FETCH ALL PROMOTION ****************///

const fetchAllPromotions = () => {
	console.log('Fetching All Promotions: ');
	return promotion
		.getEveryPromotions()
		.then((fetchedPromotions) => {
			console.log('fetchedPromotions', fetchedPromotions);
			return fetchedPromotions;
		})
		.catch((error) => console.log(error));
};

app.get('/promotions', (req, res) => {
	fetchAllPromotions()
		.then((allFetchedPromotions) => {
			console.info(
				'Successfully fetched all Promotions from cassendra db',
			);
			return res.status(201).json({
				message: SUCCESS,
				promotionList: allFetchedPromotions,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: FAILURE,
			});
		});
});

///****************** FETCH ALL PROMOTION ****************///



