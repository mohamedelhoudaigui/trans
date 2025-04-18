// refresh_token fields :
// id -> PRIMARY KEY
// token -> VARCHAR
// created_at  -> DATE

const AppDataSource = require('./models.init.js')

const RefreshTokenRepo = {

    async refresh_tokens_create(token) {

        try {
            const repo = AppDataSource.getRepository("RefreshToken")
            const newToken = repo.create({
                token: token
            })
            await repo.save(newToken)
            return {
                success: true,
                code: 200,
                message: "Token added to database"
            }
        }
        catch (err) {
            return {
                success: false,
                code: 500,
                message: err.message
            }
        }
    },

    async refresh_tokens_delete(token) {
        try {
            const repo = AppDataSource.getRepository("RefreshToken")
            const result = await repo.delete({ token: token })

            return {
                success: true,
                code: 204,
                message: "Token deleted from database"
            }
        }
        catch(err) {
            return {
                success: false,
                code: 500,
                message: err.message
            }
        }
    },

    async refresh_tokens_check(token) {
        try {
            const repo = AppDataSource.getRepository("RefreshToken")
            const token = await repo.findOne({ where: { token: token } })
            if (!token) return {
                success: true,
                code: 404,
                message: "Token not found",
            }
            return {
                success: true,
                code: 200,
                message: "Token found"
            }
        } catch (error) {
            return {
                success: false,
                code: 500,
                message: err.message
            }
        }
    }
}

module.exports = RefreshTokenRepo
