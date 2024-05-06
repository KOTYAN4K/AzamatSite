from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    photo = models.ImageField(upload_to='users/%Y/%m/%d/', default=None, blank=True, null=True,
                              verbose_name='Фотография')

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username
