from pathlib import Path
import shutil

here = Path(__file__).cwd()
target = Path(r'C:\Users\Jump_Around\AppData\Local\Screeps\scripts\screeps.com\default')
ext = ['.js']


source_files = [file for file in here.iterdir() if file.suffix in ext]


for file in source_files:
    dest = target / file.name
    shutil.copyfile(file, dest)

print(f'Deployed {len(source_files)} source files to {target}')