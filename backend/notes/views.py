from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)

from categories.models import Category
from notes.models import Note
from notes.serializers import NoteSerializer


class NoteListCreateView(ListAPIView, CreateAPIView):
    """GET /api/notes/ - List notes. POST /api/notes/ - Create note."""

    serializer_class = NoteSerializer

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user).select_related("category")
        category_id = self.request.query_params.get("category")
        if category_id and category_id != "all":
            if not category_id.isdigit():
                raise ValidationError(
                    {"category": "Must be a valid category id or 'all' (without quotes)."},
                    code="invalid",
                )
            qs = qs.filter(category_id=int(category_id))
        return qs.order_by("-updated_at")

    def perform_create(self, serializer):
        user = self.request.user
        category = serializer.validated_data.get("category")
        if category is None:
            category = Category.objects.filter(user=user).order_by("created_at").first()
        serializer.save(user=user, category=category)


class NoteDetailView(RetrieveUpdateDestroyAPIView):
    """GET /api/notes/<id>/, PATCH /api/notes/<id>/, DELETE /api/notes/<id>/"""

    serializer_class = NoteSerializer
    lookup_url_kwarg = "pk"

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).select_related("category")
