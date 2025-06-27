from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class HelloProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": f"Ciao {request.user.username}, sei autenticato!"
        })

class HelloView(APIView):

    def get(self, request):
        return Response({
            "message": f"Hello world!"
        })


