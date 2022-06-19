# LightBnB

Lighthouse BnB is an app that will revolutionize the travel industry. It allows homeowners to rent out their homes to people on vacation, creating an alternative to hotels and bed and breakfasts...There’s nothing else like it! 

Users can view property information, book reservations, view their reservations, and write reviews. We'll be creating the first ever application to do something like this and we will call it LighthouseBnB.

This project consisted of designing a database and using server-side JavaScript to display the information from queries to web pages. 
Knowledge of complex SQL queries, database and ERD (entity relationship diagram) design was used to integrate the database with a Node backend.

## Final Product

### Login form
!["Login Page"](https://github.com/samo-13/LightBnB/blob/master/docs/login-form.png)

### Logged in as user reservations page
!["Logged in user"](https://github.com/samo-13/LightBnB/blob/master/docs/listings.png)

### Search form
!["Search form"](https://github.com/samo-13/LightBnB/blob/master/docs/search-form.png)

### Example search results
!["Example search results"](https://github.com/samo-13/LightBnB/blob/master/docs/search-results.png)

## Project Structure

```
LightBnB_WebApp-master
├── public
│   ├── index.html
│   ├── javascript
│   │   ├── components 
│   │   │   ├── header.js
│   │   │   ├── login_form.js
│   │   │   ├── new_property_form.js
│   │   │   ├── property_listing.js
│   │   │   ├── property_listings.js
│   │   │   ├── search_form.js
│   │   │   └── signup_form.js
│   │   ├── index.js
│   │   ├── libraries
│   │   ├── network.js
│   │   └── views_manager.js
│   └── styles
├── sass
└── server
  ├── apiRoutes.js
  ├── database.js
  ├── json
  ├── server.js
  └── userRoutes.js
```

* `public` contains all of the HTML, CSS, and client side JavaScript. 
  * `index.html` is the entry point to the application. It's the only html page because this is a single page application.
  * `javascript` contains all of the client side javascript files.
    * `index.js` starts up the application by rendering the listings.
    * `network.js` manages all ajax requests to the server.
    * `views_manager.js` manages which components appear on screen.
    * `components` contains all of the individual html components. They are all created using jQuery.
* `sass` contains all of the sass files. 
* `server` contains all of the server side and database code.
  * `server.js` is the entry point to the application. This connects the routes to the database.
  * `apiRoutes.js` and `userRoutes.js` are responsible for any HTTP requests to `/users/something` or `/api/something`. 
  * `json` is a directory that contains a bunch of dummy data in `.json` files.
  * `database.js` is responsible for all queries to the database. It doesn't currently connect to any database, all it does is return data from `.json` files.

## Dependencies
- "bcrypt": "^3.0.8",
- "body-parser": "^1.19.0",
- "cookie-session": "^1.3.3",
- "express": "^4.17.1",
- "nodemon": "^1.19.1",
- "pg": "^8.7.3"

## Instructions
- Type 'npm run local' in your terminal
- Navigate tp [localhost/3000 ](http://localhost:3000/)