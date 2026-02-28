"""Tests for categories API."""

import pytest

from conftest import create_category, login


@pytest.mark.django_db
class TestCategoriesList:
    def test_categories_list_returns_only_current_user_categories(
        self, api_client, user1, user2, user_password
    ):
        create_category(user1, "Cat1", "#FF0000")
        create_category(user2, "Cat2", "#00FF00")

        login(api_client, "user1@example.com", user_password)
        response = api_client.get("/api/categories/")
        assert response.status_code == 200
        names = [c["name"] for c in response.data]
        assert "Cat1" in names
        assert "Cat2" not in names

    def test_categories_list_includes_notes_count_correctly(
        self, auth_client, user1, user_password
    ):
        from conftest import create_note, create_category

        cat = create_category(user1, "TestCat", "#FF0000")
        response = auth_client.get("/api/categories/")
        assert response.status_code == 200
        cat_data = next(c for c in response.data if c["name"] == "TestCat")
        assert cat_data["notes_count"] == 0

        create_note(user1, cat, "Note 1", "Content")
        response = auth_client.get("/api/categories/")
        cat_data = next(c for c in response.data if c["name"] == "TestCat")
        assert cat_data["notes_count"] == 1
