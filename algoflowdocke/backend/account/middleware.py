from company.models import Company

class TenantMiddleware:
    """
    Attach request.company for every API request.
    Single-vendor architecture: always resolves to the single Company.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Force single-tenant: always use the first company
        request.company = Company.objects.first()

        response = self.get_response(request)
        return response
