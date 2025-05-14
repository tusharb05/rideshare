from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # print("in UserSerializer class")
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone_number', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        print("in UserSerializer/create method")
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Hash password
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        if phone_number and password:
            user = authenticate(
                request=self.context.get('request'),
                username=phone_number,  # use 'username' because authenticate uses AUTHENTICATION_BACKENDS
                password=password
            )
            if not user:
                raise serializers.ValidationError("Invalid phone number or password", code='authorization')
        else:
            raise serializers.ValidationError("Both phone number and password are required", code='authorization')

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        print(refresh.access_token.check_exp)
        print("REFESH: ", refresh)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user_id': user.id,
            'full_name': user.full_name,
            'phone_number': user.phone_number
        }