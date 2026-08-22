from rest_framework import serializers
from .models import Examen, Question, Resultat, ReponseEleve, Progression
from pedagogie.serializers import MatiereSerializer
from pedagogie.models import Matiere


class ExamenCoursSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    titre = serializers.CharField()


class ExamenSerializer(serializers.ModelSerializer):
    niveau_difficulte = serializers.CharField()
    cours = serializers.SerializerMethodField()
    matiere = serializers.SerializerMethodField()

    class Meta:
        model = Examen
        fields = ['id', 'titre', 'niveau_difficulte', 'cours', 'matiere', 'date_publication']

    def get_cours(self, obj):
        return {'id': obj.cours.id, 'titre': obj.cours.titre}

    def get_matiere(self, obj):
        return {'id': obj.cours.matiere.id, 'nom': obj.cours.matiere.nom}


class QuestionSerializer(serializers.ModelSerializer):
    # Never expose `bonne_reponse` here for students before correction
    class Meta:
        model = Question
        fields = ['id', 'enonce', 'type_question', 'choix_reponses', 'notion']


class QuestionCorrectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'enonce', 'type_question', 'choix_reponses', 'notion', 'bonne_reponse']


class ReponseEleveDetailSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)

    class Meta:
        model = ReponseEleve
        fields = ['id', 'question', 'reponse_donnee', 'correct', 'date_reponse']


class ResultatSerializer(serializers.ModelSerializer):
    eleve = serializers.PrimaryKeyRelatedField(read_only=True)
    examen = ExamenSerializer(read_only=True)
    reponses = serializers.SerializerMethodField()

    class Meta:
        model = Resultat
        fields = ['id', 'eleve', 'examen', 'note', 'date_passage', 'reponses']

    def get_reponses(self, obj):
        reponses = ReponseEleve.objects.filter(eleve=obj.eleve, question__examen=obj.examen).select_related('question').order_by('question__id')
        return ReponseEleveDetailSerializer(reponses, many=True).data


class ProgressionSerializer(serializers.ModelSerializer):
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)

    class Meta:
        model = Progression
        fields = ['id', 'matiere', 'matiere_nom', 'niveau_maitrise', 'notions_faibles', 'derniere_mise_a_jour']
