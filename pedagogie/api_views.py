from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import Matiere, Cours
from .serializers import MatiereSerializer, CoursSerializer
from .views import _cours_de_lutilisateur


class MatiereListAPIView(generics.ListAPIView):
    serializer_class = MatiereSerializer
    permission_classes = [AllowAny]
    queryset = Matiere.objects.all().order_by('nom')


class CoursListAPIView(generics.ListAPIView):
    serializer_class = CoursSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _cours_de_lutilisateur(self.request.user)


class CoursDetailAPIView(generics.RetrieveAPIView):
    serializer_class = CoursSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure the object is only retrievable if in the allowed queryset
        return _cours_de_lutilisateur(self.request.user)
