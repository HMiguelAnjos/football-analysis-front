"""Gera ícones (favicon/PWA) a partir do símbolo ClutchPro transparente.
Uso único — roda manual quando o asset do símbolo muda."""
import os
import numpy as np
from PIL import Image

SRC = r"C:\Users\henri\Documents\Henrique\ClutchPro\ChatGPT Image May 16, 2026, 03_42_27 AM.png"
PUB = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
BG = (17, 17, 17, 255)  # #111111 brand book

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)
ys, xs = np.where(arr[:, :, 3] > 16)  # conteúdo = não-transparente
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
sym = img.crop((x0, y0, x1 + 1, y1 + 1))
print("bbox", (x0, x1, y0, y1), "-> símbolo", sym.size)

# Símbolo transparente trim (sidebar usa este)
sym.save(os.path.join(PUB, "clutchpro-symbol.png"))


def make_icon(size: int, pad_frac: float = 0.16) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BG)
    inner = int(size * (1 - 2 * pad_frac))
    r = sym.width / sym.height
    if r >= 1:
        tw, th = inner, max(1, int(inner / r))
    else:
        th, tw = inner, max(1, int(inner * r))
    rs = sym.resize((tw, th), Image.LANCZOS)
    canvas.paste(rs, ((size - tw) // 2, (size - th) // 2), rs)
    return canvas


for size, name in [
    (180, "apple-touch-icon.png"),
    (192, "icon-192.png"),
    (512, "icon-512.png"),
]:
    make_icon(size).save(os.path.join(PUB, name))
    print("gerado", name, size)

print("OK")
