from rest_framework import viewsets
from .models import Molecule
from .serializers import MoleculeSerializer

class MoleculeViewSet(viewsets.ModelViewSet):
    queryset = Molecule.objects.all()
    serializer_class = MoleculeSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Molecule.objects.filter(project_id=project_id)
        return Molecule.objects.all()