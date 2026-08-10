import os
import sys
import pathlib

# Ensure backend root is in sys.path
BACKEND_DIR = str(pathlib.Path(__file__).resolve().parent)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.core.management import call_command

if __name__ == '__main__':
    print("Running all backend tests...")
    call_command('test')
