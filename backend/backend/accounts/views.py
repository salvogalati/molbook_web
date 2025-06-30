from dj_rest_auth.registration.views import RegisterView
from .serializers import CustomRegisterSerializer
from dj_rest_auth.views import PasswordResetView
from .serializers import CustomPasswordResetSerializer
from django.contrib.auth import get_user_model
from rest_framework import viewsets, mixins, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from rest_framework.views import APIView
from .serializers import UserMeSerializer

class CustomRegisterView(RegisterView):
    # forziamo qui il serializer, ignorando la configurazione dinamica
    serializer_class = CustomRegisterSerializer


class CustomPasswordResetView(PasswordResetView):
    serializer_class = CustomPasswordResetSerializer


User = get_user_model()

class UserViewSet(
    mixins.DestroyModelMixin,    # abilita DELETE
    viewsets.GenericViewSet
):
    """
    Endpoint DELETE /api/users/{pk}/
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({"detail": "Non puoi eliminare il tuo account."},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            self.perform_destroy(user)
        except IntegrityError:
            return Response(
                {"detail": "Impossibile eliminare l’utente: ci sono ancora risorse collegate."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response({"detail": "Utente eliminato con successo."},
                        status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        with transaction.atomic():
            # elimina manualmente tutti i figli “protetti”
            instance.outstandingtoken_set.all().delete()
            instance.emailaddress_set.all().delete()
            # … eventuali altri related_name
            instance.delete()
            

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data)
