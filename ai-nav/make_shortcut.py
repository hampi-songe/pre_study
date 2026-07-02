"""创建桌面快捷方式 — 用 win32com 可靠方法"""
import os, sys, pythoncom
from win32com.client import Dispatch

TARGET = r"E:\my_project\pre_study\ai-nav\index.html"
ICON   = r"E:\my_project\pre_study\ai-nav\ai-nav.ico"
LNK_NAME = "AI模型导航.lnk"

def create_shortcut():
    pythoncom.CoInitialize()
    try:
        shell = Dispatch("WScript.Shell")
        desktop = shell.SpecialFolders("Desktop")
        lnk_path = os.path.join(desktop, LNK_NAME)
        print(f"桌面路径: {desktop}")

        shortcut = shell.CreateShortCut(lnk_path)
        shortcut.Targetpath = TARGET
        shortcut.IconLocation = ICON
        shortcut.Description = "AI 模型导航 - Gemini / ChatGPT / DeepSeek"
        shortcut.WorkingDirectory = r"E:\my_project\pre_study\ai-nav"
        shortcut.Save()
        print(f"✅ 快捷方式已创建: {lnk_path}")
    finally:
        pythoncom.CoUninitialize()

if __name__ == "__main__":
    create_shortcut()
