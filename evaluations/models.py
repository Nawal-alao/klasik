from django.db import models


class Examen(models.Model):
	class TypeGeneration(models.TextChoices):
		IA = "IA", "Généré par IA"
		MANUEL = "MANUEL", "Créé par un mentor/professeur"

	titre = models.CharField(max_length=200)
	cours = models.ForeignKey('pedagogie.Cours', on_delete=models.CASCADE, related_name="examens")
	type_generation = models.CharField(max_length=10, choices=TypeGeneration.choices)
	date_publication = models.DateTimeField()

	def __str__(self):
		return self.titre


class Question(models.Model):
	class Type(models.TextChoices):
		CHOIX_MULTIPLE = "QCM", "Choix multiple"
		REPONSE_LIBRE = "LIBRE", "Réponse libre"

	examen = models.ForeignKey(Examen, on_delete=models.CASCADE, related_name="questions")
	enonce = models.TextField()
	type_question = models.CharField(max_length=10, choices=Type.choices, default=Type.CHOIX_MULTIPLE)
	notion = models.CharField(
		max_length=150,
		help_text="Notion/thème précis (ex: 'Équations du second degré') pour le diagnostic fin."
	)
	choix_reponses = models.JSONField(null=True, blank=True, help_text="Liste des choix si QCM.")
	bonne_reponse = models.CharField(max_length=500)

	def __str__(self):
		return f"{self.enonce[:50]}..."


class Resultat(models.Model):
	eleve = models.ForeignKey('comptes.Eleve', on_delete=models.CASCADE, related_name="resultats")
	examen = models.ForeignKey(Examen, on_delete=models.CASCADE, related_name="resultats")
	note = models.DecimalField(max_digits=5, decimal_places=2)
	date_passage = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ("eleve", "examen")

	def __str__(self):
		return f"{self.eleve} - {self.examen} : {self.note}"


class ReponseEleve(models.Model):
	eleve = models.ForeignKey('comptes.Eleve', on_delete=models.CASCADE, related_name="reponses")
	question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="reponses")
	reponse_donnee = models.CharField(max_length=500)
	correct = models.BooleanField()
	date_reponse = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.eleve} -> {self.question} ({'OK' if self.correct else 'KO'})"
