// user fields:
// id -> PRIMARY KEY
// name -> VARCHAR 100
// email -> VARCHAR 100
// password -> VARCHAR 100 (hashed)
// wins -> INTEGER
// loses -> INTEGERT
// created_at -> TIMESTAMP

const AppDataSource = require('./models.init.js')

const UserRepo = {

    // Create a new user
    async user_create(userData) {
        try {
            const repo = AppDataSource.getRepository("User")
            const hashedPassword = await bcrypt.hash(userData.password, 10)

            const newUser = repo.create({
                ...userData,
                password: hashedPassword
            })

            await repo.save(newUser)
            return {
                success: true,
                code: 201,
                user: newUser
            }

        } catch (err) {
            return {
                success: false,
                code: err.message.includes("UNIQUE")
                    ? 409
                    : 500,
                error: err.message.includes("UNIQUE")
                    ? "Duplicated resource"
                    : err.message
            };
        }
    },

    // Delete a user by ID
    async user_delete(userId) {
        try {
            const repo = AppDataSource.getRepository("User")
            const result = await repo.delete(userId)
            return {
                success: result.affected > 0,
                code: result.affected > 0
                    ? 204
                    : 404,
                message: result.affected > 0
                    ? "User deleted successfully"
                    : "User not found"
            }

        } catch (err) {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    // Fetch a single user by ID
    async user_fetch(userId) {
        try {
            const repo = AppDataSource.getRepository("User")
            const user = await repo.findOne({ where: { id: userId } })

            if (!user) return {
                success: false,
                code: 404,
                error: "User not found"
            }

            const { password, ...user_no_password } = user;
            return {
                success: true,
                code: 200,
                user: user_no_password
            }

        } catch (err) {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    // Update user information
    async user_update(userId, updateData) {
        try {
            const repo = AppDataSource.getRepository("User")

            // Hash new password if provided
            if (updateData.password) 
                updateData.password = await bcrypt.hash(updateData.password, 10)

            await repo.update(userId, updateData)
            const updatedUser = await repo.findOne({ where: { id: userId } })

            if (!updatedUser)
                return {
                    success: false,
                    code: 404,
                    error: "User not found"
                }

            const { password, ...user_no_password } = updatedUser

            return {
                success: true,
                code: 200,
                user: user_no_password
            }

        } catch (err) {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    // Get all users (paginated)
    async user_all(page = 1, limit = 10) {
        try {
            const repo = AppDataSource.getRepository("User");
            const [users, total] = await repo.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
                order: { created_at: "DESC" }
            })

            // Remove passwords from all users
            const sanitizedUsers = users.map(user => {
                const { password, ...rest } = user
                return rest
            })

            return {
                success: true,
                code: 200,
                users: sanitizedUsers,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }

        } catch (err) {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    }
}

module.exports = UserRepo

