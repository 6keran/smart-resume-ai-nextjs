import streamlit as st

def render_analyzer_page(app):
    from ui_components import (
        page_header, metric_card
    )
    from config.database import save_resume_data, save_analysis_data
    
    if not hasattr(app, 'analyzer'):
        from utils.resume_analyzer import ResumeAnalyzer
        app.analyzer = ResumeAnalyzer()
    if not hasattr(app, 'ai_analyzer'):
        from utils.ai_resume_analyzer import AIResumeAnalyzer
        app.ai_analyzer = AIResumeAnalyzer()

    page_header(
        "Resume Analyzer",
        "Get instant AI-powered feedback to optimize your resume"
    )

    analyzer_tabs = st.tabs(["Standard Analyzer", "AI Analyzer", "Job Match", "Resume Improver"])

    with analyzer_tabs[0]:
        st.info("Standard Analyzer is legacy and primarily for offline use. Please use the AI Analyzer for better results.")
        # We can keep the basic standard analyzer form here or just deprecate it.
        # For brevity and since the user wants a premium AI SaaS, we will focus on AI.
        
    with analyzer_tabs[1]:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="margin-top: 0;">AI Resume Analysis</h3>', unsafe_allow_html=True)
        st.markdown('<p style="color: var(--text-secondary);">Upload your resume for a comprehensive AI review.</p>', unsafe_allow_html=True)
        uploaded_file = st.file_uploader("Upload your resume (PDF/DOCX)", type=['pdf', 'docx'], key="ai_resume")
        
        if uploaded_file and st.button("Analyze with Gemini AI", use_container_width=True, type="primary"):
            with st.spinner("Analyzing your resume with Gemini AI..."):
                text = ""
                try:
                    if uploaded_file.type == "application/pdf":
                        text = app.ai_analyzer.extract_text_from_pdf(uploaded_file)
                    else:
                        text = app.ai_analyzer.extract_text_from_docx(uploaded_file)
                except Exception as e:
                    st.error(f"Error reading file: {str(e)}")
                    
                if text:
                    analysis = app.ai_analyzer.analyze_resume_with_gemini(text)
                    if "error" in analysis:
                        st.error(analysis["error"])
                    else:
                        st.session_state['latest_ai_analysis'] = analysis
                        st.success("Analysis Complete!")
                        st.rerun()

        if 'latest_ai_analysis' in st.session_state:
            st.markdown('</div>', unsafe_allow_html=True)
            st.markdown('<hr class="saas-divider">', unsafe_allow_html=True)
            analysis = st.session_state['latest_ai_analysis']
            
            # Score Cards
            cols = st.columns(2)
            with cols[0]:
                metric_card("Overall Resume Score", f"{analysis.get('resume_score', 0)}/100", status="positive" if analysis.get('resume_score', 0) > 75 else "warning")
            with cols[1]:
                metric_card("ATS Optimization", f"{analysis.get('ats_score', 0)}/100", status="positive" if analysis.get('ats_score', 0) > 75 else "warning")
            
            # Show full text
            st.markdown('<div class="glass-card" style="margin-top: 2rem;">', unsafe_allow_html=True)
            st.markdown(analysis.get('analysis', ''), unsafe_allow_html=False)
            st.markdown('</div>', unsafe_allow_html=True)
            
    with analyzer_tabs[2]:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="margin-top: 0;">Job Description Match</h3>', unsafe_allow_html=True)
        st.markdown('<p style="color: var(--text-secondary);">Compare your resume against a specific job description to find missing keywords and tailor your application.</p>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        with col1:
            jd_resume = st.file_uploader("Upload Resume for JD Match", type=['pdf', 'docx'], key="jd_resume")
        with col2:
            jd_text = st.text_area("Paste Job Description", height=150)
            
        if jd_resume and jd_text and st.button("Compare Match", use_container_width=True, type="primary"):
            with st.spinner("Analyzing match..."):
                try:
                    if jd_resume.type == "application/pdf":
                        text = app.ai_analyzer.extract_text_from_pdf(jd_resume)
                    else:
                        text = app.ai_analyzer.extract_text_from_docx(jd_resume)
                        
                    analysis = app.ai_analyzer.analyze_resume_with_gemini(text, job_description=jd_text)
                    st.markdown('<div class="glass-card" style="margin-top: 1rem;">', unsafe_allow_html=True)
                    st.markdown(analysis.get('analysis', ''), unsafe_allow_html=False)
                    st.markdown('</div>', unsafe_allow_html=True)
                except Exception as e:
                    st.error(f"Error during job match: {str(e)}")
        st.markdown('</div>', unsafe_allow_html=True)

    with analyzer_tabs[3]:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="margin-top: 0;">AI Bullet Point Improver</h3>', unsafe_allow_html=True)
        st.markdown('<p style="color: var(--text-secondary);">Paste a bullet point from your experience section. AI will rewrite it using strong action verbs and metrics.</p>', unsafe_allow_html=True)
        
        bullet = st.text_area("Original Bullet Point", height=100, placeholder="e.g. Led a team of 5 to build a new feature")
        if bullet and st.button("Improve Bullet", use_container_width=True, type="primary"):
            with st.spinner("Improving..."):
                if hasattr(app.ai_analyzer, 'improve_bullet'):
                    improved = app.ai_analyzer.improve_bullet(bullet)
                    st.markdown('<div class="glass-card" style="margin-top: 1rem;">', unsafe_allow_html=True)
                    st.markdown("#### Improved Versions:", unsafe_allow_html=True)
                    st.markdown(improved, unsafe_allow_html=False)
                    st.markdown('</div>', unsafe_allow_html=True)
                else:
                    st.error("Improvement method not yet implemented in backend.")
