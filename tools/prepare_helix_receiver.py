#!/usr/bin/env python3
"""Prepare the separate Helix addition without changing pinned intake source.

Optionally pass a copy of current live Code.gs to preserve exact source ordering.
Never upload automatically or load provider credentials.
"""
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def compose(base):
    if 'handleHelix_' in base:raise ValueError('Helix handler already present; compare current source before editing')
    marker='function doPost(e) {'
    health="service: 'Olsen Automation AI Visibility Intake',"
    if base.count(marker)!=1 or base.count(health)!=1:raise ValueError('Unknown receiver contract; review current source')
    dispatch="\n  try { const h=JSON.parse(String(e && e.parameter && e.parameter.payload || '{}')); if(h.intake_type === 'olsen_automation_helix_feedback')return handleHelix_(h); } catch(_) {}"
    version="\n    helix_version: 'helix-2026-10-07-v1',\n    helix_versions: ['helix-2026-10-07-v1','helix-2026-10-07-v2'],"
    patched=base.replace(marker,marker+dispatch).replace(health,health+version)
    assert patched.replace(dispatch,'').replace(version,'')==base
    return patched+'\n'+(ROOT/'src/receivers/helix.gs').read_text()
if __name__=='__main__':
    source=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'src/receivers/intake.gs'
    target=ROOT/'.migration-local/helix/receiver.gs';target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(compose(source.read_text()))
    print('Prepared private local receiver source:',target)
