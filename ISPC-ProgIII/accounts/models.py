from django.db import models
from django.contrib.auth.models import User
from encrypted_model_fields.fields import EncryptedCharField
import random
import string

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    encrypted_info = EncryptedCharField(max_length=100)  # Example encrypted field
    
class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_code(self):
        self.code = ''.join(random.choices(string.digits, k=6))
        self.is_verified = False
        self.save()
        return self.code
