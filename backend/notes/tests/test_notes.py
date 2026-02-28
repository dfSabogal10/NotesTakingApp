"""Tests for notes API."""

import pytest

from conftest import create_category, create_note, login


@pytest.mark.django_db
class TestCreateNote:
    def test_create_note_empty_body_creates_note_with_default_category(
        self, auth_client, user1
    ):
        cat = create_category(user1, "Default", "#F3C6A3")
        response = auth_client.post("/api/notes/", {}, format="json")
        assert response.status_code == 201
        assert response.data["title"] == ""
        assert response.data["content"] == ""
        assert response.data["category"]["id"] == cat.id

    def test_create_note_with_owned_category_succeeds(
        self, auth_client, user1
    ):
        cat = create_category(user1, "MyCat", "#FF0000")
        response = auth_client.post(
            "/api/notes/",
            {"category_id": cat.id, "title": "Test", "content": "Hi"},
            format="json",
        )
        assert response.status_code == 201
        assert response.data["title"] == "Test"
        assert response.data["content"] == "Hi"
        assert response.data["category"]["id"] == cat.id

    def test_create_note_with_unowned_category_returns_400_or_404(
        self, api_client, user1, user2, user_password
    ):
        cat_user2 = create_category(user2, "User2Cat", "#FF0000")
        login(api_client, "user1@example.com", user_password)
        response = api_client.post(
            "/api/notes/",
            {"category_id": cat_user2.id},
            format="json",
        )
        assert response.status_code in (400, 404)
        assert "category" in response.data or "category_id" in response.data or "detail" in response.data


@pytest.mark.django_db
class TestNotesList:
    def test_notes_list_returns_only_user_notes(
        self, api_client, user1, user2, user_password
    ):
        cat1 = create_category(user1, "C1", "#F00")
        cat2 = create_category(user2, "C2", "#0F0")
        create_note(user1, cat1, "Note1", "")
        create_note(user2, cat2, "Note2", "")

        login(api_client, "user1@example.com", user_password)
        response = api_client.get("/api/notes/")
        assert response.status_code == 200
        titles = [n["title"] for n in response.data]
        assert "Note1" in titles
        assert "Note2" not in titles

    def test_notes_filter_by_category_returns_only_matching_notes(
        self, auth_client, user1
    ):
        cat1 = create_category(user1, "Cat1", "#F00")
        cat2 = create_category(user1, "Cat2", "#0F0")
        create_note(user1, cat1, "N1", "")
        create_note(user1, cat2, "N2", "")
        create_note(user1, cat2, "N3", "")

        response = auth_client.get(f"/api/notes/?category={cat2.id}")
        assert response.status_code == 200
        titles = [n["title"] for n in response.data]
        assert "N2" in titles and "N3" in titles
        assert "N1" not in titles

    def test_notes_filter_invalid_category_string_returns_400(
        self, auth_client
    ):
        response = auth_client.get("/api/notes/?category=foo")
        assert response.status_code == 400
        assert "category" in response.data


@pytest.mark.django_db
class TestNoteDetail:
    def test_note_detail_other_user_returns_404(
        self, api_client, user1, user2, user_password
    ):
        cat = create_category(user2, "C", "#F00")
        note = create_note(user2, cat, "Secret", "")

        login(api_client, "user1@example.com", user_password)
        response = api_client.get(f"/api/notes/{note.id}/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestNotePatch:
    def test_patch_note_updates_title_content_and_updated_at_changes(
        self, auth_client, user1
    ):
        cat = create_category(user1, "C", "#F00")
        note = create_note(user1, cat, "Old", "OldContent")
        original_updated = note.updated_at

        response = auth_client.patch(
            f"/api/notes/{note.id}/",
            {"title": "New", "content": "NewContent"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["title"] == "New"
        assert response.data["content"] == "NewContent"
        note.refresh_from_db()
        assert note.updated_at >= original_updated

    def test_patch_note_category_to_unowned_returns_400_or_404(
        self, api_client, user1, user2, user_password
    ):
        cat1 = create_category(user1, "C1", "#F00")
        cat2 = create_category(user2, "C2", "#0F0")
        note = create_note(user1, cat1, "N", "")

        login(api_client, "user1@example.com", user_password)
        response = api_client.patch(
            f"/api/notes/{note.id}/",
            {"category_id": cat2.id},
            format="json",
        )
        assert response.status_code in (400, 404)
        assert "category" in response.data or "category_id" in response.data or "detail" in response.data


@pytest.mark.django_db
class TestNoteDelete:
    def test_delete_note_succeeds(self, auth_client, user1):
        from notes.models import Note

        cat = create_category(user1, "C", "#F00")
        note = create_note(user1, cat, "N", "")
        note_id = note.id
        response = auth_client.delete(f"/api/notes/{note_id}/")
        assert response.status_code == 204
        assert not Note.objects.filter(pk=note_id).exists()
