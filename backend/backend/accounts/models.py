# backend/accounts/models.py
from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, PermissionsMixin, BaseUserManager
)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email è obbligatoria")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email         = models.EmailField(unique=True)
    first_name    = models.CharField(max_length=150, blank=True)
    last_name     = models.CharField(max_length=150, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender        = models.CharField(max_length=1, choices=(
                       ('M','Male'),('F','Female'),('O','Other')
                   ), blank=True)
    is_active     = models.BooleanField(default=True)
    is_staff      = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []      # nessun altro campo obbligatorio via createsuperuser


class UIState(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    # opzionale: scindere tra device o workspace diversi
    scope = models.CharField(max_length=64, default="projects_dashboard")
    state = models.JSONField(default=dict)  # { "tabs": [...], "activeIndex": 0, "version": 3 }
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "scope")
