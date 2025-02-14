from rest_framework import serializers
from .models import Profile, Match, Tournament

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'user', 'wins', 'loses', 'friends']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['id', 'timestamp', 'player1', 'player2', 'player1_score', 'player2_score', 'winner', 'tournament']

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'timestamp', 'winner']