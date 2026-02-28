from rest_framework import serializers

from categories.models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for category list with notes_count."""

    notes_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "color_hex", "created_at", "notes_count"]
        read_only_fields = ["id", "name", "color_hex", "created_at", "notes_count"]

    def get_notes_count(self, obj):
        return obj.notes.count()
