import os

def fix_builder():
    file_path = "pages/builder_page.py"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    new_step_5 = """    elif st.session_state.builder_step == 5:
        st.subheader("Review & Generate")
        
        # Template selection
        templates = ["Modern", "Professional", "Minimal", "Creative", "Executive", "Technical", "Academic", "Startup"]
        selected_template = st.selectbox("Select Resume Template", templates)
        form_data['template'] = selected_template
        
        st.markdown("### Template Preview", unsafe_allow_html=True)
        preview_html = app.builder.generate_preview(selected_template, form_data)
        if preview_html:
            import streamlit.components.v1 as components
            components.html(preview_html, height=600, scrolling=True)
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
                            file_name=f"{form_data['personal_info']['full_name'].replace(' ', '_')}_Resume.docx",
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
                            file_name=f"{form_data['personal_info']['full_name'].replace(' ', '_')}_Resume.pdf",
                            mime="application/pdf"
                        )
                        st.success("PDF generated! Click the button above to download.")
                    except Exception as e:
                        st.error(f"Error generating PDF: {str(e)}")

    st.markdown('</div>', unsafe_allow_html=True)"""

    import re
    # We replace the step 5 logic
    pattern = r"    elif st\.session_state\.builder_step == 5:.*?(?=    st\.markdown\('</div>', unsafe_allow_html=True\))"
    new_content = re.sub(pattern, new_step_5, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Updated builder page templates logic.")
    else:
        print("Failed to update builder page")

if __name__ == "__main__":
    fix_builder()
