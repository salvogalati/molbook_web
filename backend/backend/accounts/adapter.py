from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.auth.tokens import default_token_generator
# se preferisci un JWT:
# from rest_framework_simplejwt.tokens import RefreshToken
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives

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
    
def send_mail(self, template_prefix, email, context):
        """
        template_prefix: 'email_confirmation' o 'password_reset'
        Cercherà questi file:
          - templates/account/email/{template_prefix}_subject.txt
          - templates/account/email/{template_prefix}_message.html
        """
        # 1) Carica il subject (plain text, da {template_prefix}_subject.txt)
        subject = render_to_string(
            f"account/email/{template_prefix}_subject.txt", context
        ).strip()

        # 2) Carica il body HTML (da {template_prefix}_message.html)
        html_body = render_to_string(
            f"account/email/{template_prefix}_message.html", context
        )

        # 3) Fallback plain-text: rimuove i tag HTML
        text_body = strip_tags(html_body)

        # 4) Costruisci il messaggio multipart
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=self.get_from_email(),
            to=[email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()