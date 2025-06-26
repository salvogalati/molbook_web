from dj_rest_auth.registration.views import RegisterView
from .serializers import CustomRegisterSerializer
from dj_rest_auth.views import PasswordResetView
from .serializers import CustomPasswordResetSerializer

class CustomRegisterView(RegisterView):
    # forziamo qui il serializer, ignorando la configurazione dinamica
    serializer_class = CustomRegisterSerializer


class CustomPasswordResetView(PasswordResetView):
    serializer_class = CustomPasswordResetSerializer
