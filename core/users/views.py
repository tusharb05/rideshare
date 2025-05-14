from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class UserCreateView(APIView):
    def post(self, request, format=None):
        # print('\n\n\n\n\n\n')
        # print(request.data)
        # print('\n\n\n\n\n\n')
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # print("before user created...")
            serializer.save()  # This will use the `create()` method in the serializer
            # print("user created...")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class GetUserData(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)