function idIntegerValidator(id) {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return false
    }
    return true
}


function verifyNonNullableFields(entity, data) {
    let essentialData
    // albums - construct essential data object from incoming data
    if (entity === "album") {
        essentialData = {
            name: data.name,
            cover: data.cover,
            release_year: data.release_year,
            band_name: data.band_name,
            label_name: data.label_name
        }
    }
    if (entity === "band" || entity === "label" || entity === "genre") {
        essentialData = { name: data.name }
    }
    if (entity === "db_user") {
        essentialData = {
            f_name: data.f_name,
            l_name: data.l_name,
            email: data.email,
            password: data.password
        }
    }
    if (entity === "cart") {
        essentialData = { cart_no: data.cart_no, album_id: data.album_id, user_id: data.user_id }
    }
    if (entity === "order") {
        essentialData = { total: data.cart_no, user_id: data.user_id }
    }

    //generic validation, if any of the required properties is undefined, return its key, so it can be displayed in error message, check for " " as well
    for (let key in essentialData) {
        if (typeof essentialData[key] === "undefined" || String(essentialData[key]).trim() === "") {    // cat numeric values to string to verify
            return key
        }
    }
    return false
}


function stringLengthValidator(str, minLen, maxLen) {
    if (str.length < minLen || str.length > maxLen) {
        return true
    }
    return false
}

function emailValidator(email) {
    return String(email).toLowerCase().match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}


module.exports = { idIntegerValidator, verifyNonNullableFields, stringLengthValidator, emailValidator }
