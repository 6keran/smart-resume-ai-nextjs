"""Module containing job-related data and configurations"""

# Job titles and skills suggestions
JOB_SUGGESTIONS = [
    {"text": "Software Engineer", "icon": "💻"},
    {"text": "Full Stack Developer", "icon": "🔧"},
    {"text": "Data Scientist", "icon": ""},
    {"text": "Product Manager", "icon": "📱"},
    {"text": "DevOps Engineer", "icon": "⚙️"},
    {"text": "UI/UX Designer", "icon": "🎨"},
    {"text": "Python Developer", "icon": "🐍"},
    {"text": "Java Developer", "icon": "☕"},
    {"text": "React Developer", "icon": "⚛️"},
    {"text": "Machine Learning Engineer", "icon": ""},
    {"text": "Backend Developer", "icon": "🖧"},
    {"text": "Frontend Developer", "icon": "🎨"},
    {"text": "Node.js Developer", "icon": "🌿"},
    {"text": "Angular Developer", "icon": "📐"},
    {"text": "PHP Developer", "icon": "🐘"},
    {"text": "Ruby Developer", "icon": "💎"},
    {"text": "Go Developer", "icon": ""},
    {"text": "C++ Developer", "icon": "🖥️"},
    {"text": "C# Developer", "icon": "🎮"},
    {"text": "Django Developer", "icon": "🛠️"},
    {"text": "Data Analyst", "icon": "📈"},
    {"text": "Big Data Engineer", "icon": "📡"},
    {"text": "Database Administrator", "icon": "🗄️"},
    {"text": "Business Intelligence Analyst", "icon": ""},
    {"text": "Cloud Engineer", "icon": "☁️"},
    {"text": "AWS Engineer", "icon": "☁️🔧"},
    {"text": "Azure Engineer", "icon": "☁️🖥️"},
    {"text": "Google Cloud Engineer", "icon": "☁️📡"},
    {"text": "Network Engineer", "icon": "🔌"},
    {"text": "AI Researcher", "icon": "🧠"},
    {"text": "NLP Engineer", "icon": "🗣️"},
    {"text": "Computer Vision Engineer", "icon": "👁️"},
    {"text": "Deep Learning Engineer", "icon": "🧠📚"},
    {"text": "Cybersecurity Analyst", "icon": "🔒"},
    {"text": "Ethical Hacker", "icon": "🕵️‍♂️"},
    {"text": "Security Engineer", "icon": "🛡️"},
    {"text": "Penetration Tester", "icon": ""},
    {"text": "Cryptography Engineer", "icon": "🔑"},
    {"text": "Game Developer", "icon": "🎮"},
    {"text": "Embedded Systems Engineer", "icon": "🖧⚙️"},
    {"text": "Mobile App Developer", "icon": "📱"},
    {"text": "iOS Developer", "icon": "🍏"},
    {"text": "Android Developer", "icon": ""},
    {"text": "Blockchain Developer", "icon": "🔗"},
    {"text": "IoT Developer", "icon": "🌐"},
    {"text": "AR/VR Developer", "icon": "🕶️"},
    {"text": "Project Manager", "icon": "📋"},
    {"text": "Technical Writer", "icon": "✍️"},
    {"text": "QA Engineer", "icon": ""},
    {"text": "Scrum Master", "icon": "🔄"},
    {"text": "Support Engineer", "icon": "📞"},
    {"text": "IT Consultant", "icon": "🧑‍💼"},
    {"text": "Technical Support Specialist", "icon": "🎧"}
]


# Location suggestions - organized by states and major cities
LOCATION_SUGGESTIONS = [
    # Work modes
    {"text": "Remote", "icon": "", "type": "work_mode"},
    {"text": "Work from Home", "icon": "", "type": "work_mode"},
    {"text": "Hybrid", "icon": "🏢", "type": "work_mode"},
    
    # Major tech hubs
    {"text": "Bangalore", "icon": "📍", "type": "city", "state": "Karnataka"},
    {"text": "Mumbai", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Delhi", "icon": "📍", "type": "city", "state": "Delhi"},
    {"text": "Hyderabad", "icon": "📍", "type": "city", "state": "Telangana"},
    {"text": "Pune", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Chennai", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    {"text": "Noida", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    {"text": "Gurgaon", "icon": "📍", "type": "city", "state": "Haryana"},
    
    # States
    {"text": "Karnataka", "icon": "🗺️", "type": "state"},
    {"text": "Maharashtra", "icon": "🗺️", "type": "state"},
    {"text": "Tamil Nadu", "icon": "🗺️", "type": "state"},
    {"text": "Telangana", "icon": "🗺️", "type": "state"},
    {"text": "Delhi", "icon": "🗺️", "type": "state"},
    {"text": "Uttar Pradesh", "icon": "🗺️", "type": "state"},
    {"text": "Gujarat", "icon": "🗺️", "type": "state"},
    {"text": "Rajasthan", "icon": "🗺️", "type": "state"},
    {"text": "Kerala", "icon": "🗺️", "type": "state"},
    {"text": "West Bengal", "icon": "🗺️", "type": "state"},
    {"text": "Punjab", "icon": "🗺️", "type": "state"},
    {"text": "Haryana", "icon": "🗺️", "type": "state"},
    {"text": "Andhra Pradesh", "icon": "🗺️", "type": "state"},
    {"text": "Madhya Pradesh", "icon": "🗺️", "type": "state"},
    {"text": "Bihar", "icon": "🗺️", "type": "state"},
    
    # Karnataka cities
    {"text": "Mysore", "icon": "📍", "type": "city", "state": "Karnataka"},
    {"text": "Hubli", "icon": "📍", "type": "city", "state": "Karnataka"},
    {"text": "Mangalore", "icon": "📍", "type": "city", "state": "Karnataka"},
    {"text": "Belgaum", "icon": "📍", "type": "city", "state": "Karnataka"},
    {"text": "Davangere", "icon": "📍", "type": "city", "state": "Karnataka"},
    
    # Maharashtra cities
    {"text": "Nagpur", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Nashik", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Aurangabad", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Kolhapur", "icon": "📍", "type": "city", "state": "Maharashtra"},
    {"text": "Solapur", "icon": "📍", "type": "city", "state": "Maharashtra"},
    
    # Tamil Nadu cities
    {"text": "Coimbatore", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    {"text": "Madurai", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    {"text": "Salem", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    {"text": "Tiruchirappalli", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    {"text": "Vellore", "icon": "📍", "type": "city", "state": "Tamil Nadu"},
    
    # Uttar Pradesh cities
    {"text": "Lucknow", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    {"text": "Kanpur", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    {"text": "Agra", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    {"text": "Varanasi", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    {"text": "Meerut", "icon": "📍", "type": "city", "state": "Uttar Pradesh"},
    
    # Andhra Pradesh cities
    {"text": "Vijayawada", "icon": "📍", "type": "city", "state": "Andhra Pradesh"},
    {"text": "Visakhapatnam", "icon": "📍", "type": "city", "state": "Andhra Pradesh"},
    {"text": "Tirupati", "icon": "📍", "type": "city", "state": "Andhra Pradesh"},
    {"text": "Guntur", "icon": "📍", "type": "city", "state": "Andhra Pradesh"},
    {"text": "Nellore", "icon": "📍", "type": "city", "state": "Andhra Pradesh"},
    
    # West Bengal cities
    {"text": "Kolkata", "icon": "📍", "type": "city", "state": "West Bengal"},
    {"text": "Darjeeling", "icon": "📍", "type": "city", "state": "West Bengal"},
    {"text": "Siliguri", "icon": "📍", "type": "city", "state": "West Bengal"},
    {"text": "Durgapur", "icon": "📍", "type": "city", "state": "West Bengal"},
    {"text": "Asansol", "icon": "📍", "type": "city", "state": "West Bengal"},
    
    # Gujarat cities
    {"text": "Ahmedabad", "icon": "📍", "type": "city", "state": "Gujarat"},
    {"text": "Surat", "icon": "📍", "type": "city", "state": "Gujarat"},
    {"text": "Vadodara", "icon": "📍", "type": "city", "state": "Gujarat"},
    {"text": "Rajkot", "icon": "📍", "type": "city", "state": "Gujarat"},
    {"text": "Bhavnagar", "icon": "📍", "type": "city", "state": "Gujarat"},
    
    # Rajasthan cities
    {"text": "Jaipur", "icon": "📍", "type": "city", "state": "Rajasthan"},
    {"text": "Jodhpur", "icon": "📍", "type": "city", "state": "Rajasthan"},
    {"text": "Udaipur", "icon": "📍", "type": "city", "state": "Rajasthan"},
    {"text": "Kota", "icon": "📍", "type": "city", "state": "Rajasthan"},
    {"text": "Ajmer", "icon": "📍", "type": "city", "state": "Rajasthan"},
    
    # Kerala cities
    {"text": "Kochi", "icon": "📍", "type": "city", "state": "Kerala"},
    {"text": "Thiruvananthapuram", "icon": "📍", "type": "city", "state": "Kerala"},
    {"text": "Kozhikode", "icon": "📍", "type": "city", "state": "Kerala"},
    {"text": "Thrissur", "icon": "📍", "type": "city", "state": "Kerala"},
    {"text": "Alappuzha", "icon": "📍", "type": "city", "state": "Kerala"},
    
    # Punjab cities
    {"text": "Amritsar", "icon": "📍", "type": "city", "state": "Punjab"},
    {"text": "Ludhiana", "icon": "📍", "type": "city", "state": "Punjab"},
    {"text": "Jalandhar", "icon": "📍", "type": "city", "state": "Punjab"},
    {"text": "Patiala", "icon": "📍", "type": "city", "state": "Punjab"},
    {"text": "Bathinda", "icon": "📍", "type": "city", "state": "Punjab"},
    
    # Haryana cities
    {"text": "Faridabad", "icon": "📍", "type": "city", "state": "Haryana"},
    {"text": "Panipat", "icon": "📍", "type": "city", "state": "Haryana"},
    {"text": "Ambala", "icon": "📍", "type": "city", "state": "Haryana"},
    {"text": "Karnal", "icon": "📍", "type": "city", "state": "Haryana"},
    {"text": "Hisar", "icon": "📍", "type": "city", "state": "Haryana"},
    
    # Northeast cities
    {"text": "Guwahati", "icon": "📍", "type": "city", "state": "Assam"},
    {"text": "Shillong", "icon": "📍", "type": "city", "state": "Meghalaya"},
    {"text": "Imphal", "icon": "📍", "type": "city", "state": "Manipur"},
    {"text": "Aizawl", "icon": "📍", "type": "city", "state": "Mizoram"},
    {"text": "Gangtok", "icon": "📍", "type": "city", "state": "Sikkim"},
    
    # Union Territories
    {"text": "Chandigarh", "icon": "📍", "type": "city", "state": "Chandigarh"},
    {"text": "Port Blair", "icon": "📍", "type": "city", "state": "Andaman and Nicobar Islands"},
    {"text": "Shimla", "icon": "📍", "type": "city", "state": "Himachal Pradesh"},
    {"text": "Dehradun", "icon": "📍", "type": "city", "state": "Uttarakhand"},
    {"text": "Itanagar", "icon": "📍", "type": "city", "state": "Arunachal Pradesh"}
]

# Function to get cities by state
def get_cities_by_state(state_name):
    """Get list of cities for a specific state"""
    return [loc for loc in LOCATION_SUGGESTIONS if loc.get("type") == "city" and loc.get("state") == state_name]

# Function to get all states
def get_all_states():
    """Get list of all states"""
    return [loc for loc in LOCATION_SUGGESTIONS if loc.get("type") == "state"]

# Job types
JOB_TYPES = [
    {"id": "all", "text": "All Types"},
    {"id": "full-time", "text": "Full Time"},
    {"id": "part-time", "text": "Part Time"},
    {"id": "contract", "text": "Contract"},
    {"id": "internship", "text": "Internship"},
    {"id": "remote", "text": "Remote"}
]

# Experience levels
EXPERIENCE_RANGES = [
    {"id": "all", "text": "All Levels"},
    {"id": "fresher", "text": "Fresher"},
    {"id": "1-3", "text": "1-3 years"},
    {"id": "3-5", "text": "3-5 years"},
    {"id": "5-7", "text": "5-7 years"},
    {"id": "7+", "text": "7+ years"}
]

# Salary ranges
SALARY_RANGES = [
    {"id": "all", "text": "All Ranges"},
    {"id": "0-3", "text": "0-3 LPA"},
    {"id": "3-6", "text": "3-6 LPA"},
    {"id": "6-10", "text": "6-10 LPA"},
    {"id": "10-15", "text": "10-15 LPA"},
    {"id": "15+", "text": "15+ LPA"}
]