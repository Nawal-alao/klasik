from django.contrib import admin
from .models import GroupeEtude, Message, Signalement, MotInterdit


@admin.register(GroupeEtude)
class GroupeEtudeAdmin(admin.ModelAdmin):
    list_display = ("nom", "matiere", "classe_scolaire", "serie")
    list_filter = ("classe_scolaire", "serie", "matiere")
    search_fields = ("nom",)


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