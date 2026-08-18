from django.contrib import admin
from .models import GroupeEtude, Message, Signalement, MotInterdit


@admin.register(GroupeEtude)
class GroupeEtudeAdmin(admin.ModelAdmin):
    list_display = ("nom", "matiere", "classe_scolaire", "serie", "statut_validation", "cree_par")
    list_filter = ("classe_scolaire", "serie", "matiere", "statut_validation")
    search_fields = ("nom",)
    actions = ["valider_groupes_selectionnes"]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.statut_validation = GroupeEtude.StatutValidation.VALIDE
        super().save_model(request, obj, form, change)

    @admin.action(description="Valider les groupes sélectionnés")
    def valider_groupes_selectionnes(self, request, queryset):
        count = queryset.filter(statut_validation=GroupeEtude.StatutValidation.EN_ATTENTE).update(
            statut_validation=GroupeEtude.StatutValidation.VALIDE
        )
        self.message_user(request, f"{count} groupe(s) validé(s).")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("auteur", "groupe", "statut", "date_envoi", "score_risque")
    list_filter = ("statut", "groupe")
    search_fields = ("contenu",)


@admin.register(Signalement)
class SignalementAdmin(admin.ModelAdmin):
    list_display = ("message", "signale_par", "motif", "date_signalement")
    list_filter = ("date_signalement",)


@admin.register(MotInterdit)
class MotInterditAdmin(admin.ModelAdmin):
    list_display = ("mot",)
    search_fields = ("mot",)