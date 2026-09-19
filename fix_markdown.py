import os
import re

def fix_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find st.markdown(...) that contains HTML but misses unsafe_allow_html=True
    # We will do this by looking for st.markdown calls
    # Since regex for nested parenthesis is hard, we can just replace specific known HTML markdown calls.
    # A simpler approach: replace `st.markdown(` with `st.markdown(` and add unsafe_allow_html=True to ALL st.markdown calls?
    # No, it's better to just add it where missing.
    
    # Regex to find st.markdown( ... ) 
    # This is a bit tricky. Let's just find `st.markdown(` and if it doesn't end with `unsafe_allow_html=True)`, append it.
    
    # Actually, a safer regex:
    def replacer(match):
        inner = match.group(1)
        if 'unsafe_allow_html' not in inner and ('<' in inner or 'f"' in inner or 'f\'' in inner):
            # If the inner text seems to be a string that might contain HTML
            if inner.endswith(')'):
                return match.group(0) # something went wrong with matching
            return f"st.markdown({inner}, unsafe_allow_html=True)"
        return match.group(0)

    new_content = re.sub(r'st\.markdown\(\s*(.*?)\s*\)', replacer, content, flags=re.DOTALL)
    
    # Let's write a simple script to add unsafe_allow_html=True to ANY st.markdown that doesn't have it.
    pass

def simpler_fix(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i in range(len(lines)):
        if "st.markdown(" in lines[i] and "unsafe_allow_html" not in lines[i]:
            # if it's a one-liner:
            if lines[i].strip().endswith(")"):
                # Check if it has HTML
                if "<" in lines[i]:
                    lines[i] = lines[i].replace(")", ", unsafe_allow_html=True)")
            # if it spans multiple lines, we might miss it.
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            simpler_fix(os.path.join(root, file))

if __name__ == "__main__":
    print("Done")
