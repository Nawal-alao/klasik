from rest_framework import serializers
from .models import Matiere, Cours, Sequence


class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'description']


class SequenceSerializer(serializers.ModelSerializer):
    # NOTE for frontend: `contenu` contains rich HTML. The frontend must
    # sanitize or render it safely (e.g. using a trusted HTML renderer) and
    # must NOT blindly use React's `dangerouslySetInnerHTML` without
    # validating/sanitizing the content first.
    contenu = serializers.CharField()

    class Meta:
        model = Sequence
        fields = ['id', 'titre', 'ordre', 'contenu']


class CoursSerializer(serializers.ModelSerializer):
    sequences = SequenceSerializer(many=True, read_only=True)

    class Meta:
        model = Cours
        fields = ['id', 'titre', 'description', 'matiere', 'classe_scolaire', 'serie', 'contenu', 'statut_validation', 'sequences']
        read_only_fields = ['id', 'statut_validation', 'sequences']
