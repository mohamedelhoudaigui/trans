function send_response(reply, code, data) {
    reply.status(code).send(data);
}

function does_exist(db, name, email) {
    try {
        const stmt = db.prepare('SELECT * FROM users WHERE name = ? OR email = ?');
        const result = stmt.get(name, email);
        return result !== undefined;
    } catch (err) {
        console.error('Error checking for user:', err);
        throw err;
    }
}

module.exports = {
    send_response,
    does_exist,
}

