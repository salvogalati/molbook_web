import csv
from django.core.management.base import BaseCommand
from accounts.models import Molecola  # importa il modello dalla tua app

class Command(BaseCommand):
    help = 'Importa molecole da un file CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Percorso del file CSV')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Molecola.objects.create(
                    nome=row['nome'],
                    formula=row['formula'],
                    smiles=row['smiles']
                )
        self.stdout.write(self.style.SUCCESS('Importazione completata con successo.'))
