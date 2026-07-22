
from PIL import Image, ImageOps
import os

def remove_background(input_path, output_path, bg_color='white', threshold=200):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # item is (R, G, B, A)
        r, g, b, a = item
        
        if bg_color == 'white':
            # Luminance calculation
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum >= threshold:
                # Calculate alpha based on how close it is to white
                # This helps with antialiasing
                new_alpha = int(max(0, min(255, (255 - lum) * (255 / (255 - threshold)))))
                new_data.append((r, g, b, new_alpha))
            else:
                new_data.append(item)
        elif bg_color == 'black':
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum <= (255 - threshold):
                new_alpha = int(max(0, min(255, lum * (255 / (255 - threshold)))))
                new_data.append((r, g, b, new_alpha))
            else:
                new_data.append(item)
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Crop the image to remove the rounded rectangle borders entirely if needed
    # But the user asked to "recortar o quadrado", suggesting we should find the inner content
    # Let's just do the transparency for now and see.
    
    img.save(output_path, "PNG")

os.makedirs("/tmp/logo_processing", exist_ok=True)
remove_background("/mnt/user-uploads/image-29.png", "/tmp/logo_processing/rc-bible-logo-light.png", bg_color='white', threshold=240)
remove_background("/mnt/user-uploads/image-28.png", "/tmp/logo_processing/rc-bible-logo-dark.png", bg_color='black', threshold=240)
