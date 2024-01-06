# API for mock vinyl shop

This project has been built using Express.js. It is an e-commerce REST API that allows users to perform various CRUD operations such as registering an account, logging in, browsing products for sale, creating orders etc. 

The app represents an API of a mock vinyl shop. Some endpoints are accessible to all users, some - to logged in users only and some - to users with admin privileges only.    
*[More on the DB structure - in the ERD included in the repo.](https://github.com/karalkal/vynyl-shop--express-BE/blob/main/extras-ERD-Postman/erd_new.pdf)*

It has registration/logging in functionality.  

Users with admin permissions can also create new bands/labels/styles/users/inventory items and so on, edit and delete existing ones and basically manipulate the DB. 

Each vinyl must be linked to an existing label and band (meaning these need to be created in advance).

The ordering process works as follow: An INSERT query INTO a cart intermediary table is generated since the link between album and user is many-2-many, e.g. one user can order multiple albums, one album could be ordered by multiple users. Each cart (naming is not ideal) will have an unique ID (which we are not really interested in) **and a cart_number which will be our unique identifier as far as an actual cart containing multiple items is being implemented**. When the user places an order we insert into purchases an entry related to the the given **cart_no** - hence we know which user has ordered what albums in an order with this cart_no.

----

### API deployed at: *https://vynyl-shop.onrender.com/api/v1*

### Example link: *https://vynyl-shop.onrender.com/api/v1/bands*  

### PostgreSQL DB hosted at: *elephantsql.com*

### To log in to DB use email address: *kurcho1944@gmail.com*  

### To install locally use `npm i`

----

## Some notes on the implementation code:

- Routes contain a parent router which integrates all the child routers, such as log-in, album, order, user etc.
- `authRouter.post('/register', register)`and `authRouter.post('/login', login)` and some GET routes will not require verification of user credentials, for obvious reasons.
- Admin privileges to an user can be granted from the DB only. In other words upon registration if is_admin: true is included in the request body this will not be included in the query sent to the DB. Same restriction is applied when editing users, current state will be copied.
- Regular users can see an overview of all other users at `/users` - names and location only, but cannot see individual user info `users/:id`
- Each of the other child routes a token will be required. These will be created using the `jsonwebtoken` library upon login/registration. The FE will send these as Bearer token included in the header. will first check if the user is authenticated or with admin privileges (depending on the route) using the userAuthentication and/or adminAuthorization middlewares. These check the token sent in the header of the relevant request - `req.headers.authorization`
- Interaction with the DB is established using the [**pg** package](https://www.npmjs.com/package/pg). It is  a non-blocking PostgreSQL client for Node.js. A Pool object is created with the connection parameters in db/connect.js, it is exported, then we can send queries using Postgres syntax like:
```
pool.query('SELECT id, f_name, l_name, city, country FROM db_user ORDER BY id ASC', (error, results) => {
    ........
}
```

- Security middleware included for the production version

  - helmet
  - cors
  - xss-clean
  - express-rate-limit
----

### Swagger documentation created using  [APIMatic](https://www.apimatic.io/)

### Possible issues (could be resolved at FE level):
- order could be created with non-existing cart_no, will be empty.

