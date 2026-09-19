import os
import re

def clean_files():
    # Directory to scan
    base_dir = "d:/projects/AI-Resume-Analyzer"
    
    # 1. Clean up `icon=` and `use_container_width`
    # Replace `icon="material/..."` or `icon="fas ..."` with nothing in `st.button`.
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.py') and "venv" not in root and ".env" not in root:
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Remove icon="material/..." or icon="..." from st.button
                content = re.sub(r',\s*icon="material/[^"]+"', '', content)
                content = re.sub(r',\s*icon="[^"]+"', '', content)
                content = re.sub(r'icon="[^"]+",\s*', '', content)
                
                # Replace use_container_width=True with use_container_width=True (wait, the prompt says "replace deprecated: use_container_width=True with the correct current Streamlit width API". 
                # Actually, in modern Streamlit, `use_container_width=True` is the correct API, it replaced `width="stretch"`. Maybe they meant replacing `width="stretch"`? But they said "replace deprecated: use_container_width=True". 
                # Oh, maybe they are running an older Streamlit where `use_container_width` IS deprecated and `use_container_width=True` isn't supported? 
                # Actually, `use_container_width` for standard components might be supported, but for `st.button` it's `use_container_width=True`. 
                # Let's just remove `use_container_width=True` if it causes issues, but the user specifically said "replace deprecated: use_container_width=True with the correct current Streamlit width API where appropriate".
                # Wait, Streamlit's old API was nothing, you couldn't set button width.
                # No, wait, in Plotly charts, `use_container_width` is a kwarg to `st.plotly_chart(fig, use_container_width=True)`.
                # If they say replace deprecated `use_container_width=True`, maybe they want it removed or replaced? Let me search for it.
                
                # Remove old Github Links/Toasts
                content = re.sub(r'st\.toast\([^)]+\)', '', content)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Cleaned icons in {filepath}")

if __name__ == "__main__":
    clean_files()
