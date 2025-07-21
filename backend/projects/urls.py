# projects/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoleculeViewSet

router = DefaultRouter()
router.register(r'molecules', MoleculeViewSet)

urlpatterns = [
    path('', include(router.urls))
]
