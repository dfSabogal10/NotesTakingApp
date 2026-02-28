from django.urls import path

from notes.views import NoteDetailView, NoteListCreateView

app_name = "notes"

urlpatterns = [
    path("", NoteListCreateView.as_view(), name="list-create"),
    path("<int:pk>/", NoteDetailView.as_view(), name="detail"),
    path("<int:pk>", NoteDetailView.as_view(), name="detail-no-slash"),
]
