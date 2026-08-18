from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('comptes/', include('comptes.api_urls')),
    path('abonnements/', include('abonnements.api_urls')),
    path('pedagogie/', include('pedagogie.api_urls')),
    path('evaluations/', include('evaluations.api_urls')),
    path('communaute/', include('communaute.api_urls')),
]
