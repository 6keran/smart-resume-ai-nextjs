import re
import os

file_path = "dashboard/dashboard.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove self.conn = get_database_connection() from __init__
content = re.sub(r'(\s+)self\.conn = get_database_connection\(\)\n', r'\1pass\n', content)

# Replace cursor = self.conn.cursor() with:
# conn = get_database_connection()
# cursor = conn.cursor()
content = re.sub(r'(\n\s+)cursor = self\.conn\.cursor\(\)', r'\1conn = get_database_connection()\1cursor = conn.cursor()', content)

# Replace pd.read_sql_query(query, self.conn) with:
# conn = get_database_connection()
# df = pd.read_sql_query(query, conn)
# conn.close()
content = re.sub(r'(\n\s+)df = pd\.read_sql_query\(query,\s*self\.conn\)', r'\1conn = get_database_connection()\1df = pd.read_sql_query(query, conn)\1conn.close()', content)

# To properly close the cursor connections without breaking returns, we can just replace returns
# Wait, contextlib closing is much cleaner.
# Let's change get_database_connection in dashboard manager.
# Actually, the simplest fix is to change self.conn into a property that returns a connection!
# But then the connections are left open.
# Instead of complex regex, let's just make the changes directly using replace_file_content or multi_replace.
