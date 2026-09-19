import os
import re

def fix_about():
    file_path = "app.py"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # The block we want to replace starts at `    def render_about(self):`
    # and ends at `    def render_analyzer(self):`
    start_pattern = r'    def render_about\(self\):.*?    def render_analyzer\(self\):'
    
    new_about = """    def render_about(self):
        \"\"\"Render the about page\"\"\"
        from ui_components import apply_modern_styles, hero_section, about_section
        from config.settings import PROFILE_NAME, PROFILE_EMAIL, PROFILE_GITHUB, PROFILE_LINKEDIN
        
        apply_modern_styles()
        
        hero_section(
            "About Smart Resume AI",
            "A powerful AI-driven platform for optimizing your resume"
        )
        
        social_links = {}
        if PROFILE_GITHUB:
            social_links['github'] = PROFILE_GITHUB
        if PROFILE_LINKEDIN:
            social_links['linkedin'] = PROFILE_LINKEDIN
        if PROFILE_EMAIL:
            social_links['email'] = f"mailto:{PROFILE_EMAIL}"
            
        bio_content = f\"\"\"
        <h2 style="color: white; margin-bottom: 0.5rem;">{PROFILE_NAME}</h2>
        <p style="color: var(--accent-primary); font-size: 1.1rem; margin-bottom: 1.5rem;">Creator</p>
        <p style="color: #ddd; line-height: 1.6;">
            Hello! I'm {PROFILE_NAME}. I created Smart Resume AI to revolutionize how job seekers approach their career journey.
            With my background in software development and AI, I've designed this platform to
            provide intelligent, data-driven insights for resume optimization.
        </p>
        <div style="margin-top: 2rem;">
            <h3 style="color: white; margin-bottom: 1rem;">Our Vision</h3>
            <p style="color: #ddd; line-height: 1.6; font-style: italic;">
                "Smart Resume AI represents my vision of democratizing career advancement through technology.
                By combining cutting-edge AI with intuitive design, this platform empowers job seekers at
                every career stage to showcase their true potential and stand out in today's competitive job market."
            </p>
        </div>
        \"\"\"
        
        about_section(bio_content, image_path=None, social_links=social_links)

    def render_analyzer(self):"""

    # We use re.DOTALL to match across lines
    new_content = re.sub(start_pattern, new_about, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Fixed render_about.")
    else:
        print("Regex match failed.")

if __name__ == "__main__":
    fix_about()
