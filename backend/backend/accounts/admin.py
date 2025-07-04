# backend/accounts/admin.py

from django.contrib import admin
from .models import User  # importa il tuo modello custom
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
#     search_fields = ('email', 'first_name', 'last_name')

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'date_of_birth', 'gender')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        # NESSUN username, nessun date_joined!
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'date_of_birth', 'gender', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}
        ),
    )