import os
from PIL import Image
import numpy as np

public_dir = r"c:\Users\velpe\OneDrive\Documentos\ANTIGRAVITY\Innova\client\public"

for name in ["athletic_body.png", "ectomorph_body.png", "endomorph_body.png"]:
    p = os.path.join(public_dir, name)
    if os.path.exists(p):
        img = Image.open(p)
        arr = np.array(img)
        h, w, c = arr.shape
        print(f"{name}: shape={arr.shape}, mode={img.mode}")
        if c == 4:
            alpha = arr[:, :, 3]
            opaque_count = np.sum(alpha == 255)
            trans_count = np.sum(alpha == 0)
            semi_count = np.sum((alpha > 0) & (alpha < 255))
            print(f"  Alpha channels: opaque={opaque_count}, transparent={trans_count}, semi={semi_count}")
            # print corner values
            print(f"  Corners alpha: top-left={alpha[0,0]}, top-right={alpha[0, w-1]}, bottom-left={alpha[h-1, 0]}, bottom-right={alpha[h-1, w-1]}")
            # check if there's any non-zero alpha in the outer border region
            border_alpha = np.concatenate([alpha[0,:], alpha[-1,:], alpha[:,0], alpha[:,-1]])
            max_border_alpha = border_alpha.max()
            print(f"  Max border alpha: {max_border_alpha}")
        else:
            print("  No alpha channel!")
    else:
        print(f"{name} does not exist!")
