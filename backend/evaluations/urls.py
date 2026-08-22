from django.urls import path

from .views import ListeExamensDisponiblesView, PasserExamenView, ResultatExamenDetailView

app_name = "evaluations"

urlpatterns = [
    path("examens/", ListeExamensDisponiblesView.as_view(), name="liste_examens"),
    path("examens/<int:pk>/passer/", PasserExamenView.as_view(), name="passer_examen"),
    path("resultat/<int:pk>/", ResultatExamenDetailView.as_view(), name="resultat_examen"),
]
