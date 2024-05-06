from django.contrib import admin
from main.models import *


# Register your models here.
@admin.register(Cars)
class CarsAdmin(admin.ModelAdmin):
    model = Cars


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    model = Equipment


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    model = Chat


@admin.register(Purchases)
class PurchasesAdmin(admin.ModelAdmin):
    model = Purchases


@admin.register(FavoriteCarsList)
class FavoriteCarsListAdmin(admin.ModelAdmin):
    model = FavoriteCarsList
