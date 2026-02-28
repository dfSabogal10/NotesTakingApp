"""Pytest fixtures and helpers for backend tests."""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from categories.models import Category
from notes.models import Note

User = get_user_model()


def create_user(email: str, password: str) -> User:
    """Create a user with the given email and password."""
    return User.objects.create_user(username=email, email=email, password=password)


def create_category(user: User, name: str, color_hex: str = "#F3C6A3") -> Category:
    """Create a category for the given user."""
    return Category.objects.create(user=user, name=name, color_hex=color_hex)


def create_note(
    user: User,
    category: Category,
    title: str = "",
    content: str = "",
) -> Note:
    """Create a note for the given user and category."""
    return Note.objects.create(user=user, category=category, title=title, content=content)


def login(client: APIClient, email: str, password: str):
    """Log in and set cookies on the client. Returns the response."""
    return client.post(
        "/api/auth/login/",
        {"email": email, "password": password},
        format="json",
    )


@pytest.fixture
def api_client():
    """DRF API client."""
    return APIClient()


@pytest.fixture
def user_password():
    """Default password for test users."""
    return "password123"


@pytest.fixture
def user1(db, user_password):
    """First test user."""
    return create_user("user1@example.com", user_password)


@pytest.fixture
def user2(db, user_password):
    """Second test user."""
    return create_user("user2@example.com", user_password)


@pytest.fixture
def auth_client(api_client, user1, user_password):
    """API client logged in as user1 with JWT cookies set."""
    response = login(api_client, "user1@example.com", user_password)
    assert response.status_code == 200, f"Login failed: {response.data}"
    return api_client
