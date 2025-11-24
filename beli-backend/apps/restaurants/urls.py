"""
URL routing for Restaurant API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, MenuItemViewSet

# DRF Router automatically generates URLs for ViewSets
router = DefaultRouter()
router.register(r'', RestaurantViewSet, basename='restaurant')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')

# Generated URLs:
# GET    /api/restaurants/              → list
# POST   /api/restaurants/              → create
# GET    /api/restaurants/{id}/         → retrieve
# PUT    /api/restaurants/{id}/         → update
# PATCH  /api/restaurants/{id}/         → partial_update
# DELETE /api/restaurants/{id}/         → destroy
# GET    /api/restaurants/search/       → search action
# GET    /api/restaurants/nearby/       → nearby action
# GET    /api/restaurants/trending/     → trending action
# GET    /api/restaurants/{id}/menu/    → menu action
# GET    /api/restaurants/{id}/recommendations/ → recommendations action
#
# GET    /api/restaurants/menu-items/   → list menu items
# GET    /api/restaurants/menu-items/popular/ → popular menu items

urlpatterns = [
    path('', include(router.urls)),
]
