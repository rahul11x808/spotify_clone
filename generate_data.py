
import os
import json
import re

BASE_DIR = "/home/rahul/Desktop/Data/coding/major_project/spotify_clone"
SONGS_DIR = os.path.join(BASE_DIR, "songs")
IMG_DIR = os.path.join(BASE_DIR, "img")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(DATA_DIR, exist_ok=True)

def parse_prefix(filename):
    # Pattern 1: "1. Song.mp3"
    match = re.match(r"^(\d+)\.", filename)
    if match:
        return int(match.group(1))
    
    # Pattern 2: "01 - 1.mp3" -> Extract the second number if possible, or first if it makes sense. 
    # Actually, looking at "01 - 1.mp3", the second number '1' matches the image '1. ...'.
    # Let's try to capture the number that is likely the ID.
    match = re.match(r"^\d+\s*-\s*(\d+)\.", filename)
    if match:
        return int(match.group(1))
        
    return None


all_songs = {
    "bangla": [],
    "hindi": []
}

def generate_data(lang):
    song_path_base = os.path.join(SONGS_DIR, lang)
    img_path_base = os.path.join(IMG_DIR, lang)
    
    if not os.path.exists(song_path_base):
        print(f"Directory not found: {song_path_base}")
        return

    # Get all song files
    song_files = [f for f in os.listdir(song_path_base) if f.endswith('.mp3')]
    # Get all img files
    img_files = [f for f in os.listdir(img_path_base) if f.endswith('.jpg') or f.endswith('.png') or f.endswith('.jpeg')]
    
    # Sort by prefix
    song_files.sort(key=lambda x: parse_prefix(x) or 9999)
    img_files.sort(key=lambda x: parse_prefix(x) or 9999)

    for i, song_file in enumerate(song_files):
        # Use sequential image assignment
        # If we have images, use them in order. 
        # If i < len(img_files), use img_files[i].
        # If we run out of images, maybe reuse them or show logo?
        # User said: "akta img delet korachi toba tar jaigai tarporar imgta bosao" 
        # (I deleted one, put the next one in its place).
        # This implies standard sequential filling.
        
        cover_file = None
        if i < len(img_files):
            cover_file = img_files[i]
        
        # Clean up song name
        name_no_ext = os.path.splitext(song_file)[0]
        # Remove numbers
        song_name = re.sub(r"^\d+(\s*-\s*\d+)?\.\s*", "", name_no_ext).strip()
        
        # Split by various separators to keep just the main title
        # Handle both standard pipe | and full-width pipe ｜
        song_name = song_name.replace('｜', '|').split('|')[0].strip()
        
        # Also split by " - " if it looks like "Title - Artist"
        # But be careful, some titles might have hyphens.
        # Let's trust the pipe separator more.
        
        # Truncate if too long (e.g. > 20 chars)
        if len(song_name) > 20:
            song_name = song_name[:17] + "..."
        
        entry = {
            "songName": song_name,
            "filePath": f"songs/{lang}/{song_file}",
            "coverPath": f"img/{lang}/{cover_file}" if cover_file else "img/logo.png"
        }
        all_songs[lang].append(entry)

generate_data("bangla")
generate_data("hindi")

# Write to JS file
output_file = os.path.join(DATA_DIR, "songs_data.js")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("window.songsData = ")
    json.dump(all_songs, f, indent=2, ensure_ascii=False)
    f.write(";")
print(f"Generated {output_file}")
