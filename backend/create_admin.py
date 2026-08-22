import os

import django


def main() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evoly.settings")
    django.setup()

    from django.contrib.auth import get_user_model

    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")

    if not username or not email or not password:
        print(
            "create_admin.py : variables DJANGO_SUPERUSER_* manquantes, "
            "superutilisateur non cree."
        )
        return

    user_model = get_user_model()

    if user_model.objects.filter(username=username).exists():
        print(f"create_admin.py : le superutilisateur '{username}' existe deja.")
        return

    user_model.objects.create_superuser(
        username=username, email=email, password=password
    )
    print(f"create_admin.py : superutilisateur '{username}' cree avec succes.")


if __name__ == "__main__":
    main()
