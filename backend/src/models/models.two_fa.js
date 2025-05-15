// two_fa fields :
// id -> PRIMARY KEY
// user_id -> FOREING KEY
// ascii -> VARCHAR
// hex -> VARCHAR
// base32 -> VARCHAR
// otpauth_url -> VARCHAR
// verified -> BOOL
// created_at  -> DATE

// secret object fields example:
// {
//     ascii: 'BcrTy)SaU^Rw,Sk!9NTM',
//     hex: '4263725479295361555e52772c536b21394e544d',
//     base32: 'IJRXEVDZFFJWCVK6KJ3SYU3LEE4U4VCN',
//     otpauth_url: 'otpauth://totp/google_auth%20(mel-houd2)?secret=IJRXEVDZFFJWCVK6KJ3SYU3LEE4U4VCN'
// }

const TwofaModel = {

    two_fa_init()  // Make user id unique after testing !!!!!!
    {
        return `CREATE TABLE IF NOT EXISTS two_fa (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ascii VARCHAR NOT NULL,
                hex VARCHAR NOT NULL,
                base32 VARCHAR NOT NULL,
                otpauth_url UNIQUE NOT NULL,
                verified INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
    },

    two_fa_user_index()
    {
        return `CREATE INDEX IF NOT EXISTS idx_two_fa_user ON two_fa (user_id);`;
    },

    async two_fa_get_by_id(db, user_id)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT *
                FROM two_fa
                WHERE user_id = ?
            `)

            const res = await stmt.get(user_id);
            if (res === undefined)
            {
                return {
                    success: false,
                    code: 404,
                    result: "no 2FA secret for this user"
                }
            }

            return {
                success: true,
                code: 200,
                result: res
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    },
    
    async two_fa_create(db, user_id, secret)
    {
        try
        {
            const stmt = db.prepare(`
                INSERT
                INTO two_fa (user_id, ascii, hex, base32, otpauth_url, verified)
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            const { ascii, hex, base32, otpauth_url } = secret
            const res = await stmt.run(user_id, ascii, hex, base32, otpauth_url, 0);
            return {
                success: true,
                code: 200,
                result: res.changes
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    },

    async two_fa_delete_by_id(db, user_id)
    {
        try
        {
            const stmt = db.prepare(`
                DELETE *
                FROM two_fa
                WHERE user_id = ?
            `)
            const res = await stmt.run(user_id);
            if (res.changes === 0)
            {
                return {
                    success: false,
                    code: 404,
                    result: "no 2FA secrets for this user"
                }
            }
            return {
                success: true,
                code: 200,
                result: res.changes
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    }
}

module.exports = TwofaModel
