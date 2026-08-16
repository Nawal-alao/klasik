from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class AccueilView(TemplateView):
    template_name = "dashboard/accueil.html"


class DashboardEleveView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard_eleve.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        eleve = self.request.user.profil_eleve
        context["eleve"] = eleve
        context["progressions"] = eleve.progressions.all()
        context["abonnement"] = eleve.abonnements.filter(statut="ACTIF").first()
        # NOUVEAU: mentors suivis
        context["suivis_mentors"] = eleve.suivis_mentors.filter(actif=True).select_related(
            "mentor", "matiere"
        )
        return context


class DashboardMentorView(LoginRequiredMixin, TemplateView):
    template_name = "dashboard/dashboard_mentor.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        mentor = self.request.user.profil_mentor

        # Relation réelle : Mentor -> SuiviMentor -> Eleve
        suivis = mentor.suivis.select_related("eleve", "matiere").all()

        context["mentor"] = mentor
        context["suivis"] = suivis
        context["eleves"] = [suivi.eleve for suivi in suivis]
        context["suivis_actifs"] = suivis.filter(actif=True)
        context["note_moyenne"] = mentor.note_moyenne
        return context