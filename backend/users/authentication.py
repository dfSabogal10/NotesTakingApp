from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
ACCESS_MAX_AGE = 60 * 5  # 5 minutes
REFRESH_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


def cookie_is_secure() -> bool:
    """Read secure flag from env (default False for local dev)."""
    return settings.SECURE_COOKIE or False


def _cookie_kwargs() -> dict:
    secure = cookie_is_secure()
    return {"httponly": True, "secure": secure, "samesite": "Lax", "path": "/"}


def set_auth_cookies(response, access_token: str, refresh_token: str) -> None:
    """Set access and refresh tokens as httpOnly cookies."""
    kwargs = _cookie_kwargs()
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, max_age=ACCESS_MAX_AGE, **kwargs)
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, max_age=REFRESH_MAX_AGE, **kwargs)


def set_access_cookie(response, access_token: str) -> None:
    """Set only the access token cookie."""
    kwargs = _cookie_kwargs()
    response.set_cookie(ACCESS_COOKIE_NAME, access_token, max_age=ACCESS_MAX_AGE, **kwargs)


def clear_auth_cookies(response) -> None:
    """Clear access and refresh cookies (set max_age=0)."""
    for name in (ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME):
        response.set_cookie(
            name, "", max_age=0, httponly=True, samesite="Lax", path="/"
        )


class CookieJWTAuthentication(JWTAuthentication):
    """JWT authentication via access_token cookie."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")
        if not raw_token:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
            return (self.get_user(validated_token), validated_token)
        except Exception:
            return None
