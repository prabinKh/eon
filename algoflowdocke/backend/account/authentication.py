from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
import logging
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads token from cookies or Authorization header.
    Gracefully handles invalid or expired tokens by treating the user as unauthenticated (None)
    so public storefront endpoints (AllowAny) do not return 401 for visitors with stale tokens.
    """
    def authenticate(self, request):
        # 1. Try cookie first
        access_token = request.COOKIES.get('access_token')
        if access_token:
            try:
                validated_token = self.get_validated_token(access_token)
                user = self.get_user(validated_token)
                if user.is_active:
                    return (user, validated_token)
            except Exception as e:
                logger.debug(f"Cookie token validation failed: {e}")

        # 2. Try Authorization header
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            if not user.is_active:
                return None
            return (user, validated_token)
        except Exception as e:
            logger.debug(f"Header token validation failed: {e}")
            # Do NOT raise AuthenticationFailed on public endpoints;
            # return None so DRF treats user as AnonymousUser and lets AllowAny views work.
            return None