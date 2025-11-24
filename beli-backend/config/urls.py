"""
URL configuration for Beli Backend API.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin
    path('admin/', admin.site.admin_view),

    # API endpoints
    path('api/', include([
        path('restaurants/', include('apps.restaurants.urls')),
        # path('users/', include('apps.users.urls')),  # TODO
        # path('feed/', include('apps.social.urls')),   # TODO
        # path('lists/', include('apps.lists.urls')),   # TODO
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
