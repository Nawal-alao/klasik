from django.urls import path
from .views import (
    InscriptionEleveView,
    InscriptionMentorView,
    ConnexionView,
    DeconnexionView,
)

app_name = "comptes"

urlpatterns = [
    path("inscription/eleve/", InscriptionEleveView.as_view(), name="inscription_eleve"),
    path("inscription/mentor/", InscriptionMentorView.as_view(), name="inscription_mentor"),
    path("connexion/", ConnexionView.as_view(), name="connexion"),
    path("deconnexion/", DeconnexionView.as_view(), name="deconnexion"),
]