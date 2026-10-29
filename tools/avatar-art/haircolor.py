"""Recolour the dark-brown hair art to the other hair colours, keeping shading, highlights and line art; red ties stay red."""
import numpy as np
from PIL import Image

R = '/Users/joannasieniawska/Documents/Pumpelek/art/ready/'
COLORS = {
    'darkbrown': None,
    'black': '#26232b', 'brown': '#7a4e3a', 'lightbrown': '#b08a68', 'blonde': '#efd48f',
    'auburn': '#c4502e', 'pink': '#f0a3bd', 'blue': '#3b4f9a', 'silver': '#d2d5df',
}
BASE_LUM = 46.0


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)


def hsv(rgb):
    x = rgb / 255.0
    mx, mn = x.max(axis=2), x.min(axis=2)
    d = mx - mn + 1e-6
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def recolor(img, color):
    if COLORS[color] is None:
        return img
    arr = np.array(img.convert('RGBA'))
    rgb = arr[..., :3].astype(np.float32)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    r = np.clip(lum / BASE_LUM, 0.25, 2.6)
    C = hexrgb(COLORS[color])
    # below the base lightness: darken the colour; above: move toward white a little so highlights stay light
    dark = C * r[..., None]
    light = C + (255 - C) * np.clip((r - 1) * 0.55, 0, 1)[..., None]
    new = np.where((r < 1)[..., None], dark, light)
    h, s, v = hsv(rgb)
    keep = ((h >= 340) | (h <= 14)) & (s > 0.45) & (v > 0.3)   # the red hair ties
    out = np.where(keep[..., None], rgb, new)
    arr[..., :3] = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')
