const Pool = require('pg').Pool
require('dotenv').config()

const DB_HOST = process.env.POSTGRESQL_ADDON_HOST
const DB_PASSWORD = process.env.POSTGRESQL_ADDON_PASSWORD
const DB_USER = process.env.POSTGRESQL_ADDON_USER
const DB_NAME = process.env.POSTGRESQL_ADDON_DB
const DB_PORT = process.env.POSTGRESQL_ADDON_PORT


const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
})

// NB runs at port 5433 locally
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'vinyl_shop',
//     password: 'postgres',
//     port: 5433,
// })


// port is 5433 on desktop !!!!


module.exports = { pool }
