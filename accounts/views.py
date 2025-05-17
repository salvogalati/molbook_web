from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Molecola
import io
from rdkit import Chem
from rdkit.Chem import Draw

def genera_molecola_img(request, pk):
    # Recupera la molecola oppure genera errore 404
    molecola = get_object_or_404(Molecola, pk=pk)
    print(molecola)
    try:
        # Converte il campo SMILES in oggetto Molecola
        mol = Chem.MolFromSmiles(molecola.smiles)
        if mol is None:
            raise ValueError("SMILES non valido")

        # Disegna immagine PNG
        img = Draw.MolToImage(mol, size=(300, 300))  # dimensione personalizzabile

        # Salva in memoria
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        return HttpResponse(buffer.getvalue(), content_type='image/png')

    except Exception as e:
        raise Http404(f"Errore nella generazione immagine: {e}")


@login_required
def home(request):
    return render(request, 'accounts/home.html')

@login_required
def dashboard(request):
    
    molecole = Molecola.objects.all()
    print(molecole)
    return render(request, 'accounts/dashboard.html', {'molecole': molecole})
