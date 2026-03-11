#!/usr/bin/env python3
# 创建模拟的水电费清单图片

from PIL import Image, ImageDraw, ImageFont
import textwrap

def create_utility_bill_image():
    # 创建白色背景
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    # 尝试使用系统字体
    try:
        title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
        small_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
    except:
        # 如果找不到字体，使用默认字体
        title_font = ImageFont.load_default()
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # 绘制标题
    draw.text((50, 30), "石岩房租2026年3月水电费清单", font=title_font, fill='black')
    
    # 绘制表头
    headers = ["房号", "上月水表", "当月水表", "上月电表", "当月电表"]
    x_positions = [50, 200, 350, 500, 650]
    
    for i, header in enumerate(headers):
        draw.text((x_positions[i], 100), header, font=font, fill='black')
    
    # 绘制虚线
    for x in x_positions + [800]:
        for y in range(140, 550, 5):
            if y % 10 < 5:
                draw.line([(x, y), (x, y+3)], fill='gray', width=1)
    
    # 绘制横线
    for y in [140, 200, 260, 320, 380, 440, 500]:
        draw.line([(50, y), (750, y)], fill='gray', width=1)
    
    # 绘制模拟数据
    data = [
        ("001", "2350", "2365", "12500", "12680"),
        ("002", "3420", "3438", "13800", "13950"),
        ("003", "4100", "4112", "14900", "15020"),
        ("004", "5280", "5291", "16200", "16340"),
        ("005", "6560", "6575", "17800", "17980"),
        ("006", "7430", "7448", "19100", "19250"),
        ("007", "8620", "8635", "20800", "20950"),
        ("008", "9750", "9768", "22100", "22260"),
        ("009", "10900", "10922", "23600", "23780"),
    ]
    
    for i, (room, last_water, current_water, last_elec, current_elec) in enumerate(data):
        y_pos = 160 + i * 60
        draw.text((x_positions[0], y_pos), room, font=small_font, fill='black')
        draw.text((x_positions[1], y_pos), last_water, font=small_font, fill='black')
        draw.text((x_positions[2], y_pos), current_water, font=small_font, fill='black')
        draw.text((x_positions[3], y_pos), last_elec, font=small_font, fill='black')
        draw.text((x_positions[4], y_pos), current_elec, font=small_font, fill='black')
    
    # 添加底部说明
    draw.text((50, 520), "水费: 7元/吨 | 电费: 1元/度", font=small_font, fill='gray')
    draw.text((50, 540), "合计统计: 19户", font=small_font, fill='gray')
    
    return image

def main():
    image = create_utility_bill_image()
    image.save('/root/.openclaw/workspace/test-utility-bill.png', 'PNG', quality=95)
    print("测试图片已创建: test-utility-bill.png")
    
    # 也创建一个jpg版本
    image.convert('RGB').save('/root/.openclaw/workspace/test-utility-bill.jpg', 'JPEG', quality=95)
    print("测试图片已创建: test-utility-bill.jpg")

if __name__ == "__main__":
    main()