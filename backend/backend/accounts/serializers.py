# backend/accounts/serializers.py
from dj_rest_auth.registration.serializers import RegisterSerializer as DefaultRegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer as _PasswordResetSerializer
from .utils import custom_password_reset_url
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from rest_framework import serializers
from django.conf import settings
from allauth.account.utils import user_pk_to_url_str
from .models import UIState

User = get_user_model()

class CustomRegisterSerializer(DefaultRegisterSerializer):
    # rimuovo i campi che non servono
    username  = None
    password1 = None
    password2 = None

    # un solo campo password
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(),
                                    message="The email is already registered.")]
    )
    password = serializers.CharField(write_only=True, min_length=6)

    # campi extra
    first_name    = serializers.CharField(required=False, max_length=150)
    last_name     = serializers.CharField(required=False, max_length=150)
    date_of_birth = serializers.DateField(required=False)
    gender        = serializers.ChoiceField(
        choices=User._meta.get_field('gender').choices,
        required=False
    )

    def validate(self, attrs):
        #attrs = super().validate(attrs)
        return attrs

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        # allauth si aspetta password in 'password1'
        data['password1']     = self.validated_data.get('password')
        data['first_name']    = self.validated_data.get('first_name', '')
        data['last_name']     = self.validated_data.get('last_name', '')
        data['date_of_birth'] = self.validated_data.get('date_of_birth', None)
        data['gender']        = self.validated_data.get('gender', '')
        return data

class CustomPasswordResetSerializer(_PasswordResetSerializer):
    def get_email_options(self):
        opts = super().get_email_options()
        opts.update({
            "from_email": settings.DEFAULT_FROM_EMAIL,
            
            "url_generator": custom_password_reset_url,
        })
        return opts
    
class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']



class UIStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UIState
        fields = ["scope", "state", "updated_at"]
