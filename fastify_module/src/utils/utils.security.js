const bcrypt = require('bcrypt')
require('dotenv').config()

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

module.exports = {
    hash_password,
    verify_password,
}
