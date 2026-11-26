from django.core.management.base import BaseCommand
from company.models import Company, FooterSettings, CompanyGalleryImage
from account.models import MyUser
import urllib.request
from django.core.files.base import ContentFile

class Command(BaseCommand):
    help = 'Sets up the database for a single electronics company.'

    def handle(self, *args, **kwargs):
        # Wipe out all companies
        Company.objects.all().delete()
        self.stdout.write("Deleted all existing companies.")

        # Create exactly one Electronics Company
        company = Company.objects.create(
            name="Eon Technology Pvt. Ltd.",
            category="Electronics & Technology",
            description="Secure. Sound. Play. - Powering Protection, Precision, and Performance.",
            slug="eon-technology",
            admin_email="prabin@gmail.com"
        )
        # Download and set the logo
        logo_url = "http://demo.neoteric.com.np/media/bnejumgd/eontechnology-logo.png"
        company.logo = logo_url
        company.save()

        # Update the owner if the user exists
        user = MyUser.objects.filter(email="prabin@gmail.com").first()
        if user:
            user.company = company
            user.save()
            company.owner = user
            company.save()
            self.stdout.write("Assigned prabin@gmail.com as the company owner.")

        # Setup basic footer settings
        FooterSettings.objects.create(
            company=company,
            company_name="Eon Technology Pvt. Ltd.",
            email="contact@eontechnology.com"
        )

        self.stdout.write(self.style.SUCCESS('Successfully configured Eon Technology platform!'))
