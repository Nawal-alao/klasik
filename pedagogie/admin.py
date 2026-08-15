from django.contrib import admin
from .models import Matiere, CoefficientMatiere, Cours, Sequence
from django.contrib import admin, messages
from evaluations.services import generer_examen_ia


@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ("nom",)
    search_fields = ("nom",)


class CoefficientMatiereInline(admin.TabularInline):
    model = CoefficientMatiere
    extra = 1

@admin.action(description="Générer un examen via IA (Cohere)")
def generer_examen_action(modeladmin, request, queryset):
    for cours in queryset:
        try:
            examen = generer_examen_ia(cours, nombre_questions=5)
            messages.success(
                request,
                f"Examen généré pour « {cours.titre} » ({examen.questions.count()} questions). "
                "Statut : en attente de validation.",
            )
        except Exception as erreur:
            messages.error(
                request,
                f"Échec de génération pour « {cours.titre} » : {erreur}",
            )


class SequenceInline(admin.StackedInline):
    model = Sequence
    extra = 1
    ordering = ["ordre"]


@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ("titre", "matiere", "classe_scolaire", "serie", "statut_validation")
    list_filter = ("statut_validation", "classe_scolaire", "serie", "matiere")
    search_fields = ("titre",)
    inlines = [SequenceInline]
    actions = [generer_examen_action]