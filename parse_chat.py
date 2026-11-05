import re
import json

with open('chat_dump.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for JSON scripts
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")

# Look for remix or next or conversation data
for i, s in enumerate(scripts):
    if '__remixContext' in s or '__NEXT_DATA__' in s or 'linear_conversation' in s:
        print(f"Script {i} matched keyword!")
        # save it
        with open(f'script_{i}.js', 'w', encoding='utf-8') as sf:
            sf.write(s)

# Also search for messages
matches = re.findall(r'"parts":\s*\["(.*?)"\]', html)
print(f"Parts matches: {len(matches)}")
for m in matches:
    # unescape
    cleaned = m.encode('utf-8').decode('unicode_escape')
    print("--- PART ---")
    print(cleaned[:300])

# Search for "author":{"role":
author_matches = re.finditer(r'"author":\s*\{"role":\s*"([^"]+)"[^}]*\}.*?"parts":\s*\[(.*?)\]', html)
for am in author_matches:
    print("ROLE:", am.group(1))
    print("CONTENT:", am.group(2)[:200])
