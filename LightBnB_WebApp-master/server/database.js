// SEE ORIGINAL FUNCTIONS HERE: https://github.com/lighthouse-labs/LightBnB_WebApp/blob/master/server/database.js

const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const { paramsHaveRequestBody } = require('request/lib/helpers');
const query = require('express/lib/middleware/query');

// Using a Pool instead of Client is the preferred way to query with node-postgres. A Pool will manage multiple client connections for us which we don't really need to worry about right now. Just know that either could be used, but Pool is preferred.

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect();

// -------------------------------------------------------------------------------------------

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// Accepts an email address and will return a promise.
// The promise should resolve with a user object with the given email address, or null if that user does not exist.

const getUserWithEmail = function(email) {
  return pool
    .query(`
    SELECT * FROM users
    WHERE email = $1
  `, [email])
    .then(res =>
      res.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  return pool
    .query(`
    SELECT * FROM users
    WHERE id = $1
  `, [id])
    .then(res =>
      res.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

//  Accepts a user object that will have a name, email, and password property
//  This function should insert the new user into the database.
//  https://www.w3schools.com/sql/sql_insert.asp
//  It will return a promise that resolves with the new user object. This object should contain the user's id after it's been added to the database.
//  Add RETURNING *; to the end of an INSERT query to return the objects that were inserted. This is handy when you need the auto generated id of an object you've just added to the database.

const addUser =  function(user) {
  return pool
    .query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [user.name, user.email, user.password])
    .then(res =>
      res.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

// -------------------------------------------------------------------------------------------

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
    SELECT properties.*, reservations.*, avg(property_reviews.rating) as average_rating
    FROM reservations
      JOIN properties ON reservations.property_id = properties.id
      JOIN property_reviews ON reservations.property_id = property_reviews.property_id
      WHERE reservations.guest_id = $1 AND
      end_date > now()
    GROUP BY reservations.id, properties.id
    ORDER BY start_date
    LIMIT $2;
  `, [guest_id, limit])
    .then(res =>
      res.rows)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

// -------------------------------------------------------------------------------------------

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {
  
  const queryParams = [];
  
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  // if an owner_id is passed in, only return properties belonging to that owner
  // doesn't work for search - needed for 'My Listings'
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    if (queryParams.length <= 1) {
      queryString += `WHERE properties.owner_id = $${queryParams.length}`;
    } else {
      queryString += `AND properties.owner_id = $${queryParams.length}`;
    }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}00`);   // database stores amounts in cents, not dollars (see 00)
    if (queryParams.length <= 1) {
      queryString += `WHERE properties.cost_per_night >= $${queryParams.length}`;
    } else {
      queryString += `AND properties.cost_per_night >= $${queryParams.length}`;
    }
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}00`);
    if (queryParams.length <= 1) {
      queryString += `WHERE properties.cost_per_night <= $${queryParams.length}`;
    } else {
      queryString += `AND properties.cost_per_night <= $${queryParams.length}`;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    if (queryParams.length <= 1) {
      queryString += `WHERE property_reviews.rating >= $${queryParams.length}`;
    } else {
      queryString += `AND property_reviews.rating >= $${queryParams.length}`;
    }
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;

// -------------------------------------------------------------------------------------------

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */

const addProperty = function(property) {
  return pool
    .query(`
  INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
`, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
    .then(res =>
      res.rows[0])
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;
