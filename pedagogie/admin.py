from django.contrib import admin
from .models import Sequence, Cours


class SequenceInline(admin.StackedInline):
	model = Sequence
	extra = 1
	ordering = ["ordre"]


@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
	list_display = ("titre", "matiere", "classe_scolaire", "serie", "statut_validation")
	list_filter = ("statut_validation", "classe_scolaire", "serie", "matiere")
	inlines = [SequenceInline]
