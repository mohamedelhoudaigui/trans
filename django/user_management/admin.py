from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Profile

class ProfileAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('wins', 'loses')}),
    )

admin.site.register(Profile, ProfileAdmin)