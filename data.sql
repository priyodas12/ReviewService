CREATE KEYSPACE review_service WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE review_service;

CREATE TABLE review_service.products (
    product_id BIGINT PRIMARY KEY,    
    product_uuid UUID,
    product_name TEXT,
    product_description TEXT,
    available_creation_date TIMESTAMP,
    is_available_now BOOLEAN,
    price DECIMAL
);

CREATE TABLE review_service.reviews (
    review_id BIGINT PRIMARY KEY,   
    review_uuid UUID ,
    product_id BIGINT,
    review_rating INT,
    review_create_timestamp TIMESTAMP,
    review_details TEXT,
    review_country TEXT,
    review_update_time_stamp TIMESTAMP
);

SELECT * FROM review_service.products;

DROP TABLE review_service.products;

TRUNCATE review_service.products;

DROP TABLE review_service.reviews;

TRUNCATE review_service.reviews;

---this microservice db for more communication usage