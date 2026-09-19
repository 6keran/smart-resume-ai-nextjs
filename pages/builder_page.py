import streamlit as st

def render_builder_page(app):
    from ui_components import page_header
    
    if not hasattr(app, 'builder'):
        from utils.resume_builder import ResumeBuilder
        app.builder = ResumeBuilder()
        
    if not hasattr(app, 'pdf_generator'):
        from utils.pdf_generator import PDFGenerator
        app.pdf_generator = PDFGenerator()
        
    page_header("Resume Builder", "Create a professional, ATS-friendly resume in minutes")
    
    # Initialize multi-step state
    if 'builder_step' not in st.session_state:
        st.session_state.builder_step = 1
        
    # Steps visualization
    steps = ["Personal Info", "Summary & Skills", "Experience", "Education & Projects", "Review & Generate"]
    
    # Render Step Progress
    st.markdown('<div class="glass-card" style="margin-bottom: 2rem; padding: 1rem;">', unsafe_allow_html=True)
    cols = st.columns(len(steps))
    for i, step in enumerate(steps):
        with cols[i]:
            if i + 1 < st.session_state.builder_step:
                st.markdown(f'<div style="text-align: center; color: var(--accent-success); font-weight: bold;">✓ {step}</div>', unsafe_allow_html=True)
            elif i + 1 == st.session_state.builder_step:
                st.markdown(f'<div style="text-align: center; color: var(--accent-primary); font-weight: bold; border-bottom: 2px solid var(--accent-primary); padding-bottom: 0.5rem;">{i+1}. {step}</div>', unsafe_allow_html=True)
            else:
                st.markdown(f'<div style="text-align: center; color: var(--text-muted);">{i+1}. {step}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Helper function to get dict
    form_data = st.session_state.form_data

    # Main Form Area
    st.markdown('<div class="glass-card" style="padding: 2rem;">', unsafe_allow_html=True)
    
    if st.session_state.builder_step == 1:
        st.subheader("Personal Information")
        col1, col2 = st.columns(2)
        with col1:
            form_data['personal_info']['full_name'] = st.text_input("Full Name", value=form_data['personal_info'].get('full_name', ''))
            form_data['personal_info']['email'] = st.text_input("Email", value=form_data['personal_info'].get('email', ''))
            form_data['personal_info']['phone'] = st.text_input("Phone", value=form_data['personal_info'].get('phone', ''))
        with col2:
            form_data['personal_info']['location'] = st.text_input("Location", value=form_data['personal_info'].get('location', ''))
            form_data['personal_info']['linkedin'] = st.text_input("LinkedIn URL", value=form_data['personal_info'].get('linkedin', ''))
            form_data['personal_info']['portfolio'] = st.text_input("Portfolio Website", value=form_data['personal_info'].get('portfolio', ''))
            
    elif st.session_state.builder_step == 2:
        st.subheader("Professional Summary")
        form_data['summary'] = st.text_area("Summary", value=form_data.get('summary', ''), height=150)
        
        st.subheader("Skills")
        if 'skills_categories' not in form_data:
            form_data['skills_categories'] = {'technical': [], 'soft': [], 'languages': [], 'tools': []}
            
        col1, col2 = st.columns(2)
        with col1:
            tech_input = st.text_area("Technical Skills (comma separated)", value=", ".join(form_data['skills_categories']['technical']))
            form_data['skills_categories']['technical'] = [s.strip() for s in tech_input.split(',') if s.strip()]
            
            soft_input = st.text_area("Soft Skills (comma separated)", value=", ".join(form_data['skills_categories']['soft']))
            form_data['skills_categories']['soft'] = [s.strip() for s in soft_input.split(',') if s.strip()]
        with col2:
            tools_input = st.text_area("Tools & Technologies (comma separated)", value=", ".join(form_data['skills_categories']['tools']))
            form_data['skills_categories']['tools'] = [s.strip() for s in tools_input.split(',') if s.strip()]
            
            lang_input = st.text_area("Languages (comma separated)", value=", ".join(form_data['skills_categories']['languages']))
            form_data['skills_categories']['languages'] = [s.strip() for s in lang_input.split(',') if s.strip()]
            
    elif st.session_state.builder_step == 3:
        st.subheader("Work Experience")
        if 'experiences' not in form_data:
            form_data['experiences'] = []
            
        if st.button("Add Experience"):
            form_data['experiences'].append({
                'company': '', 'position': '', 'start_date': '', 'end_date': '', 'description': '', 'responsibilities': [], 'achievements': []
            })
            st.rerun()
            
        for idx, exp in enumerate(form_data['experiences']):
            with st.expander(f"Experience {idx + 1}: {exp.get('company', 'New')}", expanded=True):
                col1, col2 = st.columns(2)
                with col1:
                    exp['company'] = st.text_input("Company", value=exp.get('company', ''), key=f"comp_{idx}")
                    exp['position'] = st.text_input("Position", value=exp.get('position', ''), key=f"pos_{idx}")
                with col2:
                    exp['start_date'] = st.text_input("Start Date", value=exp.get('start_date', ''), key=f"sd_{idx}")
                    exp['end_date'] = st.text_input("End Date", value=exp.get('end_date', ''), key=f"ed_{idx}")
                
                exp['description'] = st.text_area("Overview", value=exp.get('description', ''), key=f"desc_{idx}")
                
                resp_input = st.text_area("Responsibilities (one per line)", value="\n".join(exp.get('responsibilities', [])), key=f"resp_{idx}")
                exp['responsibilities'] = [r.strip() for r in resp_input.split('\n') if r.strip()]
                
                if st.button("Delete this experience", key=f"del_exp_{idx}"):
                    form_data['experiences'].pop(idx)
                    st.rerun()
                    
    elif st.session_state.builder_step == 4:
        st.subheader("Education")
        if 'education' not in form_data:
            form_data['education'] = []
            
        if st.button("Add Education"):
            form_data['education'].append({
                'degree': '', 'institution': '', 'year': '', 'gpa': '', 'highlights': []
            })
            st.rerun()
            
        for idx, edu in enumerate(form_data['education']):
            with st.expander(f"Education {idx + 1}: {edu.get('institution', 'New')}", expanded=True):
                col1, col2 = st.columns(2)
                with col1:
                    edu['degree'] = st.text_input("Degree", value=edu.get('degree', ''), key=f"deg_{idx}")
                    edu['institution'] = st.text_input("Institution", value=edu.get('institution', ''), key=f"inst_{idx}")
                with col2:
                    edu['year'] = st.text_input("Graduation Year", value=edu.get('year', ''), key=f"yr_{idx}")
                    edu['gpa'] = st.text_input("GPA (Optional)", value=edu.get('gpa', ''), key=f"gpa_{idx}")
                if st.button("Delete this education", key=f"del_edu_{idx}"):
                    form_data['education'].pop(idx)
                    st.rerun()
                    
        st.subheader("Projects")
        if 'projects' not in form_data:
            form_data['projects'] = []
            
        if st.button("Add Project"):
            form_data['projects'].append({
                'name': '', 'role': '', 'technologies': '', 'description': '', 'link': ''
            })
            st.rerun()
            
        for idx, proj in enumerate(form_data['projects']):
            with st.expander(f"Project {idx + 1}: {proj.get('name', 'New')}", expanded=True):
                col1, col2 = st.columns(2)
                with col1:
                    proj['name'] = st.text_input("Project Name", value=proj.get('name', ''), key=f"proj_nm_{idx}")
                    proj['role'] = st.text_input("Your Role", value=proj.get('role', ''), key=f"proj_role_{idx}")
                with col2:
                    proj['technologies'] = st.text_input("Technologies (comma separated)", value=proj.get('technologies', ''), key=f"proj_tech_{idx}")
                    proj['link'] = st.text_input("Project Link", value=proj.get('link', ''), key=f"proj_link_{idx}")
                
                proj['description'] = st.text_area("Description", value=proj.get('description', ''), key=f"proj_desc_{idx}")
                if st.button("Delete this project", key=f"del_proj_{idx}"):
                    form_data['projects'].pop(idx)
                    st.rerun()
                    
    elif st.session_state.builder_step == 5:
        st.subheader("Review & Generate")
        
        # Template selection
        templates = ["Modern", "Professional", "Minimal", "Creative", "Executive", "Technical", "Academic", "Startup"]
        selected_template = st.selectbox("Select Resume Template", templates)
        form_data['template'] = selected_template
        
        st.markdown("### Template Preview")
        preview_data = app.builder.generate_preview(selected_template, form_data)
        if preview_data and isinstance(preview_data, dict):
            import streamlit.components.v1 as components
            combined_html = f"<style>{preview_data.get('css', '')}</style>{preview_data.get('html', '')}"
            components.html(combined_html, height=600, scrolling=True)
        else:
            st.info("No preview available for this template.")
            
        st.success("All steps completed! You can now generate your resume.")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Generate Document (DOCX)", type="primary"):
                with st.spinner("Generating document..."):
                    try:
                        buffer = app.builder.generate_resume(form_data)
                        st.download_button(
                            label="Download DOCX",
                            data=buffer,
                            file_name=f"{form_data['personal_info'].get('full_name', 'Resume').replace(' ', '_')}_Resume.docx",
                            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )
                        st.success("Document generated! Click the button above to download.")
                    except Exception as e:
                        st.error(f"Error generating document: {str(e)}")
                        
        with col2:
            if st.button("Generate Document (PDF)", type="primary"):
                with st.spinner("Generating PDF..."):
                    try:
                        buffer = app.pdf_generator.generate_resume_pdf(form_data)
                        st.download_button(
                            label="Download PDF",
                            data=buffer,
                            file_name=f"{form_data['personal_info'].get('full_name', 'Resume').replace(' ', '_')}_Resume.pdf",
                            mime="application/pdf"
                        )
                        st.success("PDF generated! Click the button above to download.")
                    except Exception as e:
                        st.error(f"Error generating PDF: {str(e)}")

    st.markdown('</div>', unsafe_allow_html=True)

    # Navigation Buttons
    st.markdown("<br>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1, 2, 1])
    with col1:
        if st.session_state.builder_step > 1:
            if st.button("Previous Step", use_container_width=True):
                st.session_state.builder_step -= 1
                st.rerun()
    with col3:
        if st.session_state.builder_step < 5:
            if st.button("Next Step", type="primary", use_container_width=True):
                st.session_state.builder_step += 1
                st.rerun()
