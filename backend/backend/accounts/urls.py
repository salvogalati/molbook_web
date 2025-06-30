from django.urls import path
from .views import CustomRegisterView, MeView

urlpatterns = [
    path('register/', CustomRegisterView.as_view(), name='api-register'),
    path('me/', MeView.as_view(), name='me'),
]
