from django.urls import path

from . import views

app_name = "chat"

urlpatterns = [
    path('<str:room_name>/<str:username>/', views.message_view, name='room'),
]