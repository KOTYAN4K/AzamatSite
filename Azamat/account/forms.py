from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, AuthenticationForm

from account.models import User


class LoginUserForm(AuthenticationForm):
    username = forms.CharField(label='Логин', widget=forms.TextInput(
        attrs={'class': 'form-input', 'placeholder': 'Логин/Почта'}))
    password = forms.CharField(label='Пароль', widget=forms.PasswordInput(
        attrs={'class': 'form-input', 'id': 'password-input', 'placeholder': 'Пароль'}))

    class Meta:
        model = User
        fields = ['username', 'password']


class CustomUserCreationForm(UserCreationForm):
    username = forms.CharField(label='Логин', widget=forms.TextInput(
        attrs={'class': 'form-input', 'placeholder': 'Логин'}))
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput(
        attrs={'class': 'form-input', 'id': 'password-input', 'placeholder': 'Пароль'}))
    password2 = forms.CharField(label='Повтор пароля', widget=forms.PasswordInput(
        attrs={'class': 'form-input', 'placeholder': 'Повтор пароля'}))

    class Meta:
        model = get_user_model()
        fields = ['username', 'password1', 'password2', 'photo', 'email', ]
        labels = {
            'email': 'E-mail',
            'photo': 'фото'
        }
        widgets = {
            'email': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'E-mail'}),
            'photo': forms.FileInput(attrs={
                'class': 'input input__file',
                'type': "file",
                'id': "input__file"
            })
        }

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Такой E-mail уже существует!")
        return email


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = get_user_model()
        fields = ('username', 'password', 'photo', 'email',)
