// refresh_token fields :
// id -> PRIMARY KEY
// token -> VARCHAR
// created_at  -> DATE

const RefreshtokenModel = {

    refresh_tokens_init()
    {
        return `CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token VARCHAR UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL DEFAULT (DATETIME(CURRENT_TIMESTAMP, '+7 DAYS')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`
    },

    refresh_tokens_user_index()
    {
        return `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);`;
    },
    
    refresh_tokens_token_index()
    {
        return `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);`
    },
    
    async refresh_tokens_check_by_token(user_id, token)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT *
                FROM refresh_tokens
                WHERE user_id = ?
                AND
                token = ?
                AND
                expires_at > CURRENT_TIMESTAMP
            `)

            const res = await stmt.get(user_id, token);
            if (res === undefined)
            {
                return {
                    success: false,
                    code: 404,
                    result: "invalid or expired token"
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
    
    async refresh_tokens_create(user_id, token)
    {
        try
        {
            const stmt = db.prepare(`
                INSERT
                INTO refresh_tokens (user_id, token)
                VALUES (?, ?)
            `)
            const res = await stmt.run(user_id, token);
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
    
    async refresh_tokens_delete_by_token(token)
    {
        try
        {
            const stmt = db.prepare(`
                DELETE
                FROM refresh_tokens
                WHERE token = ?
            `)
            const res = await stmt.run(token);
            if (res.changes === 0)
            {
                return {
                    success: false,
                    code: 404,
                    result: "invalid refresh token"
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
    },

    async refresh_tokens_delete_by_id(user_id)
    {
        try
        {
            const stmt = db.prepare(`
                DELETE
                FROM refresh_tokens
                WHERE user_id = ?
            `)
            const res = await stmt.run(user_id);
            if (res.changes === 0)
            {
                return {
                    success: false,
                    code: 404,
                    result: "no tokens for this user id"
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

module.exports = RefreshtokenModel
