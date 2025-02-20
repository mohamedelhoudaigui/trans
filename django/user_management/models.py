from django.db import models
from django.contrib.auth.models import AbstractUser

#-----------Profile(extends django user)-----------

# user need wins, loses, matches and friends

class Profile(AbstractUser):
	wins = models.IntegerField(default = 0)
	loses = models.IntegerField(default = 0)

	def __str__(self):
		return self.username


# #--------------------Match------------------------

# class Match(models.Model):

# 	id = models.AutoField(primary_key=True)
# 	timestamp = models.DateTimeField(auto_now_add=True)
# 	player1 = models.ForeignKey(to='Profile',
# 								on_delete=models.CASCADE,
# 								related_name='matches_as_player1',
# 								null=False,
# 								blank=False)

# 	player2 = models.ForeignKey(to='Profile',
# 								on_delete=models.CASCADE,
# 								related_name='matches_as_player2',
# 								null=False,
# 								blank=False)

# 	player1_score = models.IntegerField()
# 	player2_score = models.IntegerField()
# 	winner = models.ForeignKey(to='Profile',
# 								on_delete=models.SET_NULL,
# 								related_name='matches_won',
# 								null=True,
# 								blank=True)

# 	tournament = models.ForeignKey(to='Tournament',
# 									on_delete=models.SET_NULL,
# 									null=True,
# 									blank=True,
# 									related_name='matches')

# 	def __str__(self):
# 		return f"Match {self.id} - {self.player1.user.username} vs {self.player2.user.username}"

# 	class Meta:
# 		ordering = ['-timestamp']

# #-------------------Tournament---------------------

# class Tournament(models.Model):

# 	id = models.AutoField(primary_key=True)
# 	timestamp = models.DateTimeField(auto_now_add=True)
# 	winner = models.ForeignKey(to='Profile',
# 								on_delete=models.CASCADE,
# 								null=False,
# 								blank=False,
# 								related_name='tournaments_won')

# 	def __str__(self):
# 		return f"Tournament {self.id} - Winner: {self.winner.user.username if self.winner else 'None'}"

# 	class Meta:
# 		ordering = ['-timestamp']


# #---------------------Chat---------------------------

# class Chat(models.Model):

# 	participants = models.ManyToManyField(to='Profile',
# 										related_name='chats')

# 	created_at = models.DateTimeField(auto_now_add=True)

# 	def __str__(self):
# 		participant_names = [p.user.username for p in self.participants.all()]
# 		return f"Chat between {', '.join(participant_names)}"

# 	class Meta:
# 		ordering = ['-created_at']

# class Message(models.Model):

# 	chat = models.ForeignKey(to='Chat',
# 							on_delete=models.CASCADE,
# 							related_name='messages')

# 	sender = models.ForeignKey(to='Profile',
# 								on_delete=models.CASCADE,
# 								related_name='messages')

# 	content = models.TextField()
# 	timestamp = models.DateTimeField(auto_now_add=True)

# 	def __str__(self):
# 		return f"Message from {self.sender.user.username} in {self.chat}: {self.content[:50]}..."

# 	class Meta:
# 		ordering = ['-timestamp']

