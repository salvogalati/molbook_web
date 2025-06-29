# backend/accounts/admin.py

from django.contrib import admin
from .models import User  # importa il tuo modello custom

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
