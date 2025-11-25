"""
Menus URL configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenusViewSet

router = DefaultRouter()
router.register(r'', MenusViewSet, basename='menus')

urlpatterns = [
    path('', include(router.urls)),
]
