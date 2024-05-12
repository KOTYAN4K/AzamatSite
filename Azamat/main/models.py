from django.contrib.auth import get_user_model
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.


class Equipment(models.Model):
    name = models.CharField(verbose_name='Тип покупки', max_length=50,
                            default='без_комплектации')

    class Meta:
        verbose_name = 'Тип комплектации'
        verbose_name_plural = 'Типы комплектаций'

    def __str__(self):
        return self.name


class Cars(models.Model):
    name = models.CharField(max_length=50, verbose_name='Название')
    photo = models.ImageField(upload_to='cars/img', default=None, blank=True, null=True,
                              verbose_name='Фотография')
    petrol = models.DecimalField(verbose_name='Бензин', max_digits=3, decimal_places=1)
    power = models.IntegerField('Мощность двигателя')
    transmission = models.CharField(verbose_name='Коробка передач', max_length=50,
                                    choices=(
                                        ('автомат', 'Автомат'),
                                        ('механика', 'Механика')
                                    ), default='механика')
    color = models.CharField(verbose_name='Цвет машины', max_length=50,null=True, blank=True)
    mileage = models.IntegerField(verbose_name='Пробег', null=True, blank=True)
    equipment = models.CharField(verbose_name='Комплектация', max_length=50,
                                 choices=(
                                     ('Комфорт', 'Левый'),
                                     ('Спорт', 'Правый'),
                                     ('Без комплектации', 'Правый')
                                 ), default='Без комплектации')
    default_price = models.DecimalField(verbose_name='Цена', max_digits=20, decimal_places=2)

    class Meta:
        verbose_name = 'Машина'
        verbose_name_plural = 'Машины'

    def __str__(self):
        return self.name


class Purchases(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name='Пользователь')
    car = models.OneToOneField('Cars', on_delete=models.SET_NULL, null=True, blank=True,
                               verbose_name='Машина')
    final_price = models.DecimalField(verbose_name='Цена', max_digits=8, decimal_places=2)
    date = models.DateField('Дата отправления', auto_now=True)

    class Meta:
        verbose_name = 'Покупка'
        verbose_name_plural = 'Покупки'

    def __str__(self):
        return f'{self.car} - {self.user}'


class Chat(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name='Пользователь')
    message = models.CharField(max_length=500, verbose_name='Сообщения')
    typing_date = models.DateField('Дата отправления', auto_now=True)

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f'Сообщение от {self.user}'


class FavoriteCarsList(models.Model):
    user_id = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name='Лист избранных')
    favorite_cars_id = models.ForeignKey(Cars, null=True, blank=True, on_delete=models.CASCADE,
                                         verbose_name='Избранные машины')

    class Meta:
        verbose_name = 'Лист избранных'
        verbose_name_plural = 'Листы избранных'

    def __str__(self):
        return f'Лист избранных {self.user_id}'
