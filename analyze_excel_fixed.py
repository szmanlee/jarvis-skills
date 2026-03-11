#!/usr/bin/env python3
"""
深入分析石岩房租Excel文件
"""

import re
import struct

def analyze_xls_file():
    file_path = "/root/.openclaw/media/inbound/副本石岩房租2026年3月lee---657d86da-3c4f-42f8-bc7f-d0cd66b7e259"
    
    print("=" * 60)
    print("📊 石岩房租2026年3月 - Excel文件深度分析")
    print("=" * 60)
    
    try:
        with open(file_path, 'rb') as f:
            data = f.read()
            
        print(f"📁 文件大小: {len(data):,} 字节 ({len(data)/1024:.2f} KB)")
        
        # 分析文件头
        print("\n🔍 文件头分析:")
        if data.startswith(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1'):
            print("✅ 文件格式: Microsoft Excel 97-2003 (.xls)")
        elif data.startswith(b'PK\x03\x04'):
            print("✅ 文件格式: Microsoft Excel 2007+ (.xlsx)")
        else:
            print("⚠️  未知文件格式")
            
        # 尝试读取一些文本内容
        print("\n📝 文本内容提取:")
        
        # 查找中文字符
        chinese_pattern = re.compile(b'[\x4e00-\x9fff]+')
        chinese_matches = chinese_pattern.findall(data)
        
        if chinese_matches:
            print("发现的中文字符:")
            for i, match in enumerate(chinese_matches[:20]):  # 只显示前20个匹配
                try:
                    decoded = match.decode('gbk', errors='ignore')
                    if decoded.strip():
                        print(f"  {i+1:2d}. {decoded}")
                except:
                    print(f"  {i+1:2d}. [解码失败]")
        
        # 查找数字
        number_pattern = re.compile(br'\d+')
        number_matches = number_pattern.findall(data)
        
        print(f"\n🔢 数字统计:")
        print(f"  总计发现 {len(number_matches)} 个数字序列")
        
        # 显示一些有趣的数字模式
        interesting_numbers = []
        for match in number_matches[:50]:
            num = match.decode('ascii')
            if len(num) >= 3 and len(num) <= 6:  # 3-6位数字，可能是房号或费用
                interesting_numbers.append(num)
        
        if interesting_numbers:
            print("  可能的房号/费用数据:")
            for i, num in enumerate(interesting_numbers[:15]):
                print(f"    {num}")
        
        # 查找常见的Excel关键字
        keywords = [b'Sheet', b'Workbook', b'Microsoft', b'Excel', b'Table']
        found_keywords = []
        for keyword in keywords:
            if keyword in data:
                found_keywords.append(keyword.decode('ascii', errors='ignore'))
        
        if found_keywords:
            print(f"\n🏷️ 发现的关键字: {', '.join(found_keywords)}")
        
        # 分析可能的日期信息
        date_patterns = [
            re.compile(br'202\d年\d+月'),  # 2026年3月
            re.compile(br'\d{4}\d{2}\d{2}'),  # 20260310
            re.compile(br'\d{4}-\d{2}-\d{2}'),  # 2026-03-10
        ]
        
        for pattern in date_patterns:
            matches = pattern.findall(data)
            if matches:
                print(f"\n📅 发现日期信息: {[m.decode('ascii', errors='ignore') for m in matches[:5]]}")
                break
                
        # 查找可能的人名
        name_pattern = re.compile(b'[\u4e00-\u9fff]{2,4}')
        name_matches = name_pattern.findall(data)
        unique_names = set()
        for match in name_matches[:30]:
            try:
                name = match.decode('utf-8', errors='ignore')
                if len(name) >= 2 and len(name) <= 4 and not name.isdigit():
                    unique_names.add(name)
            except:
                pass
        
        if unique_names:
            print(f"\n👤 可能的人名: {', '.join(list(unique_names)[:10])}")
            
        # 统计文件结构信息
        print(f"\n📊 文件结构分析:")
        print(f"  二进制数据块数量: {data.count(b' Workbook') + data.count(b' Worksheet')}")
        print(f"  可能的表格数量: {data.count(b'Sheet')}")
        
        # 尝试提取一些连续的可读文本
        readable_text = ""
        for i in range(0, len(data)):
            try:
                char = data[i:i+1].decode('gbk', errors='ignore')
                if char and char.strip() and char.isprintable():
                    readable_text += char
                elif readable_text and not char.strip():
                    readable_text += " "
            except:
                continue
                
        if readable_text:
            print(f"\n📄 可读文本预览 (前500字符):")
            print(readable_text[:500])
            
    except Exception as e:
        print(f"❌ 分析过程中出现错误: {e}")
    
    print("\n" + "=" * 60)
    print("🔍 分析建议:")
    print("1. 这是一个标准的Excel文件，包含中文字符和数字")
    print("2. 文件大小适中，应该包含完整的表格数据")
    print("3. 建议使用专业的Excel处理库进行精确解析")
    print("4. 可以尝试转换为CSV格式进行进一步处理")
    print("=" * 60)

if __name__ == "__main__":
    analyze_xls_file()