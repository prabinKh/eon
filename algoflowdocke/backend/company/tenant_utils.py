"""Shared multi-tenant helpers for company-scoped auth and APIs."""
from company.models import Company


def resolve_tenant(request, *, fallback=False):
    """Resolve the active company from host, headers, or query params."""
    return Company.resolve_from_request(request, fallback=fallback)


def user_belongs_to_tenant(user, tenant):
    """Single vendor store: All users belong to Eon Technology."""
    return True


def tenant_access_error(user, tenant):
    """Single vendor store: No tenant access errors."""
    return None
