// user fields:
// id -> PRIMARY KEY
// name -> VARCHAR 100
// email -> VARCHAR 100
// password -> VARCHAR 100 (hashed)
// wins -> INTEGER
// loses -> INTEGERT
// created_at -> TIMESTAMP

const AppDataSource = require('./models.init.js')
const bcrypt = require('bcrypt')

const UserRepo = {

    async user_create(userData)
    {
        try
         {
            const repo = AppDataSource.getRepository("User")

            const hashedPassword = await bcrypt.hash(userData.password, 10)
            userData.password = hashedPassword;

            const newUser = repo.create(userData)
            await repo.save(newUser)

            const {password, ...user_no_password} = newUser

            return {
                success: true,
                code: 201,
                user: user_no_password
            }

        }
        catch (err)
        {
            return {
                success: false,
                code: err.message.includes("UNIQUE") ? 409 : 500,
                error: err.message.includes("UNIQUE") ? "Duplicated resource" : err.message
            };
        }
    },

    async user_delete(userId)
    {
        try
        {
            const repo = AppDataSource.getRepository("User")

            const result = await repo.delete(userId)
            return {
                success: result.affected > 0,
                code: result.affected > 0 ? 204 : 404,
                message: result.affected > 0 ? "User deleted successfully" : "User not found"
            }

        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    async user_fetch(userId)
    {
        try
        {
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

        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    async user_login(userEmail, userPassword)
    {
        try
        {
            const repo = AppDataSource.getRepository("User")

            const user = await repo.findOne({ where: { email: userEmail } })
            if (!user)
            {
                return {
                    success: false,
                    code: 404,
                    error: "User not found"
                }
            }

            const isMatch = await bcrypt.compare(userPassword, user.password);
            if (!isMatch)
            {
                return {
                    success: false,
                    code: 404,
                    error: "Wrong user creds"
                }
            }

            return {
                success: true,
                code: 200,
                user: user
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    async user_update(userId, updateData)
    {
        try
        {
            const repo = AppDataSource.getRepository("User")

            if (updateData.password) 
                updateData.password = await bcrypt.hash(updateData.password, 10)

            await repo.update(userId, updateData)

            const { password, ...user_no_password } = updatedUser

            return {
                success: true,
                code: 200,
                user: user_no_password
            }

        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    },

    async user_all()
    {
        try
        {
            const repo = AppDataSource.getRepository("User");
            const users = await repo.findAndCount({
                order: { created_at: "DESC" }
            })

            return {
                success: true,
                code: 200,
                users: users,
            }
        }
        catch (err)
        {
            return {
                success: false,
                code: 500,
                error: err.message
            }
        }
    }
}

module.exports = UserRepo