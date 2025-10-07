from rest_framework import serializers
from .models import Molecule, Project

class MoleculeSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Molecule
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    molecules = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='last_updated', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'user', 'name', 'createdAt', 'updatedAt', 'molecules']
        read_only_fields = ['user', 'createdAt', 'updatedAt', 'molecules']

    def get_molecules(self, obj):
        return obj.molecules.count()