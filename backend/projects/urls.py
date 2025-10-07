from rest_framework_nested import routers
from .views import ProjectViewSet, MoleculeViewSet

# Router principale
router = routers.SimpleRouter()
router.register(r'projects', ProjectViewSet, basename='project')

# Router annidato per le molecole
projects_router = routers.NestedSimpleRouter(router, r'projects', lookup='project')
projects_router.register(r'molecules', MoleculeViewSet, basename='project-molecules')

urlpatterns = router.urls + projects_router.urls
