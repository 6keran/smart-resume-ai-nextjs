import os

def fix_app():
    file_path = "app.py"
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    new_lines = []
    for line in lines:
        # Fix icons
        line = line.replace('""', '"material/smart_toy"')
        line = line.replace('""', '"material/auto_awesome"')
        line = line.replace('""', '"material/query_stats"')
        
        # Remove stray github link garbage
        if "](https://github.com/Hunterdii/AI-Nexus)" in line:
            continue
            
        # Clean use_container_width from st.button just in case
        if "st.button" in line and "use_container_width=True" in line:
            line = line.replace(", use_container_width=True", "")
            
        new_lines.append(line)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Fixed app.py icons and links")

if __name__ == "__main__":
    fix_app()
