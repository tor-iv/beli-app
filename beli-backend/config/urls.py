"""
URL configuration for beli-backend project.

API endpoints are versioned under /api/v1/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Core resources
    path('api/v1/restaurants/', include('apps.restaurants.urls')),
    path('api/v1/users/', include('apps.users.urls')),

    # Social features
    path('api/v1/feed/', include('apps.feed.urls')),
    path('api/v1/ratings/', include('apps.ratings.urls')),
    path('api/v1/lists/', include('apps.lists.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),

    # Discovery features
    path('api/v1/group-dinner/', include('apps.group_dinner.urls')),
    path('api/v1/tastemakers/', include('apps.tastemakers.urls')),
    path('api/v1/menus/', include('apps.menus.urls')),
]
