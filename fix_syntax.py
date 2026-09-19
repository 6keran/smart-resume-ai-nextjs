import os

def fix_syntax():
    file_path = "app.py"
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if line.startswith("    def render_analyzer(self):"):
            start_idx = i
        if start_idx != -1 and i > start_idx and line.startswith("    def render_home(self):"):
            end_idx = i
            break
            
    if start_idx != -1 and end_idx != -1:
        new_lines = lines[:start_idx] + [
            "    def render_analyzer(self):\n",
            '        """Render the resume analyzer page"""\n',
            "        from pages.analyzer_page import render_analyzer_page\n",
            "        render_analyzer_page(self)\n\n"
        ] + lines[end_idx:]
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print("Fixed render_analyzer syntax successfully.")
    else:
        print(f"Could not find bounds. start: {start_idx}, end: {end_idx}")

if __name__ == "__main__":
    fix_syntax()
