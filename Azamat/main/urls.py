from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('list/', views.CatalogView.as_view(), name='catalog'),
    path('authorization/', views.authorization, name='authorization'),
    path('another_accaunt/', views.another_accaunt, name='another_accaunt'),
    path('personal_accaunt/', views.personal_accaunt, name='personal_accaunt'),
    # path('purchase/', views.purchase, name='purchase'),
    path('register/', views.register, name='register'),
    path('favorite/', views.FavoriteView.as_view(), name='favorite'),
    path('favorite_add/<int:car_id>', views.favorite_add, name='favorite_add'),
    path('favorite_remove/<int:car_id>', views.favorite_remove, name='favorite_remove')
]