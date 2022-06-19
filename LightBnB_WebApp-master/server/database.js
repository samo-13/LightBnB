// SEE ORIGINAL FUNCTIONS HERE: https://github.com/lighthouse-labs/LightBnB_WebApp/blob/master/server/database.js

const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

// Using a Pool instead of Client is the preferred way to query with node-postgres. A Pool will manage multiple client connections for us which we don't really need to worry about right now. Just know that either could be used, but Pool is preferred.

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect();
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

// -------------------------------------------------------------------------------------------

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

// -------------------------------------------------------------------------------------------
// REFERENCE CODE FROM BOOTCAMPX
// pool.query(query, values)
// .then(res => {
//   res.rows.forEach(user => {
//     console.log(`${user.name} has an id of ${user.student_id} and was in the ${user.cohort} cohort`);
//   })
// }).catch(err => console.error('query error', err.stack));
// -------------------------------------------------------------------------------------------

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

// Same as getUserWithEmail

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

// INSERT INTO table_name (column1, column2, column3, ...)
// VALUES (value1, value2, value3, ...);

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

const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
      queryString += `AND properties.owner_id = $${queryParams.length}`
    }

  // if (options.minimum_price_per_night)

  // if (options.maximum_price_per_night)

  // if (options.minimum_rating)



  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
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
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
