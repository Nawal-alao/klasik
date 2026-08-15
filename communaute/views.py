from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView, ListView, View
from django.shortcuts import get_object_or_404, redirect

from .models import GroupeEtude, Message, MotInterdit, Signalement
import string


class ListeGroupesView(LoginRequiredMixin, ListView):
    model = GroupeEtude
    template_name = "communaute/liste_groupes.html"
    context_object_name = "groupes"

    def get_queryset(self):
        eleve = self.request.user.profil_eleve
        return GroupeEtude.objects.filter(
            classe_scolaire=eleve.classe_scolaire,
            serie=eleve.serie,
        ).select_related("matiere").order_by("matiere__nom", "nom")


class DetailGroupeView(LoginRequiredMixin, DetailView):
    model = GroupeEtude
    template_name = "communaute/detail_groupe.html"
    context_object_name = "groupe"

    def get_queryset(self):
        eleve = self.request.user.profil_eleve
        return GroupeEtude.objects.filter(
            classe_scolaire=eleve.classe_scolaire,
            serie=eleve.serie,
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["messages"] = self.object.messages.filter(
            statut=Message.Statut.VISIBLE,
        ).select_related("auteur").order_by("date_envoi")
        return context

class EnvoyerMessageView(LoginRequiredMixin, View):

    def post(self, request, *args, **kwargs):
        groupe = get_object_or_404(GroupeEtude, pk=kwargs["pk"])
        contenu = request.POST.get("contenu", "").strip()

        if contenu:
            mots_interdits = set(MotInterdit.objects.values_list("mot", flat=True))
            mots_interdits = {m.lower() for m in mots_interdits}

            mots_du_message = {
                mot.strip(string.punctuation).lower()
                for mot in contenu.split()
            }

            contient_mot_interdit = bool(mots_interdits & mots_du_message)

            statut = Message.Statut.EN_ATTENTE if contient_mot_interdit else Message.Statut.VISIBLE

            Message.objects.create(
                groupe=groupe,
                auteur=request.user,
                contenu=contenu,
                statut=statut,
                traite_par_ia=False,
            )

        return redirect("communaute:detail_groupe", pk=groupe.pk)


from django.contrib import messages


class SignalerMessageView(LoginRequiredMixin, View):

    SEUIL_ALERTE = 3

    def post(self, request, *args, **kwargs):
        message = get_object_or_404(Message, pk=kwargs["pk"])
        motif = request.POST.get("motif", "").strip()

        signalement, cree = Signalement.objects.get_or_create(
            message=message,
            signale_par=request.user,
            defaults={"motif": motif},
        )

        if cree:
            messages.success(request, "Votre signalement a bien été enregistré.")

            nombre_signalements = message.signalements.count()
            if nombre_signalements >= self.SEUIL_ALERTE and message.statut == Message.Statut.VISIBLE:
                message.statut = Message.Statut.SIGNALE
                message.save()
        else:
            messages.info(request, "Vous avez déjà signalé ce message.")

        return redirect("communaute:detail_groupe", pk=message.groupe.pk)