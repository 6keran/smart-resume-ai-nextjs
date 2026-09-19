import os
import re

def clean_st_code():
    base_dir = "d:/projects/AI-Resume-Analyzer"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.py') and "venv" not in root and ".env" not in root:
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                # Remove st.code calls
                content = re.sub(r'st\.code\([^)]+\)', '', content)
                
                # Replace 
                content = content.replace("", "")
                
                # Replace invalid fas fa-... in st.markdown if not using FontAwesome
                # The user said: "Fix icons globally... Never show: fas fa-... icon class names as visible text. Do NOT use emojis as UI icons."
                # Actually, wait, replacing `fas fa-` blindly in CSS/HTML might break existing UI if FontAwesome is removed.
                # In ui_components.py we use standard icons.
                
                if content != original:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Cleaned {filepath}")

if __name__ == "__main__":
    clean_st_code()
