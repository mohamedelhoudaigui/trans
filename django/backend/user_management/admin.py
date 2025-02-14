from django.contrib import admin
from .models import Profile, Match, Tournament

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'id', 'wins', 'loses', 'display_friends')

	def display_friends(self, obj):
		return ",".join([friend.user.username for friend in obj.friends.all()])
	display_friends.short_description = 'Friends'

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
	list_display = ('id', 'timestamp', 'display_player1', 'display_player2', 'player1_score', 'player2_score', 'display_winner', 'tournament')

	def display_player1(self, obj):
		return obj.player1.user.username
	display_player1.short_description = 'Player 1'

	def display_player2(self, obj):
		return obj.player2.user.username
	display_player2.short_description = 'Player 2'

	def display_winner(self, obj):
		return obj.winner.user.username
	display_winner.short_description = 'Winner'

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
	list_display = ('id', 'timestamp', 'display_winner')
	def display_winner(self, obj):
		return obj.winner.user.username
	display_winner.short_description = 'Winner'

