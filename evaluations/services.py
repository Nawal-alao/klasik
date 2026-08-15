"""
Nouveau fichier : evaluations/services.py
============================================================================
Logique métier de génération d'examen par IA (Cohere), isolée du code
d'admin, exactement comme Progression.recalculer() est isolée de la vue
qui l'appelle. N'importe quel endroit du projet (admin, commande, vue
future) peut réutiliser cette fonction sans dupliquer de code.

INSTALLATION :
    pip install cohere

Dans settings.py, ajoute (ne mets jamais la clé en dur dans le code) :
    import os
    COHERE_API_KEY = os.environ.get("COHERE_API_KEY")
"""

import json
import re
import cohere
from django.conf import settings
from django.utils import timezone

from .models import Examen, Question


def _texte_brut(contenu_html):
    """
    Retire les balises HTML d'une séquence (contenu CKEditor) pour
    obtenir un texte simple à envoyer au modèle. Volontairement basique
    (regex) plutôt qu'une vraie librairie de parsing HTML, suffisant
    pour construire un prompt.
    """
    sans_balises = re.sub(r"<[^>]+>", " ", contenu_html)
    return re.sub(r"\s+", " ", sans_balises).strip()


SCHEMA_REPONSE = {
    "type": "object",
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "enonce": {"type": "string"},
                    "notion": {
                        "type": "string",
                        "description": "Thème précis évalué, ex: 'équations du second degré'",
                    },
                    "choix": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Exactement 4 propositions de réponse.",
                    },
                    "bonne_reponse": {
                        "type": "string",
                        "description": "Doit correspondre exactement à l'une des valeurs de 'choix'.",
                    },
                },
                "required": ["enonce", "notion", "choix", "bonne_reponse"],
            },
        }
    },
    "required": ["questions"],
}

PROMPT_SYSTEME = """Tu es un professeur qui conçoit des questions d'examen pour des élèves \
du système éducatif béninois. Ta priorité absolue : évaluer la COMPRÉHENSION et la capacité \
à appliquer une notion, jamais la simple mémorisation ou le rappel littéral d'une phrase du cours.

Règles strictes :
- Ne pose jamais une question qui se résout en retrouvant une phrase copiée-collée du cours.
- Privilégie des mises en situation, des cas à raisonner, des applications concrètes de la notion.
- Chaque question doit avoir exactement 4 choix, tous plausibles (pas de réponse absurde qui \
se repère sans comprendre le cours).
- Reste strictement dans le contenu fourni, n'invente aucune notion hors programme.
- Réponds uniquement en JSON, structuré selon le schéma demandé."""


def generer_examen_ia(cours, nombre_questions=5, utilisateur_createur=None):
    """
    Génère un Examen + ses Question via Cohere, à partir du contenu des
    Sequence d'un Cours. L'examen créé a le statut EN_ATTENTE : il reste
    invisible aux élèves tant qu'un professeur ne le valide pas dans l'admin.

    Retourne l'objet Examen créé.
    Lève une exception si Cohere échoue ou renvoie un JSON invalide —
    volontairement laissée remonter, pour que l'admin voie clairement
    que la génération a échoué plutôt que de créer un examen à moitié vide.
    """
    sequences = cours.sequences.all()
    contenu_complet = "\n\n".join(
        f"Séquence {s.ordre} — {s.titre} :\n{_texte_brut(s.contenu)}"
        for s in sequences
    )

    if not contenu_complet.strip():
        raise ValueError(
            f"Le cours « {cours.titre} » n'a aucune séquence avec du contenu, "
            "impossible de générer un examen dessus."
        )

    client = cohere.ClientV2(api_key=settings.COHERE_API_KEY)

    message_utilisateur = (
        f"Génère un JSON avec {nombre_questions} questions à choix multiple, "
        f"en français, portant sur ce cours de {cours.matiere.nom} "
        f"({cours.get_classe_scolaire_display()}) :\n\n{contenu_complet}"
    )

    reponse = client.chat(
        model="command-r-plus-08-2024",
        messages=[
            {"role": "system", "content": PROMPT_SYSTEME},
            {"role": "user", "content": message_utilisateur},
        ],
        response_format={
            "type": "json_object",
            "json_schema": SCHEMA_REPONSE,
        },
    )

    donnees = json.loads(reponse.message.content[0].text)

    examen = Examen.objects.create(
        titre=f"Examen — {cours.titre}",
        cours=cours,
        type_generation=Examen.TypeGeneration.IA,
        statut_validation=Examen.StatutValidation.EN_ATTENTE,
        date_publication=timezone.now(),
    )

    for q in donnees["questions"]:
        Question.objects.create(
            examen=examen,
            enonce=q["enonce"],
            type_question=Question.Type.CHOIX_MULTIPLE,
            notion=q["notion"],
            choix_reponses=q["choix"],
            bonne_reponse=q["bonne_reponse"],
        )

    return examen