from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from categories.models import Category
from notes.models import Note
from notes.serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for notes: list, create, retrieve, update (PATCH), destroy.
    GET /api/notes/, POST /api/notes/, GET /api/notes/<id>/, PATCH /api/notes/<id>/, DELETE /api/notes/<id>/
    """

    serializer_class = NoteSerializer
    lookup_url_kwarg = "pk"

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
        favorite = self.request.query_params.get("favorite");
        if favorite:
            if favorite.lower() != "true" and favorite.lower() != "false":
                raise ValidationError(
                    {"favorite": "Must be a valid boolean"},
                    code="invalid",
                )
            qs = qs.filter(favorite=favorite.lower() == "true")
        return qs.order_by("-updated_at")

    def perform_create(self, serializer):
        user = self.request.user
        category = serializer.validated_data.get("category")
        if category is None:
            category = Category.objects.filter(user=user).order_by("created_at").first()
        serializer.save(user=user, category=category)
