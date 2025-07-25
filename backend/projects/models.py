from django.conf import settings
from django.db import models

class Project(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, 
                             on_delete=models.CASCADE, 
                             related_name='projects')
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"




class Molecule(models.Model):
    project = models.ForeignKey(Project, 
                                on_delete=models.CASCADE, 
                                related_name='molecules')
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=50,blank=True, null=True)
    category = models.CharField(max_length=50,blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    smiles = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} {self.smiles}"
