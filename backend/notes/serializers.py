from rest_framework import serializers

from categories.models import Category
from notes.models import Note


class CategoryNestedSerializer(serializers.ModelSerializer):
    """Minimal category for embedding in note representation."""

    class Meta:
        model = Category
        fields = ["id", "name", "color_hex"]
        read_only_fields = ["id", "name", "color_hex"]


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for note read/write."""

    category = CategoryNestedSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none(),
        write_only=True,
        required=False,
        source="category",
    )

    class Meta:
        model = Note
        fields = ["id", "title", "content", "category", "category_id", "updated_at"]
        read_only_fields = ["id", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user:
            self.fields["category_id"].queryset = Category.objects.filter(user=request.user)
