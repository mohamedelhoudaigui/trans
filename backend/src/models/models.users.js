// user fields:
// id -> PRIMARY KEY
// name -> VARCHAR 100
// email -> VARCHAR 100
// password -> VARCHAR 100 (hashed)
// wins -> INTEGER
// loses -> INTEGERT
// avatar -> varchar 300
// created_at -> TIMESTAMP
const bcrypt = require('bcrypt')


const UserModel = {

    users_init()
    {
        return `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            wins INTEGER DEFAULT 0,
            loses INTEGER DEFAULT 0,
            avatar VARCHAR(300),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
    },

    users_index_email()
    {
        return `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`
    },

    users_index_name()
    {
        return `CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);`
    },

    async user_fetch_by_email(db, email)  // never link this to a route
    {
        try
        {
            const stmt = db.prepare(`
                SELECT *
                FROM users
                WHERE email = ?
            `)
            const result = await stmt.get(email)
            if (result === undefined)
            {
                return {
                    success: false,
                    code: 404,
                    result: "user not found"
                }
            }

            return {
                success: true,
                code: 200,
                result: result
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


    async user_fetch(db, userId)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT *
                FROM users
                WHERE id = ?
            `)
            const result = await stmt.get(userId)
            if (result === undefined)
            {
                return {
                    success: false,
                    code: 404,
                    result: "user not found"
                }
            }

            const { password, ...user_no_password } = result;
            return {
                success: true,
                code: 200,
                result: user_no_password
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

    async user_all(db)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT id, name, email, wins, loses, avatar, created_at
                FROM users
            `)
            const result = await stmt.all()
            return {
                success: true,
                code: 200,
                result: result
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

    async user_create(db, name, email, password, avatar)
    {
        try
        {
            const hashedPassword = await bcrypt.hash(password, 10)
            const stmt = db.prepare(`
                INSERT
                INTO users (name, email, password, avatar)
                VALUES (?, ?, ?, ?)
            `)
            const result = await stmt.run(name, email, hashedPassword, avatar)
            if (result.changes === 0)
            {
                return {
                    success: false,
                    code: 400,
                    result: "user creation failed"
                }
            }
            return {
                success: true,
                code: 200,
                result: result.changes
            }
        }
        catch (err)
        {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE')
            {
                return {
                    success: false,
                    code: 409,
                    result: "unique constraine violation"
                  }
            }
            return {
                success: false,
                code: 500,
                result: err.message
            }
        }
    },

    async user_delete(db, user_id)
    {
        try
        {
            const stmt = db.prepare(`
                DELETE
                FROM users
                WHERE id = ?
            `)
            const result = await stmt.run(user_id);
            if (result.changes === 0)
            {
                return {
                    success: false,
                    code: 404,
                    result: "user not found"
                }
            }
            return {
                success: true,
                code: 200,
                result: result.changes
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

    async user_update(db, user_id, name, email, password, avatar)
    {
        try
        {
            const hashedPassword = await bcrypt.hash(password, 10)
            const stmt = db.prepare(`
                UPDATE users
                SET name = ?, email = ?, password = ?, avatar = ?
                WHERE id = ?
            `);
            const result = await stmt.run(name, email, hashedPassword, avatar, user_id);
            if (result.changes === 0)
            {
                return {
                    success: false,
                    code: 400,
                    result: "user update failed"
                }
            }

            return {
                success: true,
                code: 200,
                result: result.changes
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

module.exports = UserModel