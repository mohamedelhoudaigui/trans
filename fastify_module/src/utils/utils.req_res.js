function send_response(reply, code, data) {
    reply.status(code).send(data);
}

function check_user(db, email, password)
{
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ? AND password = ?`);
    const result = stmt.get(email, password);
    return !!result

}

module.exports = {
    send_response,
    check_user,
}

