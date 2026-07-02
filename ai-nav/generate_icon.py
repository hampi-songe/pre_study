"""🤖 AI 机器人可爱图标 — 512px 超大尺寸，粉色科技风"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os, math

SIZE = 512
OUTPUT = os.path.join(os.path.dirname(__file__), "ai-nav.ico")

def create_icon():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = SIZE // 2

    # ═══════════ 1. 粉色渐变背景圆 ═══════════
    for r in range(SIZE // 2 - 6, 0, -1):
        ratio = r / (SIZE // 2)
        red = int(245 - 40 * (1 - ratio))
        green = int(100 + 110 * (1 - ratio))
        blue = int(180 + 60 * (1 - ratio))
        alpha = int(210 + 45 * (1 - ratio))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, alpha))

    # ═══════════ 2. 科技光环 (外圈发光) ═══════════
    for i in range(16):
        angle = i * 22.5
        px = cx + 230 * math.cos(math.radians(angle))
        py = cy + 230 * math.sin(math.radians(angle))
        for s in range(10, 2, -1):
            a = int(80 - s * 5)
            draw.ellipse([px - s, py - s, px + s, py + s], fill=(200, 220, 255, max(a, 0)))

    # ═══════════ 3. 机器人头部 (圆角方形) ═══════════
    head_left, head_top = cx - 100, cy - 110
    head_right, head_bottom = cx + 100, cy + 30
    draw.rounded_rectangle(
        [head_left, head_top, head_right, head_bottom],
        radius=30,
        fill=(220, 235, 255, 240),
        outline=(180, 200, 240, 200),
        width=4,
    )

    # ─── 3a. 天线 ───
    # 天线杆
    ant_x = cx
    draw.line([(ant_x, head_top - 5), (ant_x, head_top - 50)], fill=(200, 150, 200, 200), width=6)
    # 天线球
    for r in range(14, 2, -1):
        a = int(200 - r * 6)
        draw.ellipse([ant_x - r, head_top - 68 - r, ant_x + r, head_top - 68 + r],
                     fill=(255, 100, 150, max(a, 50)))
    # 天线信号弧
    for w in range(12, 6, -2):
        arc_rect = [ant_x - 30 - w, head_top - 90 - w, ant_x + 30 + w, head_top - 40]
        draw.arc(arc_rect, -120, -60, fill=(255, 150, 200, 180 - w * 5), width=3)

    # ─── 3b. 耳朵 (小圆球) ───
    ear_color = (255, 160, 190, 220)
    draw.ellipse([head_left - 18, cy - 70, head_left - 2, cy - 46], fill=ear_color)
    draw.ellipse([head_right + 2, cy - 70, head_right + 18, cy - 46], fill=ear_color)

    # ═══════════ 4. 大眼睛 (超萌 AI 瞳孔) ═══════════
    eye_positions = [(cx - 38, cy - 30), (cx + 38, cy - 30)]
    for ex, ey in eye_positions:
        # 眼白
        draw.ellipse([ex - 24, ey - 24, ex + 24, ey + 24], fill=(255, 255, 255, 250))
        draw.ellipse([ex - 24, ey - 24, ex + 24, ey + 24],
                     outline=(200, 220, 255, 200), width=3)
        # 瞳孔 (星形 AI 瞳孔)
        pupil_pts = []
        for i in range(10):
            a = -90 + i * 36
            r = 16 if i % 2 == 0 else 7
            x = ex + r * math.cos(math.radians(a))
            y = ey + r * math.sin(math.radians(a))
            pupil_pts.append((x, y))
        draw.polygon(pupil_pts, fill=(100, 60, 140, 250))
        # 瞳孔高光
        draw.ellipse([ex - 10, ey - 14, ex - 3, ey - 5], fill=(255, 255, 255, 230))
        draw.ellipse([ex + 5, ey - 8, ex + 10, ey - 2], fill=(255, 255, 255, 170))

    # ═══════════ 5. 腮红 ═══════════
    for bx, by in [(cx - 55, cy + 6), (cx + 55, cy + 6)]:
        for r2 in range(22, 2, -2):
            a = int(70 - r2 * 2)
            draw.ellipse([bx - r2, by - r2, bx + r2, by + r2],
                         fill=(255, 140, 170, max(a, 10)))

    # ═══════════ 6. 嘴巴 (微笑) ═══════════
    draw.arc([cx - 18, cy + 10, cx + 18, cy + 38], 10, 170, fill=(180, 80, 120, 230), width=4)

    # ═══════════ 7. 神经网络连接线 (AI 科技感) ═══════════
    nodes = [
        (cx - 140, cy - 140), (cx + 140, cy - 145), (cx - 160, cy + 60),
        (cx + 155, cy + 55), (cx - 100, cy + 110), (cx + 100, cy + 105),
        (cx, cy + 130),
    ]
    # 连接线
    connections = [(0, 1), (0, 2), (1, 3), (0, 4), (1, 5), (2, 4), (3, 5), (4, 6), (5, 6)]
    for a, b in connections:
        nx1, ny1 = nodes[a]
        nx2, ny2 = nodes[b]
        draw.line([(nx1, ny1), (nx2, ny2)], fill=(200, 180, 255, 60), width=3)
    # 节点圆
    for nx, ny in nodes:
        for rn in range(10, 3, -1):
            a = int(180 - rn * 10)
            draw.ellipse([nx - rn, ny - rn, nx + rn, ny + rn],
                         fill=(180, 150, 255, max(a, 40)))

    # ═══════════ 8. 漂浮小符号 (AI 元素) ═══════════
    ai_symbols = [
        (cx - 170, cy - 70, "◇", 30),
        (cx + 170, cy - 50, "○", 28),
        (cx - 110, cy + 165, "△", 26),
        (cx + 115, cy + 155, "◇", 24),
        (cx - 50, cy - 180, "✦", 22),
        (cx + 55, cy - 185, "✦", 20),
    ]
    for sx, sy, ch, sz in ai_symbols:
        try:
            font = ImageFont.truetype("seguiemj.ttf", sz)
        except Exception:
            font = ImageFont.load_default()
        draw.text((sx - sz // 2, sy - sz // 2), ch, fill=(255, 220, 240, 160), font=font)

    # 用圆形替代符号
    circle_positions = [
        (cx - 165, cy - 65, 10), (cx + 165, cy - 45, 9),
        (cx - 105, cy + 160, 8), (cx + 110, cy + 150, 7),
        (cx - 45, cy - 175, 6), (cx + 50, cy - 180, 5),
    ]
    for ssx, ssy, sr in circle_positions:
        for rc in range(sr, 1, -1):
            a = int(150 - rc * 12)
            draw.ellipse([ssx - rc, ssy - rc, ssx + rc, ssy + rc],
                         fill=(255, 200, 230, max(a, 30)))

    # ═══════════ 9. 底部文字 "AI" ═══════════
    try:
        font = ImageFont.truetype("seguiemj.ttf", 56)
    except Exception:
        font = ImageFont.load_default()
    draw.text((cx - 32, cy + 160), "AI", fill=(255, 255, 255, 200), font=font)

    # ═══════════ 10. 保存 ico & png ═══════════
    img.save(OUTPUT, format="ICO", sizes=[(32, 32), (64, 64), (128, 128), (256, 256)])
    # 同时保存一份 PNG 方便预览
    png_path = os.path.join(os.path.dirname(__file__), "icon_preview.png")
    img.save(png_path, "PNG")
    print(f"✅ AI 机器人图标已生成: {OUTPUT}")

if __name__ == "__main__":
    create_icon()
