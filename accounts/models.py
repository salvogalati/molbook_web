from django.db import models

# Create your models here.

class Molecola(models.Model):
    nome = models.CharField(max_length=100)
    formula = models.CharField(max_length=100)
    smiles = models.CharField(max_length=255)

    def __str__(self):
        return self.nome
