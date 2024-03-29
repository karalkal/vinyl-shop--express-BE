const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const { pool } = require('../db/connect');
const { createInsertQuery } = require('../utils-validators/queryCreators');
const { verifyNonNullableFields, stringLengthValidator, emailValidator } = require('../utils-validators/validators')
const { createJWT } = require('../utils-validators/jwt');
const { processGoogleUserData } = require('../utils-validators/processGoogleUserData')
const { createCustomError, CustomAPIError } = require('../errors/custom-error');

// for google oauth
require('dotenv').config();

const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage',
);


const register = async (req, res, next) => {
  // allow only account creation excluding is_admin and is_contributor props (even if in body these will be excluded from the request),
  // need to manually set up admins in DB - update db_user set is_contributor = true, is_admin = true where id = 1
  // OR use createUser from Users (protected route)
  const userData = {
    f_name: req.body.f_name,
    l_name: req.body.l_name,
    email: req.body.email,
    password: req.body.password,
    house_number: req.body.house_number,
    street_name: req.body.street_name,
    city: req.body.city,
    country: req.body.country
  }

  // Validations
  const undefinedProperty = verifyNonNullableFields("db_user", userData);
  if (undefinedProperty) {
    return next(createCustomError(`Cannot create: essential data missing - ${undefinedProperty}`, StatusCodes.BAD_REQUEST));
  }


  const passTooShort = stringLengthValidator(userData.password, 4, 35)  // min, max
  if (passTooShort) {
    return next(createCustomError(`Password must be between 4 and 35 chars`, StatusCodes.BAD_REQUEST));
  }
  const f_nameTooShort = stringLengthValidator(userData.f_name, 1, 44)  // min, max
  if (f_nameTooShort) {
    return next(createCustomError(`First Name must be between 1 and 44 chars`, StatusCodes.BAD_REQUEST));
  }
  const l_nameTooShort = stringLengthValidator(userData.l_name, 1, 44)  // min, max
  if (l_nameTooShort) {
    return next(createCustomError(`Last Name must be between 1 and 44 chars`, StatusCodes.BAD_REQUEST));
  }
  const emailIsValid = emailValidator(userData.email)    // regex checks for VALID
  if (!emailIsValid) {
    return next(createCustomError(`Invalid email format`, StatusCodes.BAD_REQUEST));
  }


  // Encrypt password
  const salt = await bcrypt.genSalt(10)
  userData.password_hash = await bcrypt.hash(userData.password, salt)
  delete userData.password    // just in case

  // Create the user and return jwt if successful, error if not
  const insertQuery = createInsertQuery("db_user", userData);

  pool.query(insertQuery, (error, results) => {
    if (error) {
      return next(createCustomError(error, StatusCodes.BAD_REQUEST))
    }
    // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
    if (results.rowCount && results.rowCount !== 1) {
      return next(createCustomError(`Could not create user`, StatusCodes.BAD_REQUEST))
    }
    // If all is good
    let jwtToken = createJWT(results.rows[0].id, results.rows[0].email)
    // this function will expect 4 params (including is_contributor, is_admin). These remain undefined upon registration.
    res.status(StatusCodes.CREATED).json({
      email: results.rows[0].email,
      first_name: results.rows[0].f_name,
      last_name: results.rows[0].l_name,
      token: jwtToken
    })
  })
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(createCustomError(`Email and password fields cannot be empty`, StatusCodes.UNAUTHORIZED));
  }
  // get email and password_hash
  pool.query(`SELECT * FROM db_user WHERE email = '${email}'`, async (error, results) => { // need async to allow bcrypt.compare asynchronous
    if (error) {
      return next(createCustomError(error, StatusCodes.UNAUTHORIZED))
    }
    if (typeof results.rowCount !== 'undefined' && results.rowCount !== 1) {  // no such user
      return next(createCustomError(`No user with email ${email} found`, StatusCodes.UNAUTHORIZED))
    }
    const { password_hash } = results.rows[0]
    // verify password
    const isPasswordCorrect = await bcrypt.compare(password, password_hash)   //  bcrypt.compare(myPlaintextPassword, hash, function(err, result) {}
    if (!isPasswordCorrect) {
      return next(createCustomError(`Invalid password`, StatusCodes.UNAUTHORIZED))
    }
    // If all is good
    let jwtToken = createJWT(results.rows[0].id, results.rows[0].email, results.rows[0].is_contributor, results.rows[0].is_admin)
    // this function will expect 4 params (including is_contributor, is_admin). These remain undefined upon registration.
    res.status(StatusCodes.OK).json({
      email: results.rows[0].email,
      first_name: results.rows[0].f_name,
      last_name: results.rows[0].l_name,
      token: jwtToken,
      is_admin: results.rows[0].is_admin
    })
  })
}

const google = async (req, res, next) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

    /*  The tokens returned from google's api contain different user data than the one this app needs.
        To ensure consistency with our existing db_user table
        we are constructing a new object from it to include user's data (email and names).
        Later we add the user_id from our db, not the google one, create jwt and send the whole thing to FE
    */
    // from google user object construct out own user object excluding id
    const userData = await processGoogleUserData(tokens);

    const foundUser = await pool.query(`SELECT * FROM db_user where email = '${userData.email}'`);

    // USER EXISTS -->> attach id from data returned from query
    if (foundUser.rowCount === 1) {
      userData.user_id = foundUser.rows[0].id;
      createTokenSendResponse(userData);
    }
    // NEW USER -->> create entry in user_db table for logged in google user, use fake password
    else {
      const queryData = {
        f_name: userData.first_name,
        l_name: userData.last_name,
        email: userData.email,
        password_hash: "google user, no pass required",
      }
      const insertQuery = createInsertQuery("db_user", queryData);

      pool.query(insertQuery, (error, results) => {
        if (error) {
          console.log(error);
          return next(createCustomError(error, StatusCodes.BAD_REQUEST));
        }
        // Not sure if we can get any different but just in case -> rowCount: 1 if item is notFound, otherwise 0
        if (results.rowCount && results.rowCount !== 1) {
          console.log("wrong count returned from select", results)
          return next(createCustomError(`Could not create user`, StatusCodes.BAD_REQUEST))
        }
        // If all is good, user is created -->> get their id and attach to userData
        // If token creation and return res are outside of if... else... block
        // they run BEFORE the promise is resolved, hence the separate function:
        userData.user_id = results.rows[0].id;
        createTokenSendResponse(userData);
      })
    }

    // if any of this this goes wrong :-)
  } catch (error) {
    console.log(error);
    return next(createCustomError(`Could not create user with google credentials`, StatusCodes.BAD_REQUEST))
  }

  // If all is good, create JWT with user_id, email, is_contributor, is_admin
  function createTokenSendResponse(userData) {
    let jwtToken = createJWT(userData.user_id, userData.email, false, false);
    console.log(userData)

    res.status(StatusCodes.OK).json({
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      token: jwtToken
    })
  }
}

module.exports = {
  register,
  login,
  google
}
