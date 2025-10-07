# views.py
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from .models import Project
from .serializers import MoleculeSerializer, ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated

class MoleculeViewSet(viewsets.ModelViewSet):
    """
    /api/projects/{project_pk}/molecules/
    /api/projects/{project_pk}/molecules/{pk}/
    """
    serializer_class    = MoleculeSerializer
    permission_classes  = [IsProjectOwnerOrReadOnly]

    def get_project(self):
        # 1) prendo il project_pk dalla URL e controllo che sia tuo
        return get_object_or_404(
            Project,
            pk=self.kwargs['project_pk'],
            user=self.request.user
        )

    def get_queryset(self):
        # 2) filtro solo le molecole di quel progetto
        project = self.get_project()
        return project.molecules.all()

    def perform_create(self, serializer):
        # 3) assegno al salvataggio sempre il project corretto
        serializer.save(project=self.get_project())


class ProjectViewSet(viewsets.ModelViewSet):
    """
    /api/projects/
    /api/projects/{pk}/
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        # Mostra solo i progetti dell'utente loggato
        print("OOOOOO")
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Quando crei un nuovo progetto, assegna sempre l'utente corrente
        serializer.save(user=self.request.user)