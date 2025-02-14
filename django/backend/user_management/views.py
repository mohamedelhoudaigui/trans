from .models import Profile
from rest_framework import viewsets
from .serializers import ProfileSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer