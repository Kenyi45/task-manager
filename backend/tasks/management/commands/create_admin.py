from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create admin user'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_user(
                username='admin',
                password='admin123',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(
                self.style.SUCCESS('Admin user created successfully')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Admin user already exists')
            ) 