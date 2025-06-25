from dj_rest_auth.registration.views import RegisterView
from .serializers import CustomRegisterSerializer

class CustomRegisterView(RegisterView):
    # forziamo qui il serializer, ignorando la configurazione dinamica
    serializer_class = CustomRegisterSerializer
