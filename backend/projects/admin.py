from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'user_email', 'created_at']  # colonne visibili

    def user_email(self, obj):
        return obj.user.email  # Mostra l'email dell'utente
    user_email.short_description = 'User Email'  # Nome colonna nell'interfaccia
