
import os
from pathlib import Path
from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM

def generate_icons():
    # Paths
    project_root = Path(__file__).parent.parent
    svg_path = project_root / "frontend" / "public" / "logo.svg"
    public_dir = project_root / "frontend" / "public"

    if not svg_path.exists():
        print(f"Error: Could not find logo.svg at {svg_path}")
        return

    print(f"Reading {svg_path}...")
    
    try:
        drawing = svg2rlg(str(svg_path))
        
        # Icon sizes
        sizes = [192, 512]
        
        for size in sizes:
            output_path = public_dir / f"icon-{size}.png"
            print(f"Generating {output_path} ({size}x{size})...")
            
            # Scale the drawing
            sx = size / drawing.width
            sy = size / drawing.height
            drawing.scale(sx, sy)
            drawing.width = size
            drawing.height = size
            
            # Render
            renderPM.drawToFile(drawing, str(output_path), fmt="PNG")
            
            # Reset scaling for next iteration (reload or unscale)
            # Simplest is to reload
            drawing = svg2rlg(str(svg_path))
            
        print("✅ Icons generated successfully!")
        
    except Exception as e:
        print(f"Error generating icons: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    generate_icons()
