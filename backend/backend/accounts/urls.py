from django.urls import path
from .views import CustomRegisterView

urlpatterns = [
    path('register/', CustomRegisterView.as_view(), name='api-register'),
]
