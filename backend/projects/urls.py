from django.urls import path
from .views import MoleculeViewSet

molecule_list = MoleculeViewSet.as_view({
    'get':    'list',
    'post':   'create',
})
molecule_detail = MoleculeViewSet.as_view({
    'get':             'retrieve',
    'patch':           'partial_update',
    'delete':          'destroy',
})

urlpatterns = [
    path('projects/<int:project_pk>/molecules/',
         molecule_list,
         name='molecule-list'),
    path('projects/<int:project_pk>/molecules/<int:pk>/',
         molecule_detail,
         name='molecule-detail'),
]
