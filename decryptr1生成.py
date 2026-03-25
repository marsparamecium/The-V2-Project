#会加密同目录下的worker.js,你的捐款是我们的最大的动力
import base64
import re

LOGIC_KEY = "ARK2028_MARS" 
OFFSET = 10                  

def depcryptr1_encrypt(plain_text):
    # 强制转化为 UTF-8 字节流
    raw_bytes = plain_text.encode('utf-8')
    result = bytearray()
    for i, b in enumerate(raw_bytes):
        # 字节级异或 + 物理位移
        xor_val = b ^ ord(LOGIC_KEY[i % len(LOGIC_KEY)])
        # 确保结果在 0-255 字节范围内（加位移后再取模）
        result.append((xor_val + OFFSET) % 256)
    return base64.b64encode(result).decode('utf-8')

def sovereign_refactor(input_file, output_file):
    print(f"--- [IGNITION] 正在读取原始固件: {input_file} ---")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 正则：匹配 atob('...')
    pattern = r"atob\(['\"](.+?)['\"]\)"

    def replace_logic(match):
        original_b64 = match.group(1)
        try:
            # 1. 解码原始 Base64（可能是中文内容）
            # 注意：先尝试 utf-8 解码，如果不行再退回 latin-1
            raw_data_bytes = base64.b64decode(original_b64)
            try:
                raw_data = raw_data_bytes.decode('utf-8')
            except:
                raw_data = raw_data_bytes.decode('latin-1')
                
            # 2. 执行字节级二次加密
            encrypted_payload = depcryptr1_encrypt(raw_data)
            return f"depcryptr1_decode('{encrypted_payload}')"
        except Exception as e:
            print(f"--- [WARN] 节点处理失败: {original_b64[:20]}..., 错误: {e} ---")
            return match.group(0)

    new_content = re.sub(pattern, replace_logic, content)

    # 3. 注入支持 UTF-8 的 JS 解码引擎
    js_engine = f"""
// [550C CIC: depcryptr1 v2.0 字节流引擎]
function depcryptr1_decode(d){{
    let k="{LOGIC_KEY}", r=atob(d), u=new Uint8Array(r.length);
    for(let i=0;i<r.length;i++){{
        u[i]=(r.charCodeAt(i)-{OFFSET})^k.charCodeAt(i%k.length);
    }}
    return new TextDecoder().decode(u);
}}
"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_engine + "\n" + new_content)
    
    print(f"--- [SUCCESS] 固件重构完成: {output_file} ---")

if __name__ == "__main__":
    sovereign_refactor('worker.js', 'worker_sovereign.js')
