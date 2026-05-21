import os
from PIL import Image
import numpy as np

p = r"c:\Users\velpe\OneDrive\Documentos\ANTIGRAVITY\Innova\client\public\athletic_body.png"
img = Image.open(p)
arr = np.array(img)
h, w, c = arr.shape
print(f"Shape: {arr.shape}")
# Look at border pixels
top_row = arr[0, :, :]
# Print values that are opaque
opaque_pixels = top_row[top_row[:, 3] == 255]
print(f"Number of opaque pixels in top row: {len(opaque_pixels)}")
if len(opaque_pixels) > 0:
    print(f"Sample opaque pixels in top row (first 5): {opaque_pixels[:5]}")

# Let's count how many pixels are white (255, 255, 255) vs transparent
white_pixels = np.sum((arr[:, :, 0] == 255) & (arr[:, :, 1] == 255) & (arr[:, :, 2] == 255) & (arr[:, :, 3] == 255))
print(f"Number of fully white and opaque pixels in image: {white_pixels}")
