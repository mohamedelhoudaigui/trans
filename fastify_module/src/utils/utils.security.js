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
    gen_jwt_token,
}
