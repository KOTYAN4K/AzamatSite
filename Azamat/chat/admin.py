from django.contrib import admin

from .models import *

# Register your models here.
class MessageAdmin(admin.ModelAdmin):
    list_display = ['room', 'sender', 'message']

admin.site.register(Message, MessageAdmin)
admin.site.register(Room)
