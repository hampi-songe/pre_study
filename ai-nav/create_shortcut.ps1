# 创建桌面快捷方式 - AI 模型导航
$desktop = [Environment]::GetFolderPath("Desktop")
$targetPath = "E:\my_project\pre_study\ai-nav\index.html"
$iconPath   = "E:\my_project\pre_study\ai-nav\ai-nav.ico"
$shortcutPath = "$desktop\AI模型导航.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.IconLocation = $iconPath
$shortcut.Description = "AI 模型导航 — 快速访问 Gemini / ChatGPT / DeepSeek"
$shortcut.WorkingDirectory = "E:\my_project\pre_study\ai-nav"
$shortcut.Save()

Write-Host "✅ 桌面快捷方式已创建: $shortcutPath"
