import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'Title',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2c3e50'),
            alignment=1, # Center
            spaceAfter=12
        )
        self.heading_style = ParagraphStyle(
            'Heading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2980b9'),
            spaceBefore=12,
            spaceAfter=6
        )
        self.normal_style = self.styles['Normal']
        self.normal_style.fontSize = 10
        self.normal_style.leading = 14

    def generate_resume_pdf(self, data):
        """Generates a simple PDF from the resume form data."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=18
        )
        
        story = []
        
        # Personal Info
        p_info = data.get('personal_info', {})
        story.append(Paragraph(f"<b>{p_info.get('full_name', 'Name')}</b>", self.title_style))
        contact_info = f"{p_info.get('email', '')} | {p_info.get('phone', '')} | {p_info.get('location', '')}"
        story.append(Paragraph(contact_info, ParagraphStyle('Contact', parent=self.normal_style, alignment=1)))
        
        if p_info.get('linkedin') or p_info.get('portfolio'):
            links = f"LinkedIn: {p_info.get('linkedin', '')} | Portfolio: {p_info.get('portfolio', '')}"
            story.append(Paragraph(links, ParagraphStyle('Links', parent=self.normal_style, alignment=1)))
            
        story.append(Spacer(1, 12))
        
        # Summary
        if data.get('summary'):
            story.append(Paragraph("Professional Summary", self.heading_style))
            story.append(Paragraph(data['summary'], self.normal_style))
            story.append(Spacer(1, 12))
            
        # Experience
        if data.get('experiences'):
            story.append(Paragraph("Work Experience", self.heading_style))
            for exp in data['experiences']:
                header = f"<b>{exp.get('position', '')}</b> at {exp.get('company', '')} ({exp.get('start_date', '')} - {exp.get('end_date', '')})"
                story.append(Paragraph(header, self.normal_style))
                
                if exp.get('description'):
                    story.append(Paragraph(exp['description'], self.normal_style))
                    
                for resp in exp.get('responsibilities', []):
                    story.append(Paragraph(f"• {resp}", self.normal_style))
                story.append(Spacer(1, 6))
                
        # Education
        if data.get('education'):
            story.append(Paragraph("Education", self.heading_style))
            for edu in data['education']:
                edu_text = f"<b>{edu.get('degree', '')}</b>, {edu.get('institution', '')} ({edu.get('year', '')})"
                if edu.get('gpa'):
                    edu_text += f" - GPA: {edu['gpa']}"
                story.append(Paragraph(edu_text, self.normal_style))
            story.append(Spacer(1, 12))
            
        # Skills
        if data.get('skills_categories'):
            story.append(Paragraph("Skills", self.heading_style))
            cats = data['skills_categories']
            if cats.get('technical'):
                story.append(Paragraph(f"<b>Technical:</b> {', '.join(cats['technical'])}", self.normal_style))
            if cats.get('soft'):
                story.append(Paragraph(f"<b>Soft:</b> {', '.join(cats['soft'])}", self.normal_style))
            if cats.get('tools'):
                story.append(Paragraph(f"<b>Tools:</b> {', '.join(cats['tools'])}", self.normal_style))
                
        doc.build(story)
        buffer.seek(0)
        return buffer
