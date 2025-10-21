import sys
from pathlib import Path

# Lägg till backend till sys.path så src-paketimport fungerar
sys.path.insert(0, str(Path(__file__).parent.parent))
