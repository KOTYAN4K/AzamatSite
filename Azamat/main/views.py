from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.generic import ListView

from .models import Cars, Chat, FavoriteCarsList


# Create your views here.
def index(request):
    data = {
        'cars': Cars.objects.all()[:3]
    }
    return render(request, 'main/index.html', data)


# def all_chat(request):
#     return render(request, 'main/all_chat.html')


class ChatListView(ListView, LoginRequiredMixin):
    model = Chat
    template_name = 'main/all_chat.html'
    context_object_name = 'chat'


def another_accaunt(request):
    return render(request, 'main/another_accaunt.html')


def authorization(request):
    return render(request, 'main/authorization.html')


@login_required
def personal_accaunt(request):
    return render(request, 'main/personal_accaunt.html')


@login_required
def purchase(request):
    return render(request, 'main/purchase.html')


def register(request):
    return render(request, 'main/register.html')


# @login_required
# def transactions(request):
#     return render(request, 'main/transactions.html')
class FavoriteView(ListView):
    model = FavoriteCarsList
    context_object_name = 'favorite'
    template_name = 'main/favorite.html'
    paginate_by = 6

    def get_queryset(self):
        return FavoriteCarsList.objects.filter(user_id=self.request.user)


class CatalogView(ListView):
    model = Cars
    context_object_name = 'cars'
    template_name = 'main/catalog.html'
    paginate_by = 6

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['favorite'] = FavoriteCarsList
        return context


def favorite_add(request, car_id):
    current_page = request.META.get('HTTP_REFERER')
    car = Cars.objects.get(id=car_id)
    favorites = FavoriteCarsList.objects.filter(user_id=request.user, favorite_cars_id=car)

    if not favorites.exists():
        FavoriteCarsList.objects.create(user_id=request.user, favorite_cars_id=car)
        return HttpResponseRedirect(current_page)
    else:
        favorite = favorites.first()
        favorite.save()
        return HttpResponseRedirect(current_page)


def favorite_remove(request, car_id):
    current_page = request.META.get('HTTP_REFERER')

    FavoriteCarsList.objects.get(favorite_cars_id=car_id).delete()

    return HttpResponseRedirect(current_page)

