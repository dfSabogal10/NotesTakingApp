from rest_framework.generics import ListAPIView

from categories.models import Category
from categories.serializers import CategorySerializer


class CategoryListView(ListAPIView):
    """GET /api/categories/ - List categories for the current user."""

    serializer_class = CategorySerializer

    def get_queryset(self):
        return (
            Category.objects.filter(user=self.request.user)
            .prefetch_related("notes")
            .order_by("created_at")
        )
