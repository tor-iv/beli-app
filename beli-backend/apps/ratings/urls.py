"""
Ratings URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RatingsViewSet

router = DefaultRouter()
router.register(r'', RatingsViewSet, basename='ratings')

urlpatterns = [
    path('', include(router.urls)),
]
