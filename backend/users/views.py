from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from categories.models import Category
from users.authentication import (
    REFRESH_COOKIE_NAME,
    clear_auth_cookies,
    set_access_cookie,
    set_auth_cookies,
)
from users.serializers import DEFAULT_CATEGORIES, LoginSerializer, SignupSerializer

User = get_user_model()


class SignupView(APIView):
    """POST /api/auth/signup/ - Create a new user with default categories."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {"email": ["A user with this email already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password,
                )
                for name, color_hex in DEFAULT_CATEGORIES:
                    Category.objects.create(user=user, name=name, color_hex=color_hex)
        except IntegrityError:
            return Response(
                {"detail": "Unable to create user or default categories."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"id": user.id, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ - Authenticate user and set JWT cookies."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        response = Response(
            {"id": user.id, "email": user.email},
            status=status.HTTP_200_OK,
        )
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        return response


class LogoutView(APIView):
    """POST /api/auth/logout/ - Clear JWT cookies."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        response = Response({"ok": True}, status=status.HTTP_200_OK)
        clear_auth_cookies(response)
        return response


class RefreshView(APIView):
    """POST /api/auth/refresh/ - Issue new access token from refresh cookie."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response(
                {"detail": "Refresh token missing or invalid"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = Response({"ok": True}, status=status.HTTP_200_OK)
            set_access_cookie(response, access_token)
            return response
        except Exception:
            return Response(
                {"detail": "Refresh token missing or invalid"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class MeView(APIView):
    """GET /api/auth/me/ - Return current user (protected endpoint for verification)."""

    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = request.user
        return Response({"id": user.id, "email": user.email}, status=status.HTTP_200_OK)
