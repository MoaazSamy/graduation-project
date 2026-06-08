import sqlite3
import json

with open('d:/Store Project/eccomerce-master/temp.txt', 'r', encoding='utf-8') as f:
    products = json.load(f)

conn = sqlite3.connect('d:/Store Project/eccomerce-master/backend/db.sqlite3')
cursor = conn.cursor()

for pid, desc in products:
    cursor.execute('UPDATE products_product SET description = ? WHERE id = ?', (desc, pid))

conn.commit()
conn.close()
print("Database reverted successfully.")
