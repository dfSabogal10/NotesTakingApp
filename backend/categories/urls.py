from rest_framework.routers import DefaultRouter

from categories.views import CategoryViewSet

app_name = "categories"

router = DefaultRouter()
router.register(r"", CategoryViewSet, basename="category")
urlpatterns = router.urls
