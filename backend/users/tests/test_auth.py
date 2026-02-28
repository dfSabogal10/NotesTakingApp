"""Tests for auth endpoints: signup, login, logout, refresh."""

import pytest

from conftest import login
from categories.models import Category
from users.serializers import DEFAULT_CATEGORIES


@pytest.mark.django_db
class TestSignup:
    def test_signup_creates_default_categories_and_returns_201(self, api_client, user_password):
        response = api_client.post(
            "/api/auth/signup/",
            {"email": "newuser@example.com", "password": user_password},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["email"] == "newuser@example.com"
        assert "id" in response.data

        from django.contrib.auth import get_user_model

        User = get_user_model()
        user = User.objects.get(email="newuser@example.com")
        categories = list(Category.objects.filter(user=user).order_by("created_at"))
        assert len(categories) == 3
        expected = [(c.name, c.color_hex) for c in categories]
        assert expected == list(DEFAULT_CATEGORIES)

    def test_signup_duplicate_email_returns_400(self, api_client, user1, user_password):
        response = api_client.post(
            "/api/auth/signup/",
            {"email": "user1@example.com", "password": user_password},
            format="json",
        )
        assert response.status_code == 400
        assert "email" in response.data


@pytest.mark.django_db
class TestLogin:
    def test_login_sets_access_and_refresh_cookies(self, api_client, user1, user_password):
        response = login(api_client, "user1@example.com", user_password)
        assert response.status_code == 200
        assert response.data["email"] == "user1@example.com"
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

    def test_login_invalid_credentials_returns_401(self, api_client, user1):
        response = api_client.post(
            "/api/auth/login/",
            {"email": "user1@example.com", "password": "wrongpassword"},
            format="json",
        )
        assert response.status_code == 401
        assert "Invalid credentials" in str(response.data)


@pytest.mark.django_db
class TestRefresh:
    def test_refresh_with_valid_cookie_sets_new_access_cookie(
        self, api_client, user1, user_password
    ):
        login(api_client, "user1@example.com", user_password)
        response = api_client.post("/api/auth/refresh/")
        assert response.status_code == 200
        assert response.data.get("ok") is True
        assert "access_token" in response.cookies


@pytest.mark.django_db
class TestLogout:
    def test_logout_clears_cookies(self, auth_client):
        response = auth_client.post("/api/auth/logout/")
        assert response.status_code == 200
        assert response.data.get("ok") is True
        # Server sets both cookies with max_age=0 to clear them
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies
