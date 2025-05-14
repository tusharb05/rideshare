from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    print("in CustomUserManager class")
    def create_user(self, phone_number, full_name, password=None, **extra_fields):
        print("in CustomUserManager/create_user method")
        if not phone_number:
            raise ValueError('The phone number must be set')
        user = self.model(phone_number=phone_number, full_name=full_name, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(phone_number, full_name, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(max_length=15, unique=True)
    full_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.phone_number
