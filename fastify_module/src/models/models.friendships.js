// friendships fields :
// user_id -> FOREIGN KEY
// friend_id -> FOREIGN KEY
// created_at -> DATE

const FriendshipModel = {

    friendships_init()
    {
        return `CREATE TABLE IF NOT EXISTS friendships (
                user_id INTEGER NOT NULL,
                friend_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, friend_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE);`
    },

    async add_friend(user_id, friend_id)
    {
        try
        {
            const stmt = db.prepare(`
                INSERT
                INTO friendships (user_id, friend_id)
                VALUES (?, ?)
            `);
            const res = await stmt.run(user_id, friend_id);
            if (res.changes === 0)
            {
                return {
                    success: false,
                    code: 400,
                    result: "friendship creation failed"
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
    
    async remove_friend(user_id, friend_id)
    {
        try
        {
            const stmt = db.prepare(`
                DELETE
                FROM friendships
                WHERE (user_id = ? AND friend_id = ?)
                OR (user_id = ? AND friend_id = ?)
            `)

            const res = await stmt.run(user_id, friend_id, friend_id, user_id)
            if (res.changes == 0)
            {
                return {
                    success: false,
                    code: 404,
                    result: "friendship doesnt exist"
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
    
    async check_friendship(user_id, friend_id)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT *
                FROM friendships 
                WHERE (user_id = ? AND friend_id = ?)
                OR (user_id = ? AND friend_id = ?)
            `)
            const res = await stmt.get(user_id, friend_id, friend_id, user_id)
            if (res === undefined)
            {
                return {
                    success: false,
                    code: 404,
                    result: "friendship not found"
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
    
    async get_friends(user_id)
    {
        try
        {
            const stmt = db.prepare(`
                SELECT u.id, u.name, u.email
                FROM users u
                JOIN friendships f
                ON u.id = f.friend_id
                WHERE f.user_id = ?
                UNION
                SELECT u.id, u.name, u.email 
                FROM users u
                JOIN friendships f
                ON u.id = f.user_id
                WHERE f.friend_id = ?
            `)

            const res = await stmt.all(user_id, user_id)

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
    }
    
};

module.exports = FriendshipModel;