import sqlite3

conn = sqlite3.connect('d:/Store Project/eccomerce-master/backend/db.sqlite3')
cursor = conn.cursor()

cursor.execute('SELECT id, description FROM products_product')
products = cursor.fetchall()

for pid, desc in products:
    if not desc or "--- مواصفات إضافية ---" in desc:
        continue
    
    lines = desc.split('\n')
    new_desc_lines = []
    specs_lines = []
    
    for line in lines:
        l = line.strip()
        if not l:
            continue
            
        # Check if line looks like a spec
        is_spec = False
        if l.startswith("الكاميرا") or l.startswith("الشاشة") or l.startswith("المعالج") or l.startswith("البطارية"):
            is_spec = True
            if ":" not in l:
                if l.startswith("الكاميرا"): l = l.replace("الكاميرا", "الكاميرا:", 1)
                elif l.startswith("الشاشة"): l = l.replace("الشاشة", "الشاشة:", 1)
                elif l.startswith("المعالج"): l = l.replace("المعالج", "المعالج:", 1)
                elif l.startswith("البطارية"): l = l.replace("البطارية", "البطارية:", 1)
        
        elif l.lower().startswith("ram") or l.lower().startswith("storage") or l.lower().startswith("storge"):
            is_spec = True
            if ":" not in l:
                if l.lower().startswith("ram"): l = l.replace(l[:3], "RAM:", 1)
                elif l.lower().startswith("storge"): l = l.replace(l[:6], "Storage:", 1)
                elif l.lower().startswith("storage"): l = l.replace(l[:7], "Storage:", 1)
                
        # If product 5 (long review), only move sentences that start exactly with specs, but honestly it's better to leave them if they are full sentences ending with dot
        if pid == 5 and l.endswith("."):
            new_desc_lines.append(l)
            continue
            
        if is_spec:
            specs_lines.append(l)
        else:
            new_desc_lines.append(l)

    if specs_lines:
        final_desc = '\n'.join(new_desc_lines) + '\n\n--- مواصفات إضافية ---\n' + '\n'.join(specs_lines)
        cursor.execute('UPDATE products_product SET description = ? WHERE id = ?', (final_desc, pid))

conn.commit()
conn.close()
print("Database updated successfully.")
