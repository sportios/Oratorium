# Ораториум/app/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # Веб-интерфейс
    path('', views.menu, name='menu'),
    path('history/', views.session_list, name='history'),
    path('report/<int:session_id>/', views.session_detail, name='session_detail'),

    # API для веб (список и детализация)
    path('api/sessions/', views.api_sessions, name='api_sessions'),
    path('api/sessions/<int:session_id>/', views.api_session_detail, name='api_session_detail'),

    path("sessions/create/", views.create_session),

    path("vr-data/", views.vr_data),

    path("ai-analysis/", views.ai_analysis),

]

