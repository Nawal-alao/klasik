from django.urls import path
from . import api_views

urlpatterns = [
    path('matieres/', api_views.MatiereListAPIView.as_view(), name='api_matieres_list'),
    path('cours/', api_views.CoursListAPIView.as_view(), name='api_cours_list'),
    path('cours/<int:pk>/', api_views.CoursDetailAPIView.as_view(), name='api_cours_detail'),
]
