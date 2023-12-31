const Pool = require('pg').Pool
require('dotenv').config()

const ELEPHANT_URL = process.env.ELEPHANT_URL
const ELEPHANT_PASS = process.env.ELEPHANT_PASS
const ELEPHANT_USER = process.env.ELEPHANT_USER
const ELEPHANT_DB = process.env.ELEPHANT_DB


const pool = new Pool({
    user: ELEPHANT_USER,
    host: ELEPHANT_URL,
    database: ELEPHANT_DB,
    password: ELEPHANT_PASS,
    port: 5432,
})
/*
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'vinyl_shop',
    password: 'postgres',
    port: 5432,
})
*/

// port is 5433 on desktop !!!!


module.exports = { pool }
