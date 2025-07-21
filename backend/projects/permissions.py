# permissions.py
from rest_framework import permissions

class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS:
            return True

        # Il proprietario del progetto può scrivere/modificare/cancellare
        return obj.project.user == request.user
