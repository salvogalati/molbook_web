from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.auth.tokens import default_token_generator
# se preferisci un JWT:
# from rest_framework_simplejwt.tokens import RefreshToken

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        key = emailconfirmation.key
        email = emailconfirmation.email_address

        # 1) Con il default_token_generator di Django:
        #token = default_token_generator.make_token(user)

        #  -- oppure, se vuoi un JWT access token:
        # refresh = RefreshToken.for_user(user)
        # token   = str(refresh.access_token)

        frontend_url = "http://localhost:5173/verify-email"
        # costruisci l’URL con entrambe le parti
        return f"{frontend_url}/{key}"