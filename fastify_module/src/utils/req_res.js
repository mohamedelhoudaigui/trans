function send_response(reply, code, data) {
    reply.status(code).send(data);
}

function is_exist(db, table, field, value)
{
    const stmt = db.prepare('SELECT * FROM '+ users + ' WHERE ' + field + ' = ' + value);
    const result = stmt.get(value);
    return !!result
}

module.exports = {
    send_response,
    is_exist,
}

