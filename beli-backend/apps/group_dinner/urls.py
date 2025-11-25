"""
Group Dinner URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupDinnerViewSet

router = DefaultRouter()
router.register(r'', GroupDinnerViewSet, basename='group-dinner')

urlpatterns = [
    path('', include(router.urls)),
]
