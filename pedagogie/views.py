from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView
from .models import Cours


class ListeCoursView(LoginRequiredMixin, ListView):
    model = Cours
    template_name = "pedagogie/liste_cours.html"
    context_object_name = "cours_liste"

    def get_queryset(self):
        eleve = self.request.user.profil_eleve
        return Cours.objects.filter(
            classe_scolaire=eleve.classe_scolaire,
            serie=eleve.serie,
            statut_validation="VALIDE",
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)  # récupère déjà cours_liste dedans
        context["prenom"] = self.request.user.profil_eleve.prenom
        return context


class DetailCoursView(LoginRequiredMixin, DetailView):
    model = Cours
    template_name = "pedagogie/detail_cours.html"
    context_object_name = "cours"

    def get_queryset(self):
        eleve = self.request.user.profil_eleve
        return Cours.objects.filter(
            classe_scolaire=eleve.classe_scolaire,
            serie=eleve.serie,
            statut_validation="VALIDE",
        )