from rest_framework import serializers
from .models import Ride, RideJoinRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'phone_number']


# class RideSerializer(serializers.ModelSerializer):
#     owner = UserSummarySerializer(read_only=True)
#     participants = UserSummarySerializer(many=True, read_only=True)
#     is_user_owner = serializers.SerializerMethodField()


#     class Meta:
#         model = Ride
#         fields = [
#             'id', 'owner', 'participants',
#             'pickup_latitude', 'pickup_longitude',
#             'destination_latitude', 'destination_longitude',
#             'total_seats', 'seats_available',
#             'total_cost', 'cost_per_seat',
#             'status', 'departure_datetime', 'created_at', 'is_user_owner',
#         ]
#         read_only_fields = ['seats_available', 'cost_per_seat', 'created_at']

#     def get_is_user_owner(self, obj):
#         request = self.context.get('request')
#         user = getattr(request, 'user', None)
#         return user.is_authenticated and obj.owner == user


    
#     def create(self, validated_data):
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             validated_data['owner'] = request.user
#         ride = Ride.objects.create(**validated_data)

#         # Add owner as a participant (takes a seat)
#         ride.participants.add(request.user)

#         return ride


class RideSerializer(serializers.ModelSerializer):
    owner = UserSummarySerializer(read_only=True)
    participants = UserSummarySerializer(many=True, read_only=True)
    is_user_owner = serializers.SerializerMethodField()
    requested = serializers.SerializerMethodField()
    requested_status = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = [
            'id', 'owner', 'participants',
            'pickup_latitude', 'pickup_longitude',
            'destination_latitude', 'destination_longitude',
            'total_seats', 'seats_available',
            'total_cost', 'cost_per_seat',
            'status', 'departure_datetime', 'created_at',
            'is_user_owner', 'requested', 'requested_status'
        ]
        read_only_fields = ['seats_available', 'cost_per_seat', 'created_at']
    
    def get_is_user_owner(self, obj):
        user = self.context.get('request').user
        return user.is_authenticated and obj.owner == user

    # def get_requested(self, obj):
    #     user = self.context.get('request').user
    #     if not user.is_authenticated:
    #         return False
    #     return RideJoinRequest.objects.filter(ride=obj, user=user).exists()

    # def get_requested_status(self, obj):
    #     user = self.context.get('request').user
    #     if not user.is_authenticated:
    #         return None
    #     try:
    #         request = RideJoinRequest.objects.get(ride=obj, user=user)
    #         return request.status
    #     except RideJoinRequest.DoesNotExist:
    #         return None
    
    def get_requested(self, obj):
        user = self.context.get('request').user
        if not user.is_authenticated:
            return False
        return hasattr(obj, "user_join_requests") and bool(obj.user_join_requests)

    def get_requested_status(self, obj):
        user = self.context.get('request').user
        if not user.is_authenticated:
            return None
        if hasattr(obj, "user_join_requests") and obj.user_join_requests:
            return obj.user_join_requests[0].status
        return None


class RideCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = [
            'pickup_latitude', 'pickup_longitude',
            'destination_latitude', 'destination_longitude',
            'total_seats', 'total_cost', 'departure_datetime'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['owner'] = request.user  # Automatically set the owner
        return super().create(validated_data)
    

class RideDetailSerializer(RideSerializer):
    join_requests = serializers.SerializerMethodField()

    class Meta(RideSerializer.Meta):
        fields = RideSerializer.Meta.fields + ['join_requests']

    def get_join_requests(self, obj):
        request = self.context.get('request')
        user = request.user if request else None

        if not user or not user.is_authenticated:
            return None

        if obj.owner != user:
            return None

        join_requests = obj.join_requests.all()
        return RideJoinRequestSerializer(join_requests, many=True).data


class RideJoinRequestSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_phone_number = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = RideJoinRequest
        fields = [
            'id', 'ride', 'user',
            'user_full_name', 'user_phone_number',
            'status', 'requested_at'
        ]
        read_only_fields = ['user', 'status', 'requested_at']


class RideJoinRequestWithRideSerializer(serializers.ModelSerializer):
    ride = RideSerializer(read_only=True)

    class Meta:
        model = RideJoinRequest
        fields = ['id', 'status', 'requested_at', 'ride']