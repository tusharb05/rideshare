from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Ride, RideJoinRequest
from .serializers import RideJoinRequestWithRideSerializer, RideCreateSerializer, RideSerializer, RideJoinRequestSerializer, RideDetailSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from django.core.cache import cache

User = get_user_model()

class RideCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Use the RideCreateSerializer for ride creation
        serializer = RideCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            ride = serializer.save()
            return Response(RideCreateSerializer(ride).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetUpcomingRidesView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        user_id = user.id if user else "anonymous"

        cache_key = f"upcoming_rides:{user_id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        # Fetch the rides from DB
        user_join_requests = RideJoinRequest.objects.filter(user=user) if user else RideJoinRequest.objects.none()

        rides = Ride.objects.filter(status=Ride.RideStatus.UPCOMING)\
            .select_related("owner")\
            .prefetch_related("participants")\
            .prefetch_related(
                Prefetch("join_requests", queryset=user_join_requests, to_attr="user_join_requests")
            )

        serializer = RideSerializer(rides, many=True, context={"request": request})
        data = serializer.data

        # Store in cache for 60 seconds
        cache.set(cache_key, data, timeout=60)  # 60 seconds

        return Response(data, status=status.HTTP_200_OK)


class RequestToJoinRide(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        try:
            ride = Ride.objects.get(pk=ride_id)
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not found'}, status=status.HTTP_404_NOT_FOUND)

        if ride.owner == request.user:
            return Response({'error': 'You cannot join your own ride'}, status=status.HTTP_400_BAD_REQUEST)

        if RideJoinRequest.objects.filter(ride=ride, user=request.user).exists():
            return Response({'message': 'Join request already exists'}, status=status.HTTP_200_OK)

        if ride.seats_available <= 0:
            return Response({'error': 'No seats available'}, status=status.HTTP_400_BAD_REQUEST)

        join_request = RideJoinRequest.objects.create(ride=ride, user=request.user)
        serializer = RideJoinRequestSerializer(join_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GetRequestsForRide(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        ride = get_object_or_404(Ride, pk=ride_id)

        if ride.owner != request.user:
            return Response({"error": "You are not authorized to view these requests."}, status=status.HTTP_403_FORBIDDEN)

        requests = RideJoinRequest.objects.filter(ride=ride)
        serializer = RideJoinRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ManageRideJoinRequests(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, ride_id, req_id, action):
        ride = get_object_or_404(Ride, pk=ride_id)

        if ride.owner != request.user:
            return Response({'error': 'Unauthorized. Only ride owner can manage requests.'}, status=status.HTTP_403_FORBIDDEN)

        join_request = get_object_or_404(RideJoinRequest, pk=req_id, ride=ride)

        if join_request.status != RideJoinRequest.RequestStatus.PENDING:
            return Response({'error': 'Request already processed.'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'accept':
            if ride.seats_available <= 0:
                return Response({'error': 'No seats available'}, status=status.HTTP_400_BAD_REQUEST)

            join_request.status = RideJoinRequest.RequestStatus.ACCEPTED
            join_request.save()

            ride.participants.add(join_request.user)
            ride.seats_available = max(ride.seats_available - 1, 0)
            ride.save()

            return Response({'message': 'Request accepted.'}, status=status.HTTP_200_OK)

        elif action == 'reject':
            join_request.status = RideJoinRequest.RequestStatus.REJECTED
            join_request.save()
            return Response({'message': 'Request rejected.'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid action. Use "accept" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)


class GetRideDetail(APIView):
    def get(self, request, ride_id):
        ride = get_object_or_404(Ride, pk=ride_id)
        serializer = RideDetailSerializer(ride, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetRidesRequestByUser(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        join_requests = RideJoinRequest.objects.filter(user=request.user)
        serializer = RideJoinRequestSerializer(join_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetUserRides(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Prefetch join requests for this user only
        user_join_requests = RideJoinRequest.objects.filter(user=user)

        # Rides created by the user
        created_rides = Ride.objects.filter(owner=user)\
            .select_related("owner")\
            .prefetch_related("participants")\
            .prefetch_related(Prefetch("join_requests", queryset=user_join_requests, to_attr="user_join_requests"))\
            .order_by('-created_at')

        # Rides the user was accepted into
        accepted_requests = RideJoinRequest.objects.filter(
            user=user,
            status=RideJoinRequest.RequestStatus.ACCEPTED
        ).select_related('ride')

        accepted_rides = [
            req.ride for req in accepted_requests
        ]

        # Optimize accepted_rides queryset
        # (Important: bulk fetch rides if accepted_rides is not empty)
        if accepted_rides:
            accepted_rides_ids = [r.id for r in accepted_rides]
            accepted_rides_queryset = Ride.objects.filter(id__in=accepted_rides_ids)\
                .select_related("owner")\
                .prefetch_related("participants")\
                .prefetch_related(Prefetch("join_requests", queryset=user_join_requests, to_attr="user_join_requests"))
        else:
            accepted_rides_queryset = Ride.objects.none()

        # Serialize both
        created_rides_serialized = RideSerializer(
            created_rides, many=True, context={'request': request}
        )
        accepted_rides_serialized = RideSerializer(
            accepted_rides_queryset, many=True, context={'request': request}
        )

        return Response({
            "created_rides": created_rides_serialized.data,
            "accepted_rides": accepted_rides_serialized.data
        }, status=status.HTTP_200_OK)



class MyRideJoinRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch all ride join requests made by the user
        join_requests = RideJoinRequest.objects.filter(user=user)\
            .select_related('ride__owner')\
            .prefetch_related('ride__participants')

        serializer = RideJoinRequestWithRideSerializer(join_requests, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)