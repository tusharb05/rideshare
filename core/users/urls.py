from django.urls import path
from .views import UserCreateView, UserLoginView, GetUserData
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('get-user-data/', GetUserData.as_view(), name='get-user-data')
]