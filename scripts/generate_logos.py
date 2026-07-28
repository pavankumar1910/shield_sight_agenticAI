
import os
import shutil
import glob
from pathlib import Path

def generate_logos():
    """
    Generates logo variations for ShieldSight.
    Since we cannot actually generate images with Python without Pillow (which might not be installed),
    this script will guide the user or attempt basic SVG manipulations if possible.
    
    For now, we will create the directory structure and create the SVG logo file.
    """
    print("🎨 Generating ShieldSight logos...")
    
    # Create directories
    public_dir = Path("public/logos")
    public_dir.mkdir(parents=True, exist_ok=True)
    
    # Define the SVG Content
    svg_content = """<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Shield with gradient -->
  <defs>
    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Shield shape -->
  <path d="M20 10 L30 10 L35 20 L30 30 L20 30 L15 20 Z" 
        fill="url(#shieldGradient)" 
        stroke="#1e3a8a" 
        stroke-width="2"/>
  
  <!-- Shield center (eye icon for "sight") -->
  <circle cx="25" cy="20" r="5" fill="white" opacity="0.9"/>
  <circle cx="25" cy="20" r="2" fill="#1e3a8a"/>
  
  <!-- Text: ShieldSight -->
  <text x="45" y="25" 
        font-family="Inter, sans-serif" 
        font-size="24" 
        font-weight="700" 
        fill="#1e3a8a">
    Shield<tspan fill="#2563eb">Sight</tspan>
  </text>
</svg>"""

    # Write SVG file
    svg_path = public_dir / "logo.svg"
    with open(svg_path, "w") as f:
        f.write(svg_content)
    
    print(f"✓ Generated logo.svg at {svg_path}")
    
    print("\nℹ️  Note: To generate PNGs and favicons, please install 'cairosvg' or use an online converter.")
    print(f"✅ All available logos generated successfully!")
    print(f"📁 Output directory: {public_dir}")

if __name__ == "__main__":
    generate_logos()
