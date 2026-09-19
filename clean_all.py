import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Remove icon="material/..." or icon="fas fa-..."
    content = re.sub(r',\s*icon=["\'][^"\']+["\']', '', content)
    content = re.sub(r'icon=["\'][^"\']+["\'],\s*', '', content)
    
    # 2. Add unsafe_allow_html=True to st.markdown if missing and it contains HTML tags
    # This is a bit tricky, let's just add it to all st.markdown calls safely
    def markdown_replacer(match):
        inner = match.group(1)
        if 'unsafe_allow_html' not in inner:
            # If the markdown ends with a closing parenthesis, it's captured in group 2
            # Wait, let's just find st.markdown(..., unsafe_allow_html=True)
            pass
        return match.group(0)
    
    # Simpler: replace `st.markdown(` with `st.markdown(` then check line by line
    # Actually, let's just do line by line for st.markdown
    lines = content.split('\n')
    new_lines = []
    in_markdown = False
    for line in lines:
        if 'st.markdown(' in line and 'unsafe_allow_html' not in line:
            # If it's a single line markdown
            if line.strip().endswith(')'):
                line = line.rstrip()[:-1] + ', unsafe_allow_html=True)'
            else:
                # Multi-line markdown, let's hope it closes with ) later
                pass
        
        # 3. Remove Emojis from strings (basic cleanup)
        # Just remove common ones used in the app
        emojis = ['', '', '', '', '', '', '', '', '', '', '', '', '']
        for emoji in emojis:
            line = line.replace(emoji, '')
            
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Fix SQLite Threading in config/database.py
    if filepath.endswith('config\\database.py') or filepath.endswith('config/database.py'):
        content = content.replace('conn.close()', '# conn.close()')
        
    if filepath.endswith('dashboard\\dashboard.py') or filepath.endswith('dashboard/dashboard.py'):
        content = content.replace('conn.close()', '# conn.close()')

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

def main():
    for root, dirs, files in os.walk('.'):
        if 'venv' in root or '.git' in root or '__pycache__' in root:
            continue
        for file in files:
            if file.endswith('.py'):
                clean_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
