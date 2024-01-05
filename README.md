# API for mock vinyl shop

This project has been built using Express.js. It is an e-commerce application REST API that allows users to perform various CRUD operations such as registering an account, logging in, browsing products for sale, creating orders etc. 

It is a mock vinyl shop where each vinyl sold has specific properties and must be linked to an existing label and band (meaning these need to be created in advance).   
*[More on this in the ERD included in the repo.](https://github.com/karalkal/vynyl-shop--express-BE/blob/main/extras-ERD-Postman/erd_new.pdf)*

Users with admin permissions can also create new bands/labels/styles/users/inventory items and so on, edit and delete existing ones and basically manipulate the DB. 

----

### API deployed at: *https://vynyl-shop.onrender.com/api/v1*

### Example link: *https://vynyl-shop.onrender.com/api/v1/bands*  

### DB hosted at: *elephantsql.com*

### To log in to DB use email address: *kurcho1944@gmail.com*
----


## Install locally with `npm i`

## Some notes on the implementation code:

- Routes contain a parent router which integrates all the child routers, such as log-in, album, order, user etc.
- `authRouter.post('/register', register)`and `authRouter.post('/login', login)` and some GET routes will not require verification of user credentials, for obvious reasons.
- Admin privileges to an user can be granted from the DB only. In other words upon registration if is_admin: true is included in the request body this will not be included in the query sent to the DB. Same restriction is applied when editing users, this time in the query creator.
- Regular users can see an overview of all other users at `/users` - names and location only, but cannot see individual user info `users/:id`
- Each of the other child routes a token will be required. These will be created using the `jsonwebtoken` library upon login/registration. The FE will send these as Bearer token included in the headrer. will first check if the user is authenticated or with admin privileges (depending on the route) using the userAuthentication and/or adminAuthorization middlewares. These check the token sent in the header of the relevant request - `req.headers.authorization`
-  

apart from the



- Security middleware for production version
    - helmet
    - cors
    - xss-clean
    - express-rate-limit



