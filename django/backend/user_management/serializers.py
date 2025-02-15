from rest_framework import serializers
from .models import Profile, Match, Tournament, Chat, Message 
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']

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

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['participants', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['chat', 'sender', 'content', 'timestamp']
