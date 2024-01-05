# API for mock vinyl shop

**This project has been built using Express.js. It is an e-commerce application REST API that allows users to perform various CRUD operations such as registering an account, logging in, browsing products for sale, creating orders etc. 

It is a mock vinyl shop where each vinyl sold has specific properties and must be linked to an existing label and band (meaning these need to be created in advance). More on this can be seen in the ERD included in the repo.

Users with admin permissions can also create new bands/labels/styles/users/inventory items and so on, edit and delete existing ones and basically manipulate the DB**

### API deployed at: *https://vynyl-shop.onrender.com/api/v1*

### Example link: *https://vynyl-shop.onrender.com/api/v1/bands*  

### DB hosted at: *elephantsql.com*

### To log in to DB use email address: *kurcho1944@gmail.com*


## Security middleware in production version
- helmet
- cors
- xss-clean
- express-rate-limit

