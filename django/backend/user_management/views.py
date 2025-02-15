from .models import Profile
from rest_framework import viewsets
from .serializers import ProfileSerializer, UserSerializer
from django.contrib.auth.models import User

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer