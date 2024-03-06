const { OAuth2Client } = require("google-auth-library");
const { createJWT } = require("./jwt");

async function processGoogleUserData(tokens) {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // console.log(payload);

    const userData = {
        email: payload.email,
        first_name: payload.given_name,
        last_name: payload.family_name,
    }

    return userData;
}

module.exports = { processGoogleUserData }