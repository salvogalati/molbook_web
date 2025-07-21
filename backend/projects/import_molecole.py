import csv
from projects.models import Project, Molecule


def run():
    project = Project.objects.get(name='Sintesi Farmaci')

    with open('projects/molecole_farmaci.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            Molecule.objects.create(
                project=project,
                code=row['code'],
                name=row.get('name', ''),
                category=row.get('category', ''),
                quanitity=row.get('quanitity') or None,
                smiles=row['smiles']
            )
        print("Importazione completata ✅")
