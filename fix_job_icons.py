import os
import re

def fix_job_icons():
    base_dir = "d:/projects/AI-Resume-Analyzer"
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.py') and "venv" not in root and ".env" not in root:
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                
                # Remove all  and <i class=""></i> completely
                content = re.sub(r'<i class="f[a|b]s fa-[^"]+"[^>]*></i>', '', content)
                content = re.sub(r'<i class=\'f[a|b]s fa-[^\']+\'[^>]*></i>', '', content)
                
                # In dictionaries or strings, map fas fa- to nothing or standard words if needed,
                # but to be completely safe against literal text, let's just strip "" strings.
                content = re.sub(r'""]+"', '""', content)
                content = re.sub(r'""]+"', '""', content)
                
                if content != original:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Removed fa icons from {filepath}")

if __name__ == "__main__":
    fix_job_icons()
