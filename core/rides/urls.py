from django.urls import path
from .views import (
    RideCreateView,
    RequestToJoinRide,
    GetRequestsForRide,
    ManageRideJoinRequests,
    GetUpcomingRidesView,
    GetRideDetail,
    GetRidesRequestByUser,
    # GetCreatedRides,
    GetUserRides,
    MyRideJoinRequestsView
)

urlpatterns = [
    # Fetch all rides
    path('fetch-upcoming-rides/', GetUpcomingRidesView.as_view(), name='fetch-rides'),
    
    # Fetch ride details
    path('ride-details/<int:ride_id>/', GetRideDetail.as_view(), name='ride-details'),

    # Fetch requests created by a user
    path('requests/history/', GetRidesRequestByUser.as_view(), name='requests-history'),
    
    # Create a new ride
    path('create/', RideCreateView.as_view(), name='ride-create'),

    # Request to join a ride
    path('<int:ride_id>/request/', RequestToJoinRide.as_view(), name='ride-join-request'),

    # Get all join requests for a ride (owner only)
    path('<int:ride_id>/requests/', GetRequestsForRide.as_view(), name='ride-join-requests'),

    # Accept or reject a ride request (owner only)
    path('<int:ride_id>/requests/<int:req_id>/<str:action>/', ManageRideJoinRequests.as_view(), name='manage-ride-request'),

    # Fetch created rides
    # path('get-created-rides/', GetCreatedRides.as_view(), name='get-created-rides')
    path('get-user-rides/', GetUserRides.as_view(), name='user-rides'),

    path('get-created-requests/', MyRideJoinRequestsView.as_view(), name='get-created-requests')
]
