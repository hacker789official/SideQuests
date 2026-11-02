from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "assets" / "sidequests-icon.png"
out = root / "public" / "icons"
out.mkdir(parents=True, exist_ok=True)

with Image.open(source).convert("RGBA") as image:
    for size in (192, 512):
        image.resize((size, size), Image.Resampling.LANCZOS).save(out / f"icon-{size}.png", optimize=True)
