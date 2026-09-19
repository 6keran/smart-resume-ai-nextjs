import os

def fix_orphans():
    file_path = "app.py"
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    new_lines = []
    for i, line in enumerate(lines):
        if line.strip() == '")':
            print(f"Removed orphan on line {i+1}")
            continue
        new_lines.append(line)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    fix_orphans()
