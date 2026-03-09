from rest_framework import mixins, viewsets
from rest_framework.exceptions import NotFound

from categories.models import Category
from categories.serializers import CategorySerializer


class CategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    ViewSet for categories: list only.
    GET /api/categories/ - List categories for the current user.
    """

    serializer_class = CategorySerializer

    def get_queryset(self):
        return (
            Category.objects.filter(user=self.request.user)
            .prefetch_related("notes")
            .order_by("created_at")
        )

    def retrieve(self, request, *args, **kwargs):
        """Detail not supported; return 404 to match prior behavior (no route)."""
        raise NotFound()
