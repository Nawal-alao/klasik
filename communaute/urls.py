from django.urls import path

from .views import DetailGroupeView, EnvoyerMessageView, ListeGroupesView, SignalerMessageView

app_name = "communaute"

urlpatterns = [
    path("groupes/", ListeGroupesView.as_view(), name="liste_groupes"),
    path("groupes/<int:pk>/", DetailGroupeView.as_view(), name="detail_groupe"),
    path("groupes/<int:pk>/envoyer-message/", EnvoyerMessageView.as_view(), name="envoyer_message"),
    path("messages/<int:pk>/signaler/", SignalerMessageView.as_view(), name="signaler_message"),
]
