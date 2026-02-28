from django.conf import settings
from django.db import models


class Category(models.Model):
    """Category for organizing notes per user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=60)
    color_hex = models.CharField(max_length=7)  # e.g. "#F3C6A3"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="categories_category_user_name_unique",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user_id})"
