# Generated by Django 5.0.2 on 2024-04-22 18:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_favoritecarslist'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='favoritecarslist',
            name='favorite_cars_id',
        ),
        migrations.AddField(
            model_name='favoritecarslist',
            name='favorite_cars_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.cars', verbose_name='Избранные машины'),
        ),
    ]
