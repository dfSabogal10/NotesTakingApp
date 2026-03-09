from rest_framework.routers import DefaultRouter

from notes.views import NoteViewSet

app_name = "notes"

router = DefaultRouter()
router.register(r"", NoteViewSet, basename="note")
urlpatterns = router.urls
