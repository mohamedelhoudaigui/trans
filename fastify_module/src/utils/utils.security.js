const bcrypt = require('bcrypt')

async function hash_password(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;

    } catch (err) {
        console.error("Error hashing password:", err);
        throw err;
    }
}

async function verify_password(db, email, password) {
    try {
        const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
        const result = stmt.get(email);
        if (!result)
            return false
        const hashedPassword = result.password
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;

    } catch (err) {
        console.error("Error verifying password:", err);
        throw err;
    }
}

function gen_jwt_token(fastify, payload, expire_date)
{
    const token = fastify.jwt.sign(
        { payload },
        { expiresIn: expire_date }
    )
    return (token)
}

module.exports = {
    hash_password,
    verify_password,
    gen_jwt_token,
}
