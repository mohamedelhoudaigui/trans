const UserModel = require('./models.users')
const FriendshipModel = require('./models.friendships')
const RefreshtokenModel = require('./models.refresh_tokens')
const TwofaModel = require('./models.two_fa')
const ChatModel = require('./models.chat')

require('dotenv').config()

async function initDb(fastify)
{
    fastify.after(() => {
        fastify.db.prepare(UserModel.users_init()).run()
        fastify.db.prepare(UserModel.users_index_email()).run()
        fastify.db.prepare(UserModel.users_index_name()).run()
    })

    fastify.after(() => {
        fastify.db.prepare(FriendshipModel.friendships_init()).run()
    })

    fastify.after(() => {
        fastify.db.prepare(RefreshtokenModel.refresh_tokens_init()).run()
        fastify.db.prepare(RefreshtokenModel.refresh_tokens_token_index()).run()
        fastify.db.prepare(RefreshtokenModel.refresh_tokens_user_index()).run()
    })

    fastify.after(() => {
        fastify.db.prepare(TwofaModel.two_fa_init()).run()
        fastify.db.prepare(TwofaModel.two_fa_user_index()).run()
    })

    fastify.after(() => {
        fastify.db.prepare(ChatModel.chat_init()).run()
        fastify.db.prepare(ChatModel.chat_sender_id_index()).run()
        fastify.db.prepare(ChatModel.chat_recipient_id_index()).run()
    })


    console.log('finished initing db...')
}


module.exports = initDb