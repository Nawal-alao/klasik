from django.db import migrations


def forwards(apps, schema_editor):
    GroupeEtude = apps.get_model("communaute", "GroupeEtude")
    GroupeEtude.objects.filter(statut_validation="EN_ATTENTE").update(statut_validation="VALIDE")


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("communaute", "0004_groupeetude_cree_par_groupeetude_statut_validation"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
