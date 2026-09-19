import re

def refactor_dashboard():
    with open("dashboard/dashboard.py", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add closing import
    if "from contextlib import closing" not in content:
        content = "from contextlib import closing\n" + content

    # 2. Remove self.conn = get_database_connection()
    content = re.sub(r'(\s+)self\.conn = get_database_connection\(\)\n', r'\1pass\n', content)

    # 3. Find all method definitions
    methods = [
        "get_resume_metrics", "get_skill_distribution", "get_weekly_trends",
        "get_job_category_stats", "get_resume_data", "export_to_excel",
        "export_to_csv", "export_to_json", "get_database_stats",
        "get_admin_logs", "get_trend_indicators", "get_detailed_insights",
        "get_quick_stats"
    ]
    
    # Let's replace 'self.conn' directly.
    # For pd.read_sql_query(query, self.conn):
    def replace_pd(m):
        indent = m.group(1)
        return f"{indent}conn = get_database_connection()\n{indent}df = pd.read_sql_query(query, conn)\n{indent}conn.close()"
    content = re.sub(r'(\n[ \t]+)df = pd\.read_sql_query\(query,\s*self\.conn\)', replace_pd, content)
    
    # For cursor = self.conn.cursor():
    # We will replace it with:
    # conn = get_database_connection()
    # cursor = conn.cursor()
    # And then we will replace 'return' with 'conn.close(); return'
    # but ONLY inside methods that have 'conn = get_database_connection()'
    
    lines = content.split('\n')
    new_lines = []
    in_db_method = False
    for line in lines:
        if re.match(r'^\s*def\s+\w+\(self.*\):', line):
            in_db_method = False
            
        if 'cursor = self.conn.cursor()' in line:
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}conn = get_database_connection()")
            new_lines.append(f"{indent}cursor = conn.cursor()")
            in_db_method = True
            continue
            
        if in_db_method and re.match(r'^\s*return\b', line):
            indent = line[:len(line) - len(line.lstrip())]
            new_lines.append(f"{indent}conn.close()")
            new_lines.append(line)
            continue
            
        new_lines.append(line)
        
    with open("dashboard/dashboard.py", "w", encoding="utf-8") as f:
        f.write('\n'.join(new_lines))

if __name__ == "__main__":
    refactor_dashboard()
    print("Dashboard refactored successfully.")
