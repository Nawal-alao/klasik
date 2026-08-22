from django.db import models


class Abonnement(models.Model):
	class Statut(models.TextChoices):
		ACTIF = "ACTIF", "Actif"
		EXPIRE = "EXPIRE", "Expiré"
		ANNULE = "ANNULE", "Annulé"

	class Formule(models.TextChoices):
		MENSUEL = "MENSUEL", "Mensuel"
		ANNUEL = "ANNUEL", "Annuel"

	eleve = models.ForeignKey('comptes.Eleve', on_delete=models.CASCADE, related_name="abonnements")
	formule = models.CharField(max_length=10, choices=Formule.choices)
	statut = models.CharField(max_length=10, choices=Statut.choices, default=Statut.ACTIF)
	date_debut = models.DateTimeField(auto_now_add=True)
	date_fin = models.DateTimeField()

	def __str__(self):
		return f"Abonnement {self.eleve} ({self.statut})"
