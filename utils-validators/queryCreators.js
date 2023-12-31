function createInsertQuery(tableName, dataToInsert) {
    let text
    let values
    if (tableName === "album") {
        text = 'INSERT INTO ' + tableName + ' (name, cover, release_year, band_name, label_name, summary, duration, format, price, colour, quantity)'
            + ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *'
        values = [
            dataToInsert.name, dataToInsert.cover, dataToInsert.release_year, dataToInsert.band_name, dataToInsert.label_name,
            dataToInsert.summary, dataToInsert.duration, dataToInsert.format, dataToInsert.price || 0, dataToInsert.colour || "black", dataToInsert.quantity
        ]
    }
    if (tableName === "band") {     // BAND
        text = 'INSERT INTO ' + tableName + ' (name, country)'
            + ' VALUES ($1, $2) RETURNING *'
        values = [dataToInsert.name, dataToInsert.country]
    }
    if (tableName === "label" || tableName === "genre") {   // LABEL or GENRE
        text = 'INSERT INTO ' + tableName + ' (name)'
            + ' VALUES ($1) RETURNING *'
        values = [dataToInsert.name]
    }
    if (tableName === "album_genre") {
        text = 'INSERT INTO ' + tableName + ' (album_id, genre_id)'
            + ' VALUES ($1, $2) RETURNING *'
        values = [dataToInsert.albumId, dataToInsert.genreId]
    }
    if (tableName === "db_user") {
        text = 'INSERT INTO ' + tableName + ' (f_name, l_name, email, password_hash, house_number, street_name, city, country, is_admin, is_contributor) '
            + ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *'
        values = [      // password MUST be received as hashed value
            dataToInsert.f_name, dataToInsert.l_name, dataToInsert.email, dataToInsert.password_hash, dataToInsert.house_number,
            dataToInsert.street_name, dataToInsert.city, dataToInsert.country, dataToInsert.is_admin || false, dataToInsert.is_contributor || false
        ]
    }
    if (tableName === "cart") {
        text = 'INSERT INTO ' + tableName + ' (cart_no, album_id, user_id) '
            + ' VALUES ($1, $2, $3) RETURNING *'
        values = [dataToInsert.cart_no, dataToInsert.album_id, dataToInsert.user_id]
    }
    if (tableName === "purchase") {
        text = 'INSERT INTO ' + tableName + ' (cart_no, placed_on, fulfilled_on, user_id) '
            + ' VALUES ($1, $2, $3, $4) RETURNING *'
        values = [dataToInsert.cart_no, new Date(Date.now()), dataToInsert.fulfilled_on || null, dataToInsert.user_id]
    }


    return { text, values }   // as object
}

function createDeleteQuery(tableName, firstArg, secondArg, thirdArg) {
    let text
    let values
    if (["album", "band", "genre", "label", "db_user"].includes(tableName)) {
        text = 'DELETE FROM ' + tableName + ' WHERE id=$1'
        values = [firstArg]
    }
    if (tableName === "album_genre") {
        text = 'DELETE FROM ' + tableName + ' WHERE album_id=$1 AND genre_id=$2'
        values = [firstArg, secondArg]
    }       // used to empty cart and to remove item, will depend on first arg - cart_no or id
    if (tableName === "cart" && firstArg === "empty") {
        text = 'DELETE FROM ' + tableName + ' WHERE cart_no = $1 AND user_id = $2'
        values = [secondArg, thirdArg]
    }
    if (tableName === "cart" && firstArg === "remove_single") {
        text = 'DELETE FROM ' + tableName + ' WHERE id = $1 AND user_id = $2'
        values = [secondArg, thirdArg]
    }
    if (tableName === "purchase") {
        text = 'DELETE FROM ' + tableName + ' WHERE id=$1'
        values = [firstArg]
    }

    return { text, values }   // as object
}

function createUpdateQuery(tableName, itemId, updatedData) {
    let text
    let values
    if (tableName === "album") {
        text = 'UPDATE ' + tableName + ' SET ' + ' name = $1,' + ' cover = $2,' + ' release_year = $3,'
            + ' band_name = $4,' + ' label_name = $5,' + 'summary = $6,' + ' duration = $7,'
            + ' format = $8,' + ' price = $9,' + '  colour = $10,' + ' quantity = $11'
            + ' WHERE id = ' + itemId + ' RETURNING * '

        values = [updatedData.name, updatedData.cover, updatedData.release_year, updatedData.band_name, updatedData.label_name,
        updatedData.summary, updatedData.duration, updatedData.format, updatedData.price || 0, updatedData.colour || "black", updatedData.quantity]
    }
    if (tableName === "band") {
        text = 'UPDATE ' + tableName + ' SET ' + ' name = $1,' + ' country = $2' + ' WHERE id = ' + itemId + ' RETURNING * '
        values = [updatedData.name, updatedData.country]
    }
    if (tableName === "label" || tableName === "genre") {   // LABEL or GENRE
        text = 'UPDATE ' + tableName + ' SET ' + ' name = $1' + ' WHERE id = ' + itemId + ' RETURNING * '
        values = [updatedData.name]
    }
    if (tableName === "db_user") {
        text = 'UPDATE ' + tableName + ' SET ' + 'f_name = $1,' + 'l_name = $2,' + 'email = $3,'
            + 'password_hash = $4,' + 'house_number = $5,' + 'street_name = $6,' + 'city = $7,'
            + 'country = $8,' + 'is_admin = $9,' + 'is_contributor = $10'
            + ' WHERE id = ' + itemId + ' RETURNING * '

        values = [      // password MUST be received as hashed value
            updatedData.f_name, updatedData.l_name, updatedData.email, updatedData.password_hash, updatedData.house_number,
            updatedData.street_name, updatedData.city, updatedData.country, updatedData.is_admin, updatedData.is_contributor
        ]
    }
    if (tableName === "purchase") {
        let timestampOrNull = updatedData.fulfilled_on ? new Date(Date.now()) : null
        text = 'UPDATE ' + tableName + ' SET ' + 'fulfilled_on = $1' + ' WHERE id = ' + itemId + ' RETURNING *'
        // can pass true/false as argument, if not fulfilled -> NULL, otherwise timestamp
        values = [timestampOrNull]
    }

    return { text, values }   // as object
}

module.exports = { createInsertQuery, createDeleteQuery, createUpdateQuery }
