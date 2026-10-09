"""Validate the approved phase source; the live engine is canonical."""
from pathlib import Path
import json
r=Path(__file__).parent
x=json.loads((r/'phase-source.json').read_text())
assert len(x['phases'])==8
assert len({n['id'] for n in x['master']})==72
print('8 phases and 72 source checks. Review master.json; use the engine adapter to regenerate project models.')
