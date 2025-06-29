from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from allauth.account.utils import user_pk_to_url_str

def custom_password_reset_url(request, user, token):
    """
    Costruisce l’URL di reset che punta al tuo front-end React.
    Qui usiamo uidb64 + token, ma puoi riempire il path come vuoi.
    """
    #uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    uidb64 = user_pk_to_url_str(user)
    # Esempio di URL lato front-end:
    return f"http://localhost:5173/reset-password/{uidb64}/{token}"

