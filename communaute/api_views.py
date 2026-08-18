from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import GroupeEtude, Message, Signalement, MessagePrive
from .serializers import (
    GroupeSerializer, GroupeDetailSerializer, MessageSerializer,
    SignalementSerializer, MessagePriveSerializer,
)
from .services import contient_mot_interdit
from .views import _groupes_de_lutilisateur, _suivis_de_lutilisateur
from django.contrib.auth.models import User


class GroupesListAPIView(generics.ListAPIView):
    serializer_class = GroupeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return _groupes_de_lutilisateur(self.request.user).select_related('matiere').order_by('matiere__nom', 'nom')


class GroupeDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        groupe = get_object_or_404(_groupes_de_lutilisateur(request.user), pk=pk)
        # Only include VISIBLE messages
        messages = groupe.messages.filter(statut=Message.Statut.VISIBLE).select_related('auteur').order_by('date_envoi')
        # Attach messages under a key to use GroupeDetailSerializer compatibility
        data = GroupeSerializer(groupe).data
        data['messages'] = MessageSerializer(messages, many=True).data
        return Response(data)


class EnvoyerMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        groupe = get_object_or_404(GroupeEtude, pk=pk)
        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'detail': 'Contenu requis.'}, status=status.HTTP_400_BAD_REQUEST)

        contient = contient_mot_interdit(contenu)
        statut = Message.Statut.EN_ATTENTE if contient else Message.Statut.VISIBLE

        message = Message.objects.create(
            groupe=groupe,
            auteur=request.user,
            contenu=contenu,
            statut=statut,
            traite_par_ia=False,
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SignalerMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]
    SEUIL_ALERTE = 3

    def post(self, request, pk):
        message = get_object_or_404(Message, pk=pk)
        motif = request.data.get('motif', '').strip()
        signalement, created = Signalement.objects.get_or_create(
            message=message,
            signale_par=request.user,
            defaults={'motif': motif},
        )

        if created:
            # Update message statut if threshold reached
            nombre = message.signalements.count()
            if nombre >= self.SEUIL_ALERTE and message.statut == Message.Statut.VISIBLE:
                message.statut = Message.Statut.SIGNALE
                message.save()
            return Response(SignalementSerializer(signalement).data, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'Vous avez déjà signalé ce message.'}, status=status.HTTP_200_OK)


class ConversationsListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        suivis = _suivis_de_lutilisateur(request.user).select_related('eleve', 'mentor', 'matiere')
        # Simple representation
        data = []
        for s in suivis:
            data.append({
                'id': s.id,
                'eleve': f"{s.eleve.prenom} {s.eleve.nom}",
                'mentor': f"{s.mentor.prenom} {s.mentor.nom}",
                'matiere': s.matiere.nom,
            })
        return Response(data)


class ConversationDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        suivi = get_object_or_404(_suivis_de_lutilisateur(request.user), pk=pk)
        messages = suivi.messages_prives.filter(statut=MessagePrive.Statut.VISIBLE).select_related('auteur')
        serializer = MessagePriveSerializer(messages, many=True)
        return Response({'suivi_id': suivi.id, 'messages': serializer.data})


class EnvoyerMessagePriveAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        suivi = get_object_or_404(_suivis_de_lutilisateur(request.user), pk=pk)
        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'detail': 'Contenu requis.'}, status=status.HTTP_400_BAD_REQUEST)

        statut = MessagePrive.Statut.EN_ATTENTE if contient_mot_interdit(contenu) else MessagePrive.Statut.VISIBLE
        msg = MessagePrive.objects.create(suivi=suivi, auteur=request.user, contenu=contenu, statut=statut)

        serializer = MessagePriveSerializer(msg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
