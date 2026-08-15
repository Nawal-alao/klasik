from django.urls import path

from .views import ListeExamensDisponiblesView, ResultatExamenDetailView

app_name = "evaluations"

urlpatterns = [
    path("examens/", ListeExamensDisponiblesView.as_view(), name="liste_examens"),
    path("resultat/<int:pk>/", ResultatExamenDetailView.as_view(), name="resultat_examen"),
]
