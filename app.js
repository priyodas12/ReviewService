const express = require('express');
const bodyParser = require('body-parser');
const Product = require('./model/product'); // Use require instead of import
const Review = require('./model/review'); // Use require instead of import
const cassandra = require( 'cassandra-driver' );

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const client = new cassandra.Client({
	contactPoints: ['localhost:9042'], // Replace with your Cassandra contact points
    localDataCenter:'datacenter1',
    keyspace:    'review_service', // Replace with your local data center
} );

client
	.connect()
	.then(() => console.log('Connected to Cassandra!'))
	.catch((err) => console.error('Could not connect to Cassandra', err));

const product = new Product(client);
const review = new Review(client);

///****************** CREATE PRODUCT ****************///

const validateProduct = ( productName, productDescription ) =>
{
    return new Promise( ( resolve, reject ) =>
    { 
        if ( !productName || !productDescription )
        { 
            console.log('Invalid product details!');
            //return reject( new Error( "Invalid product details!" ) );
        }
        resolve( { productName, productDescription } );
    } )
};


const saveToCassendraDb = ( p ) =>
{ 
    console.log("Saving object: ",p);
    product.addProducts( p.productName, p.productDescription )
        .then( ( savedProduct ) =>
        {
            console.log("Saved Product:: ",savedProduct);
            return savedProduct
        } )
        .catch( ( error ) => console.log( error ) );
}


app.post(
	'/products',
    ( req, res ) =>
    { 
        const { productName, productDescription } = req.body;
        validateProduct(productName, productDescription)
            .then( ( productData ) =>
            {
                console.log("Saving to database");
				saveToCassendraDb(productData);
			})
            .then( ( savedProductData ) =>
            {
                console.info('Successfully saved in cassendra db',saveToCassendraDb);
                return res.status( 201 )
                    .json( {message: "Product Created Successfully!",productInfo: savedProductData} )
            })
            .catch( ( error ) =>
            { 
                console.error( "Failed to saved in cassendra db", error )
                return res.status(500).json({
					message: 'Failed to saved in cassendra db',
				});
            }
            );
        
        
    }
);
///****************** CREATE PRODUCT ****************///

///****************** FETCH PRODUCT ****************///

const fetchProductById = (productId) => {
	console.log('Fetching Product: ', productId);
	return product
		.findbyProductId(productId)
        .then( ( fetchedProduct ) =>
        {
            console.log('fetchedProduct', fetchedProduct);
			return fetchedProduct;
		})
		.catch((error) => console.log(error));
};

app.get('/products/:productId', (req, res) => {
    
    const { productId } = req.params;

    fetchProductById(productId)
		.then((fetchedProductData) => {
			console.info('Successfully fetched in cassendra db');
			return res.status(201).json({
				message: 'Product Fetched Successfully!',
				productInfo: fetchedProductData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: 'Failed to fetch from cassendra db',
			});
		});
    
});

///****************** FETCH PRODUCT ****************///

///****************** FETCH ALL PRODUCTS ****************///

const fetchAllProducts = (productId) => {
	console.log('Fetching All Product: ', productId);
	return product
		.getEveryProducts()
        .then( ( fetchedProduct ) =>
        {
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
				message: 'Product all products from Successfully!',
				productInfo: fetchedProductData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: 'Failed to fetch from cassendra db',
			});
		});
    
});

///****************** FETCH ALL PRODUCT ****************///


///****************** CREATE REVIEW ****************///

const validateReview = ( productId, description ) =>
{
    return new Promise( ( resolve, reject ) =>
    { 
        if (!productId || !description) {
			console.log('Invalid Review details!');
			//return reject( new Error( "Invalid product details!" ) );
        }
        const results = fetchProductById( productId );
        console.log('fetched Products::', results);
        if (!results) {
			console.log('Invalid Review details!',results);
			return reject( new Error( "Invalid product id!" ) );
        }
        let id = 0;
        let desc = '';
        results.then( ( product ) =>
        { 
            id = product.productId;
        }
        )

        resolve( { productId, description } );
    } )
};


const saveReviewToCassendraDb = ( r ) =>
{ 
    console.log("Saving Review: ",r);
    review.addReview( r.productId, r.description )
        .then( ( savedReview ) =>
        {
            console.log('Saved Review:: ', savedReview);
            return savedReview;
        } )
        .catch( ( error ) => console.log( error ) );
}


app.post(
	'/reviews',
    ( req, res ) =>
    { 
        const { productId, description } = req.body;
        validateReview(productId, description)
			.then((reviewData) => {
				console.log('Saving to database');
				saveReviewToCassendraDb(reviewData);
			})
			.then((savedReview) => {
				console.info('Successfully saved in cassendra db', savedReview);
				return res.status(201).json({
					message: 'Review Created Successfully!',
					review: savedReview,
				});
			})
			.catch((error) => {
				console.error('Failed to saved in cassendra db', error);
				return res.status(500).json({
					message: 'Failed to saved in cassendra db',
				});
			});
        
        
    }
);
///****************** CREATE PRODUCT ****************///

///****************** FETCH REVIEW ****************///

const fetchReviewById = (reviewId) => {
	console.log('Fetching Review: ', reviewId);
	return review
		.findbyReviewId(reviewId)
		.then((fetchedProduct) => {
			console.log('fetchedProduct', fetchedProduct);
			return fetchedProduct;
		})
		.catch((error) => console.log(error));
};

app.get('/products/:reviewId', (req, res) => {
	const { reviewId } = req.params;

	fetchReviewById(reviewId)
		.then((fetchedReviewData) => {
			console.info('Successfully fetched in cassendra db');
			return res.status(201).json({
				message: 'Review Fetched Successfully!',
				productInfo: fetchedReviewData,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: 'Failed to fetch from cassendra db',
			});
		});
});

///****************** FETCH REVIEW ****************///

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
				message: 'Product all reviews from Successfully!',
				productInfo: fetchAllReviews,
			});
		})
		.catch((error) => {
			console.error('Failed to fetch from cassendra db', error);
			return res.status(500).json({
				message: 'Failed to fetch from cassendra db',
			});
		});
    
});

///****************** FETCH ALL PRODUCT ****************///


