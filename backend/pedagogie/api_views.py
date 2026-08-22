from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Matiere, Cours, CoursTermine, CoursFavori
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


class MarquerCoursTermineAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        eleve = getattr(request.user, 'profil_eleve', None)
        if not eleve:
            return Response(
                {"detail": "Seuls les élèves peuvent marquer un cours comme terminé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        cours = get_object_or_404(
            _cours_de_lutilisateur(request.user), pk=pk
        )

        termine, created = CoursTermine.objects.get_or_create(
            eleve=eleve, cours=cours
        )
        if not created:
            termine.delete()
            return Response({"termine": False}, status=status.HTTP_200_OK)

        return Response({"termine": True}, status=status.HTTP_201_CREATED)


class AjouterAuxFavorisAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        eleve = getattr(request.user, 'profil_eleve', None)
        if not eleve:
            return Response(
                {"detail": "Seuls les élèves peuvent ajouter des cours en favoris."},
                status=status.HTTP_403_FORBIDDEN,
            )

        cours = get_object_or_404(
            _cours_de_lutilisateur(request.user), pk=pk
        )

        favori, created = CoursFavori.objects.get_or_create(
            eleve=eleve, cours=cours
        )
        if not created:
            favori.delete()
            return Response({"favori": False}, status=status.HTTP_200_OK)

        return Response({"favori": True}, status=status.HTTP_201_CREATED)


class CoursFavorisListAPIView(generics.ListAPIView):
    serializer_class = CoursSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        eleve = getattr(self.request.user, 'profil_eleve', None)
        if not eleve:
            return Cours.objects.none()
        return Cours.objects.filter(
            favori_par__eleve=eleve,
            statut_validation="VALIDE",
        )
