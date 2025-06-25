"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.contrib.auth import views as auth_views

from django.http import JsonResponse
from .views_api import HelloProtectedView, HelloView

def api_root(request):
    return JsonResponse({'message': 'MolBook API root. Benvenuto!'})

urlpatterns = [
    path('', api_root),
    path("admin/", admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/hello-p/', HelloProtectedView.as_view(), name='hello_protetto'),
    path('api/hello/', HelloView.as_view(), name='hello_non-protetto'),
    path('api/auth/', include('backend.accounts.urls')),
    path('accounts/', include('allauth.urls')), 
    path('api/auth/', include('dj_rest_auth.urls')),  
    path(
        'api/auth/registration/',
        include('dj_rest_auth.registration.urls')
    ),
    path(
      'api/auth/password/reset/confirm/<uidb64>/<token>/',
      auth_views.PasswordResetConfirmView.as_view(
        template_name='password_reset_confirm.html'
      ),
      name='password_reset_confirm'
    )

]
