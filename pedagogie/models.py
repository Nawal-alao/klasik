from django.db import models
from ckeditor_uploader.fields import RichTextUploadingField


# CHOIX PARTAGÉS (classe scolaire, série)
class ClasseScolaire(models.TextChoices):
	SIXIEME = "6EME", "Sixième"
	CINQUIEME = "5EME", "Cinquième"
	QUATRIEME = "4EME", "Quatrième"
	TROISIEME = "3EME", "Troisième"
	SECONDE = "2ND", "Seconde"
	PREMIERE = "1ERE", "Première"
	TERMINALE = "TLE", "Terminale"


class Serie(models.TextChoices):
	AUCUNE = "AUCUNE", "Aucune (collège)"
	A = "A", "Série A"
	B = "B", "Série B"
	C = "C", "Série C"
	D = "D", "Série D"


class Matiere(models.Model):
	nom = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)

	def __str__(self):
		return self.nom


class CoefficientMatiere(models.Model):
	matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="coefficients")
	serie = models.CharField(max_length=10, choices=Serie.choices)
	coefficient = models.PositiveSmallIntegerField(default=1)

	class Meta:
		unique_together = ("matiere", "serie")

	def __str__(self):
		return f"{self.matiere} - {self.serie} (coef {self.coefficient})"


class Cours(models.Model):
	class StatutValidation(models.TextChoices):
		EN_ATTENTE = "EN_ATTENTE", "En attente"
		VALIDE = "VALIDE", "Validé"
		REJETE = "REJETE", "Rejeté"

	titre = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="cours")
	classe_scolaire = models.CharField(max_length=10, choices=ClasseScolaire.choices)
	serie = models.CharField(max_length=10, choices=Serie.choices, default=Serie.AUCUNE)
	contenu = models.TextField(help_text="Contenu du cours généré par l'IA.")
	source_manuel = models.CharField(max_length=255, blank=True, help_text="Référence du manuel officiel source.")
	statut_validation = models.CharField(
		max_length=10, choices=StatutValidation.choices, default=StatutValidation.EN_ATTENTE
	)
	professeur_validateur = models.ForeignKey(
		'auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name="cours_valides"
	)
	date_creation = models.DateTimeField(auto_now_add=True)
	date_validation = models.DateTimeField(null=True, blank=True)

	def __str__(self):
		return f"{self.titre} ({self.classe_scolaire}/{self.serie})"


class Sequence(models.Model):
    """
    Une sous-partie d'un Cours. Contenu riche via CKEditor.
    """
    cours = models.ForeignKey(Cours, on_delete=models.CASCADE, related_name="sequences")
    titre = models.CharField(max_length=200)
    ordre = models.PositiveSmallIntegerField(help_text="Position de la séquence dans le cours (1, 2, 3...).")
    contenu = RichTextUploadingField()

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return f"{self.cours.titre} — Séquence {self.ordre}: {self.titre}"


class Progression(models.Model):
	eleve = models.ForeignKey('comptes.Eleve', on_delete=models.CASCADE, related_name="progressions")
	matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="progressions")
	niveau_maitrise = models.DecimalField(
		max_digits=5, decimal_places=2, default=0,
		help_text="Score de maîtrise global sur cette matière (0 à 100)."
	)
	notions_faibles = models.JSONField(
		default=list, blank=True,
		help_text="Liste des notions où l'élève est en difficulté (calculé depuis ReponseEleve)."
	)
	derniere_mise_a_jour = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ("eleve", "matiere")

	def recalculer(self):
		from evaluations.models import ReponseEleve

		reponses = ReponseEleve.objects.filter(
			eleve=self.eleve,
			question__examen__cours__matiere=self.matiere,
		)
		total = reponses.count()
		if total == 0:
			self.niveau_maitrise = 0
			self.notions_faibles = []
		else:
			correctes = reponses.filter(correct=True).count()
			self.niveau_maitrise = (correctes / total) * 100

			notions = reponses.values("question__notion").distinct()
			notions_faibles = []
			for n in notions:
				notion = n["question__notion"]
				reponses_notion = reponses.filter(question__notion=notion)
				taux_reussite = reponses_notion.filter(correct=True).count() / reponses_notion.count()
				if taux_reussite < 0.5:
					notions_faibles.append(notion)
			self.notions_faibles = notions_faibles

		self.save()

	def __str__(self):
		return f"Progression {self.eleve} - {self.matiere} ({self.niveau_maitrise}%)"
