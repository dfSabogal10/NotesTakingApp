from django.conf import settings
from django.db import models

from categories.models import Category


class Note(models.Model):
    """Note belonging to a user and a category."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="notes",
    )
    title = models.CharField(max_length=200, blank=True, default="")
    content = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "updated_at"]),
            models.Index(fields=["user", "category"]),
        ]

    def __str__(self):
        title_preview = (self.title[:30] + "…") if len(self.title) > 30 else self.title or "(untitled)"
        pk_str = self.pk if self.pk is not None else "unsaved"
        return f"Note #{pk_str}: {title_preview}"
