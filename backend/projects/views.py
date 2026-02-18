# views.py
from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets, status
from .models import Project
from .serializers import MoleculeSerializer, ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

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

    @action(detail=False, methods=['post'])
    def columns(self, request, project_pk=None):
        project = self.get_project()
        new_columns = request.data.get("new_columns", [])
        for mol in project.molecules.all():
            for col in new_columns:
                if col not in mol.extra_data:
                    mol.extra_data[col] = ""  # valore default
            mol.save()
        return Response({"status": "columns added"})

    @action(detail=False, methods=['post'])
    def remove_column(self, request, project_pk=None):
        """
        Rimuove una colonna dinamica da tutte le molecole del progetto
        """
        project = self.get_project()
        column_to_remove = request.data.get("column_name")
        if not column_to_remove:
            return Response({"error": "column_name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Cicla tutte le molecole e rimuove la chiave da extra_data
        for mol in project.molecules.all():
            if column_to_remove in mol.extra_data:
                del mol.extra_data[column_to_remove]
                mol.save()

        return Response({"status": f"Column '{column_to_remove}' removed"})


    # def partial_update(self, request, *args, **kwargs):
    # INTERCETTA LE PATCH E STAMPA I DATI INVIATI (per debug)
    #     print("Partial update called with data:", request.data)


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

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                serializer.save(user=self.request.user)
        except IntegrityError:
            # 400 Bad Request con errore sul campo name
            raise ValidationError({"error": "A project with this name already exists."})

    def perform_update(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except IntegrityError:
            raise ValidationError({"error": "A project with this name already exists."})