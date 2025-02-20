from .models import Profile
from .serializers import ProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

class ProfileView(APIView):
    def get(self, request):
        users = Profile.objects.all()
        serializer = ProfileSerializer(users, many=True)
        return Response(serializer.data)