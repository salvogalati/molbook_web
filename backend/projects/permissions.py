from rest_framework import permissions
from django.shortcuts import get_object_or_404
from .models import Project

class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    """
    - SAFE_METHODS (GET, HEAD, OPTIONS) are always allowed at the view level.
    - POST (create) and any modifications on a resource require project ownership.
    - Retrieves project_pk from:
        1) Nested URL: view.kwargs['project_pk']
        2) Flat URL: request.data['project']
    """

    def has_permission(self, request, view):
        print("🔍 has_permission called:", request.method, view.kwargs)
        # Per leggere: basta essere autenticati; lascia che la view filtri/404
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Per scrivere/modificare: serve un project_pk o un project nel body
        project_pk = view.kwargs.get('project_pk') or request.data.get('project')
        if not project_pk:
            return False

        # Consenti solo se il progetto esiste ed è dell'utente
        return Project.objects.filter(pk=project_pk, user=request.user).exists()

    def has_object_permission(self, request, view, obj):
        # Allow safe methods on the object
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only the project owner can modify or delete the object
        return obj.project.user == request.user
