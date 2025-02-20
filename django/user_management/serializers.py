from rest_framework import serializers
from .models import Profile

# abstract user:
#id, username, password,
# first_name, last_name,
# email, is_staff, is_active,
# is_superuser, last_login,
# date_joined, groups,
# user_permissions

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'wins', 'loses']