// friendships fields :
// user_id -> FOREIGN KEY
// friend_id -> FOREIGN KEY
// created_at -> DATE

const AppDataSource = require('./models.init.js');

const FriendshipRepo = {

    async addFriend(userId, friendId) {
        try {
            const friendshipRepo = AppDataSource.getRepository("Friendship");
            const newFriendship = friendshipRepo.create({
                user_id: userId,
                friend_id: friendId
            });
            await friendshipRepo.save(newFriendship);
            return {
                success: true,
                code: 201,
                message: "Friendship created successfully"
            };
        } catch (err) {
            return {
                success: false,
                code: 500,
                message: err.message
            };
        }
    },

    async removeFriend(userId, friendId) {
        try {
            const friendshipRepo = AppDataSource.getRepository("Friendship");
            const result = await friendshipRepo.delete({
                user_id: userId,
                friend_id: friendId
            });
            
            return {
                success: result.affected > 0,
                code: result.affected > 0 ? 204 : 404,
                message: result.affected > 0 
                    ? "Friendship removed successfully" 
                    : "Friendship not found"
            };
        } catch (err) {
            return {
                success: false,
                code: 500,
                message: err.message
            };
        }
    },

    async checkFriendship(userId, friendId) {
        try {
            const friendshipRepo = AppDataSource.getRepository("Friendship");
            const friendship = await friendshipRepo.findOne({
                where: [
                    { user_id: userId, friend_id: friendId },
                    { user_id: friendId, friend_id: userId }
                ]
            });

            return {
                success: true,
                code: 200,
                exists: !!friendship
            };
        } catch (err) {
            return {
                success: false,
                code: 500,
                message: err.message
            };
        }
    },

    async getFriends(userId) {
        try {
            const userRepo = AppDataSource.getRepository("User");
            const user = await userRepo.findOne({
                where: { id: userId },
                relations: ["friends"]
            });

            if (!user) {
                return {
                    success: false,
                    code: 404,
                    message: "User not found"
                };
            }

            // Get both sides of friendships (where user is either user_id or friend_id)
            const friendshipRepo = AppDataSource.getRepository("Friendship");

            const friendshipsAsUser = await friendshipRepo.find({
                where: { user_id: userId },
                relations: ["friend"]
            });

            const friendshipsAsFriend = await friendshipRepo.find({
                where: { friend_id: userId },
                relations: ["user"]
            });

            // Combine and format the results
            const friends = [
                ...friendshipsAsUser.map(f => ({
                    id: f.friend.id,
                    name: f.friend.name,
                    email: f.friend.email
                })),

                ...friendshipsAsFriend.map(f => ({
                    id: f.user.id,
                    name: f.user.name,
                    email: f.user.email
                }))
            ];

            // Remove duplicates (in case of bidirectional friendship records)
            const uniqueFriends = friends.filter((friend, index, self) =>
                index === self.findIndex(f => f.id === friend.id)
            );

            return {
                success: true,
                code: 200,
                friends: uniqueFriends
            };
        } catch (err) {
            return {
                success: false,
                code: 500,
                message: err.message
            };
        }
    }
};

module.exports = FriendshipRepo;