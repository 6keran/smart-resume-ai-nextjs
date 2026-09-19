import streamlit as st

def apply_modern_styles():
    """Apply modern styles by loading the CSS file (handled in app.py)"""
    pass

def render_custom_sidebar(active_page="Home"):
    """Render the custom sidebar using styled Streamlit buttons"""
    
    st.sidebar.markdown("""
        <div class="sidebar-header" style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 2rem; font-weight: bold; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SR</div>
            <div class="sidebar-title" style="font-weight: 600;">Smart Resume AI</div>
            <div class="sidebar-subtitle" style="color: var(--text-secondary); font-size: 0.8rem;">Build Your Better Tomorrow</div>
        </div>
    """, unsafe_allow_html=True)
    
    nav_items = [
        ("Home", "Home"),
        ("Analyzer", "Resume Analyzer"),
        ("Builder", "Resume Builder"),
        ("Jobs", "Job Search"),
        ("Dashboard", "Dashboard"),
        ("Feedback", "Feedback"),
        ("About", "About")
    ]
    
    for key, display_name in nav_items:
        # Use primary kind if active, secondary if not
        kind = "primary" if display_name.lower() == active_page.lower() else "secondary"
        if st.sidebar.button(display_name, key=f"nav_{key}", use_container_width=True, type=kind):
            st.session_state.page = display_name.lower()
            st.rerun()
            
    st.sidebar.markdown("""
        <div style="margin-top: auto; padding-top: 2rem;">
            <div class="glass-card" style="text-align: center; padding: 1rem;">
                <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">AI-Powered<br>Career Growth</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Analyze. Improve. Build.</div>
            </div>
        </div>
    """, unsafe_allow_html=True)

def hero_section(title=None, subtitle=None):
    """Render the hero section. If title/subtitle are given, render a simple page hero; otherwise the home page hero."""
    if title:
        st.markdown(f"""
        <div class="saas-header" style="margin-bottom: 2rem;">
            <h1 class="saas-title">{title}</h1>
            {f'<p class="saas-subtitle">{subtitle}</p>' if subtitle else ''}
        </div>
        """, unsafe_allow_html=True)
        return
    st.markdown("""
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div class="hero-section">
            <div class="hero-welcome">WELCOME TO</div>
            <h1 class="hero-title">Smart <span>Resume AI</span></h1>
            <p class="hero-subtitle">Transform your resume into new opportunities with the power of AI.<br>Analyze, improve, build and apply — all in one place.</p>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn-primary">Get Started <i class="fas fa-arrow-right" style="margin-left: 5px;"></i></button>
                <button class="btn-secondary">Explore Features</button>
            </div>
        </div>
        
        <div class="hero-illustration">
            <div class="glass-panel">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: white; margin-bottom: 1rem;"></i>
                <h3>Your Future<br>Starts Here</h3>
                <p>A smarter resume.<br>A brighter career.</p>
            </div>
            
            <div class="floating-icon float-1"><i class="fas fa-chart-bar"></i></div>
            <div class="floating-icon float-2"><i class="fas fa-sparkles"></i></div>
            <div class="floating-icon float-3"><i class="fas fa-briefcase"></i></div>
            <div class="floating-icon float-4"><i class="fas fa-user"></i></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def core_features_grid():
    """Render the exact 3x2 core features grid from the mockup"""
    features = [
        {
            "icon": "fa-search-document", 
            "title": "AI Resume Analyzer", 
            "desc": "Get detailed analysis, ATS score, strengths, weaknesses and improvement suggestions.",
            "bg_class": "bg-analyzer"
        },
        {
            "icon": "fa-file-invoice", 
            "title": "Resume Builder", 
            "desc": "Create a professional resume with modern templates and live preview.",
            "bg_class": "bg-builder"
        },
        {
            "icon": "fa-pen-to-square", 
            "title": "AI Resume Improvement", 
            "desc": "Improve your resume section-by-section with AI while maintaining factual accuracy.",
            "bg_class": "bg-improve"
        },
        {
            "icon": "fa-briefcase", 
            "title": "Job Search", 
            "desc": "Find relevant job opportunities based on your skills and interests.",
            "bg_class": "bg-search"
        },
        {
            "icon": "fa-chart-simple", 
            "title": "Dashboard", 
            "desc": "Track your progress, view analysis history and compare previous versions.",
            "bg_class": "bg-dash"
        },
        {
            "icon": "fa-comment-dots", 
            "title": "Feedback", 
            "desc": "Share your feedback and suggestions to help us improve.",
            "bg_class": "bg-feed"
        }
    ]
    
    html = '<div class="feature-section"><h2 style="font-size: 1.5rem; margin-bottom: 0;">Core Features</h2><div class="feature-grid">'
    for f in features:
        # FontAwesome mapping, standard fa icons
        icon_map = {
            "fa-search-document": "fa-search",
            "fa-file-invoice": "fa-file-alt",
            "fa-pen-to-square": "fa-edit",
            "fa-briefcase": "fa-briefcase",
            "fa-chart-simple": "fa-chart-bar",
            "fa-comment-dots": "fa-comment-alt"
        }
        icon = icon_map.get(f['icon'], f['icon'])
        
        html += f"""
        <div class="feature-card">
            <div class="feature-icon-wrapper {f['bg_class']}">
                <i class="fas {icon}"></i>
            </div>
            <div class="feature-content">
                <h3>{f['title']}</h3>
                <p>{f['desc']}</p>
            </div>
            <div class="feature-arrow">
                <i class="fas fa-arrow-right"></i>
            </div>
        </div>
        """
    html += '</div></div>'
    st.markdown(html, unsafe_allow_html=True)

def mission_banner():
    """Render the 'Our Mission' banner from the mockup"""
    st.markdown("""
    <div class="mission-banner">
        <div class="mission-icon">
            <i class="fas fa-bullseye"></i>
        </div>
        <div class="mission-text">
            <h3>Our Mission</h3>
            <p>To empower job seekers with AI-driven tools that make career growth simple, effective and accessible.<br>We believe everyone deserves the opportunity to showcase their true potential.</p>
        </div>
        <div class="mission-bullets">
            <div>Better Resumes</div>
            <div>More Opportunities</div>
            <div>Brighter Careers</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

def footer():
    """Render the page footer"""
    st.markdown("""
    <div class="custom-footer">
        <div class="footer-left">
            <div class="footer-logo">
                <i class="fas fa-chart-network" style="font-size: 0.8rem;"></i>
            </div>
            <div>
                <strong style="color: white;">Smart Resume AI</strong><br>
                <span>Your Career Companion</span>
            </div>
        </div>
        <div class="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Help</a>
            <span>© 2024 Smart Resume AI. All rights reserved.</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

def page_header(title, subtitle=None):
    """Render a consistent page header with modern SaaS styling"""
    st.markdown(
        f'''
        <div class="saas-header">
            <h1 class="saas-title">{title}</h1>
            {f'<p class="saas-subtitle">{subtitle}</p>' if subtitle else ''}
        </div>
        ''',
        unsafe_allow_html=True
    )

def metric_card(label, value, delta=None, icon=None, status="neutral"):
    """Render a modern metric card"""
    delta_html = f'<div class="stat-trend {status}" style="font-size: 0.875rem; font-weight: 600; margin-top: 0.25rem;">{delta}</div>' if delta else ''
    icon_html = f'<div style="color: var(--accent-primary); margin-bottom: 0.5rem;">:{icon}:</div>' if icon else ''
    
    st.markdown(f"""
        <div class="stat-card">
            {icon_html}
            <div class="stat-title">{label}</div>
            <div class="stat-value">{value}</div>
            {delta_html}
        </div>
    """, unsafe_allow_html=True)

def template_card(title, description, image_url=None):
    """Render a modern template card with glassmorphism effect"""
    image_html = f'<img src="{image_url}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;" />' if image_url else ''
    
    st.markdown(f"""
        <div class="glass-card" style="cursor: pointer;">
            {image_html}
            <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem;">{title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">{description}</p>
        </div>
    """, unsafe_allow_html=True)

def render_analytics_section(score_data):
    """Render analytics charts with standard Streamlit components"""
    st.markdown('<h3 style="margin: 2rem 0 1rem;">Analytics Overview</h3>', unsafe_allow_html=True)
    
    cols = st.columns(3)
    with cols[0]:
        metric_card("Total Analyses", score_data.get('total_analyses', 0))
    with cols[1]:
        avg_score = score_data.get('average_score', 0)
        status = "positive" if avg_score > 75 else ("warning" if avg_score > 50 else "negative")
        metric_card("Average Score", f"{avg_score}%", status=status)
    with cols[2]:
        metric_card("Highest Score", f"{score_data.get('highest_score', 0)}%", status="positive")

def render_activity_section(activities):
    """Render a modern recent activity timeline"""
    st.markdown('<h3 style="margin: 2rem 0 1rem;">Recent Activity</h3>', unsafe_allow_html=True)
    
    if not activities:
        st.info("No recent activity found.")
        return
        
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    for act in activities:
        st.markdown(f"""
            <div style="display: flex; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
                <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 8px; margin-right: 1rem;">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div>
                    <h4 style="margin: 0; font-size: 1rem;">{act.get('title', 'Resume Analysis')}</h4>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">{act.get('date', '')}</p>
                </div>
                <div style="margin-left: auto; text-align: right;">
                    <div class="saas-badge badge-info">{act.get('score', 0)}% Score</div>
                </div>
            </div>
        """, unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

def render_suggestions_section(suggestions):
    """Render personalized suggestions"""
    st.markdown('<h3 style="margin: 2rem 0 1rem;">AI Recommendations</h3>', unsafe_allow_html=True)
    
    if not suggestions:
        st.info("Complete an analysis to get personalized suggestions.")
        return
        
    for sug in suggestions:
        st.markdown(f"""
            <div class="glass-card" style="margin-bottom: 1rem; border-left: 4px solid var(--accent-primary);">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">{sug.get('title', 'Suggestion')}</h4>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">{sug.get('description', '')}</p>
            </div>
        """, unsafe_allow_html=True)

def about_section(bio_html, image_path=None, social_links=None):
    """Render the About page profile section."""
    social_links = social_links or {}
    
    links_html = ""
    for key, url in social_links.items():
        label = key.capitalize()
        links_html += f'<a href="{url}" target="_blank" style="color: var(--accent-primary); margin-right: 1rem; text-decoration: none;">{label}</a>'
    
    st.markdown(f"""
        <div class="glass-card" style="padding: 2rem;">
            {bio_html}
            <div style="margin-top: 1.5rem;">
                {links_html}
            </div>
        </div>
    """, unsafe_allow_html=True)