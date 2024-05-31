from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

from .models import *


# Create your views here.
@login_required
def message_view(request, room_name, username):
    if Room.objects.filter(room_name=room_name).exists():
        get_room = Room.objects.get(room_name=room_name)
    else:
        get_room = Room(room_name=room_name)
        get_room.save()

    if request.method == 'POST':
        message = request.POST['message']

        print(message)

        new_message = Message(room=get_room, sender=username, message=message)
        new_message.save()

    get_messages = Message.objects.filter(room=get_room)

    context = {
        "messages": get_messages,
        "user": username,
        "room_name": room_name,
    }
    return render(request, 'chat/all_chat.html', context)