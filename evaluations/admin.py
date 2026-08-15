from django.contrib import admin
from .models import Progression
 
 
@admin.action(description="Recalculer la progression sélectionnée")
def recalculer_progression(modeladmin, request, queryset):
    for progression in queryset:
        progression.recalculer()
 
 
@admin.register(Progression)
class ProgressionAdmin(admin.ModelAdmin):
    list_display = ("eleve", "matiere", "niveau_maitrise", "derniere_mise_a_jour")
    list_filter = ("matiere",)
    actions = [recalculer_progression]
 