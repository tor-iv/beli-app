"""
Tastemakers URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TastemakersViewSet

router = DefaultRouter()
router.register(r'', TastemakersViewSet, basename='tastemakers')

urlpatterns = [
    path('', include(router.urls)),
]
