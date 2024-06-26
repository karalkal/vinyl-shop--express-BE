function createSelectQuery(tableName, data) {
    let text
    let values

    if (tableName === "purchase") {
        let whereClause = data      // will be '' if admin or AND purchase.user_id = [number]
        text = `
        SELECT 	
        purchase.id as "purchase_id",
        db_user.id as "user_id",
        db_user.email as "user_email", 
        db_user.f_name as "f_name",
        db_user.l_name as "l_name",
        purchase.placed_on,
        purchase.fulfilled_on,
        purchase.total,
	 	jsonb_build_array
		(
			album.id, album.cover, album.name, album.band_name, 
            album.release_year, album.colour, album.price 
		) AS "album_info"
	    FROM album 
	    LEFT JOIN album_purchase ON album.id = album_purchase.album_id
	    LEFT JOIN purchase ON purchase.id = album_purchase.purchase_id
	    LEFT JOIN db_user ON db_user.id = purchase.user_id
        WHERE purchase.id IS NOT NULL
        ${whereClause}
        ORDER BY db_user.id ASC,
        purchase.placed_on DESC;
   	    --user id, then latest orders first
        `
    }


    return { text, values }  // as object
}

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
            dataToInsert.f_name, dataToInsert.l_name,
            dataToInsert.email, dataToInsert.password_hash,
            dataToInsert.house_number,
            dataToInsert.street_name, dataToInsert.city,
            dataToInsert.country,
            dataToInsert.is_admin || false,
            dataToInsert.is_contributor || false
        ]
    }
    if (tableName === "purchase") {
        text = 'INSERT INTO ' + tableName + ' (user_id, total, placed_on, fulfilled_on, count_items) '
            + ' VALUES ($1, $2, $3, $4, $5) RETURNING *'
        values = [dataToInsert.user_id,
        dataToInsert.total,
        new Date(Date.now()),
        dataToInsert.fulfilled_on || null,
        dataToInsert.count_items]
    }

    if (tableName === "album_purchase") {
        text = 'INSERT INTO ' + tableName + ' (purchase_id, album_id) '
            + ' VALUES ($1, $2) RETURNING *'
        values = [dataToInsert.purchaseId, dataToInsert.albumId]
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
        // console.log("TABLE:", tableName, "DATA:", updatedData, "ID:", itemId)
        text = 'UPDATE ' + tableName + ' SET ' + 'f_name = $1,' + 'l_name = $2,' + 'email = $3,'
            + 'house_number = $4,' + 'street_name = $5,' + 'city = $6,'
            + 'country = $7,' + 'is_admin = $8,' + 'is_contributor = $9'
            + ' WHERE id = ' + itemId + ' RETURNING * '

        values = [
            updatedData.f_name, updatedData.l_name, updatedData.email, updatedData.house_number,
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

module.exports = { createSelectQuery, createInsertQuery, createDeleteQuery, createUpdateQuery }
