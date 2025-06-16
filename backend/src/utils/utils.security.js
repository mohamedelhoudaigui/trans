const bcrypt = require('bcrypt')
const validator = require('validator');

async function hash_password(password) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;

    } catch (err) {
        console.error("Error hashing password:", err);
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

function check_and_sanitize (UserData)
{
    const errors = [];

    // --- NAME (VARCHAR 100) ---
    if (!UserData.name || !validator.isLength(UserData.name, { min: 8, max: 100 }))
    {
        errors.push("name must be 8-100 characters long")
    }

    // --- EMAIL (VARCHAR 100) ---
    if (!UserData.email || !validator.isEmail(UserData.email) || !validator.isLength(UserData.email))
    {
        errors.push("invalid email address")
    }

    // --- PASSWORD (VARCHAR 100 - hashed) ---
    if (!UserData.password || !validator.isStrongPassword(UserData.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }))
    {
        errors.push("password must be at least 8 characters with 1 lowercase, 1 uppercase, 1 number, and 1 symbol")
    }

    // if (!UserData.avatar || !validator.isURL(UserData.avatar))
    // {
    //     errors.push("invalid avatar url")
    // }

    return errors
}


module.exports = {
    hash_password,
    gen_jwt_token,
    check_and_sanitize,
}
