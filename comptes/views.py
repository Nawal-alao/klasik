from django.contrib.auth.models import User
from django.views.generic import CreateView
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from .models import Eleve, Mentor

class InscriptionEleveView(CreateView):
    model = Eleve
    fields = ["prenom", "nom", "age", "classe_scolaire", "serie"]
    template_name = "comptes/inscription_eleve.html"
    success_url = reverse_lazy("comptes:connexion")  # à adapter selon ton urls.py

    def form_valid(self, form):
        # Étape 1 : créer le User d'abord (Django gère le hachage du mot de passe)
        user = User.objects.create_user(
            username=self.request.POST.get("username"),
            password=self.request.POST.get("password"),
        )
        # Étape 2 : lier ce User à l'Eleve en cours de création, avant sauvegarde
        form.instance.utilisateur = user

        # Étape 3 : laisser Django terminer (sauvegarde + redirection)
        return super().form_valid(form)


class InscriptionMentorView(CreateView):
    model = Mentor
    fields = ["prenom", "nom", "bio", "matieres"]
    template_name = "comptes/inscription_mentor.html"
    success_url = reverse_lazy("comptes:connexion")  # à adapter selon ton urls.py

    def form_valid(self, form):
        # Étape 1 : créer le User d'abord (Django gère le hachage du mot de passe)
        user = User.objects.create_user(
            username=self.request.POST.get("username"),
            password=self.request.POST.get("password"),
        )
        # Étape 2 : lier ce User au Mentor en cours de création, avant sauvegarde
        form.instance.utilisateur = user

        # Étape 3 : laisser Django terminer (sauvegarde + redirection)
        return super().form_valid(form)

class ConnexionView(LoginView):
    template_name = "comptes/connexion.html"

    def get_success_url(self):
        user = self.request.user
        if hasattr(user, "profil_eleve"):
            return reverse_lazy("dashboard:dashboard_eleve")
        elif hasattr(user, "profil_mentor"):
            return reverse_lazy("dashboard:dashboard_mentor")
        return reverse_lazy("dashboard:accueil")  # sécurité si aucun profil trouvé

class DeconnexionView(LogoutView):
    next_page = "dashboard:accueil"