import random
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.http import HttpResponse
from io import BytesIO
import time

from rdkit import Chem
from rdkit.Chem import Draw


class HelloView(APIView):
    """Public endpoint returning a simple greeting."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Hello world!"
        })


class HelloProtectedView(APIView):
    """Protected endpoint; requires authentication."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": f"Ciao {request.user.username}, sei autenticato!"
        })


class MoleculeImageView(APIView):
    """Generates a PNG image of the molecule from a SMILES string."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve the SMILES parameter
        smiles = request.query_params.get('smiles')
        print(smiles)
        if not smiles:
            return Response(
                {"detail": "Missing 'smiles' parameter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert SMILES to RDKit Mol object
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return Response(
                {"detail": "Invalid SMILES string."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate 300x300 image
        img = Draw.MolToImage(mol, size=(300, 300))
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        #time.sleep(random.randint(1, 3))

        # Return the image as HTTP response
        return HttpResponse(
            buffer.getvalue(),
            content_type="image/png"
        )
