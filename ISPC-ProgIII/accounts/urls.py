from django.urls import path
from .views import RegisterView, LoginView, UserListView, RequestOTPView, VerifyOTPView, ResetPasswordView, VerifyAccountView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    # Endpoints de recuperación
    path('request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('verify-account/', VerifyAccountView.as_view(), name='verify-account'),
]