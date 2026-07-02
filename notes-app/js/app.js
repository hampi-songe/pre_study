/**
 * 妙记 - 多功能笔记软件
 * 完整 JavaScript 应用逻辑
 */

// ============================================
// 1. 简单的 Markdown 解析器 (轻量级)
// ============================================
class MarkdownParser {
    parse(text) {
        if (!text) return '<p style="color: var(--text-placeholder)">暂无内容</p>';
        
        let html = text;

        // 转义 HTML 特殊字符
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 代码块 (必须最先处理)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            const langClass = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${langClass}>${code.trim()}</code></pre>`;
        });

        // 行内代码
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 图片
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

        // 链接
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // 水平线
        html = html.replace(/^---$/gm, '<hr>');

        // 引用块
        html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
        // 合并相邻的 blockquote
        html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

        // 粗体 & 斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // 标题
        html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // 无序列表
        html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // 有序列表
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        // 将数字列表的 li 包装在 ol 中（如果还没被 ul 包装）
        html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
            if (match.includes('<ul>')) return match;
            return '<ol>' + match + '</ol>';
        });

        // 表格
        html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
            const cells = content.split('|').map(c => c.trim());
            if (cells.every(c => /^:?-+:?$/.test(c))) return '<hr class="table-sep">';
            return '<tr>' + cells.map(c => {
                if (c.startsWith(':') && c.endsWith(':')) return `<td style="text-align:center">${c.slice(1,-1)}</td>`;
                if (c.endsWith(':')) return `<td style="text-align:right">${c.slice(0,-1)}</td>`;
                return `<td>${c}</td>`;
            }).join('') + '</tr>';
        });
        html = html.replace(/<tr>.*<\/tr>\n?<hr class="table-sep">\n?<tr>/g, '<thead>$&</thead><tbody>');
        html = html.replace(/<hr class="table-sep">/g, '');
        html = html.replace(/(<thead>.*<\/thead>)(<tbody>.*)?/g, '<table>$1$2</table>');

        // 段落 (未被包裹的文本)
        html = html.replace(/^(?!<[houplt]|<tr|<th|<td)/gm, '<p>');
        html = html.replace(/$/gm, '</p>');
        // 清理空的或嵌套的段落
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p><\/p>/g, '');

        return html;
    }
}

// ============================================
// 2. 数据存储层
// ============================================
class Storage {
    constructor() {
        this.STORAGE_KEY = 'miaoyi_notes';
        this.SETTINGS_KEY = 'miaoyi_settings';
        this.TAGS_KEY = 'miaoyi_tags';
    }

    // --- 笔记操作 ---
    getNotes() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        } catch { return []; }
    }

    saveNotes(notes) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    }

    getNote(id) {
        return this.getNotes().find(n => n.id === id) || null;
    }

    addNote(note) {
        const notes = this.getNotes();
        notes.unshift(note);
        this.saveNotes(notes);
        return note;
    }

    updateNote(id, updates) {
        const notes = this.getNotes();
        const idx = notes.findIndex(n => n.id === id);
        if (idx === -1) return null;
        notes[idx] = { ...notes[idx], ...updates, updatedAt: Date.now() };
        this.saveNotes(notes);
        return notes[idx];
    }

    deleteNote(id) {
        const notes = this.getNotes();
        const idx = notes.findIndex(n => n.id === id);
        if (idx === -1) return false;
        notes.splice(idx, 1);
        this.saveNotes(notes);
        return true;
    }

    // --- 标签操作 ---
    getTags() {
        try {
            return JSON.parse(localStorage.getItem(this.TAGS_KEY)) || [];
        } catch { return []; }
    }

    saveTags(tags) {
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
    }

    addTag(tag) {
        const tags = this.getTags();
        tags.push(tag);
        this.saveTags(tags);
        return tag;
    }

    removeTag(tagId) {
        let tags = this.getTags();
        tags = tags.filter(t => t.id !== tagId);
        this.saveTags(tags);
        // 从所有笔记中移除该标签
        const notes = this.getNotes();
        notes.forEach(n => {
            if (n.tags) {
                n.tags = n.tags.filter(t => t.id !== tagId);
            }
        });
        this.saveNotes(notes);
        return true;
    }

    // --- 设置操作 ---
    getSettings() {
        const defaults = {
            theme: 'light',
            editorMode: 'split',
            autoSave: 3000,
            fontSize: '16px',
            sort: 'updated',
            viewMode: 'list'
        };
        try {
            return { ...defaults, ...JSON.parse(localStorage.getItem(this.SETTINGS_KEY)) };
        } catch { return defaults; }
    }

    saveSettings(settings) {
        const current = this.getSettings();
        const merged = { ...current, ...settings };
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(merged));
        return merged;
    }
}

// ============================================
// 3. 笔记应用主类
// ============================================
class NotesApp {
    constructor() {
        this.storage = new Storage();
        this.mdParser = new MarkdownParser();
        this.settings = this.storage.getSettings();
        this.currentNoteId = null;
        this.currentTag = 'all';
        this.searchQuery = '';
        this.isSaving = false;
        this.saveTimer = null;
        this.editorMode = this.settings.editorMode || 'split';

        // DOM 引用
        this.els = {};
        this.initDOM();
        this.bindEvents();
        this.applySettings();
        this.loadNotes();
        this.loadTags();
        this.showToast('欢迎使用妙记 ✨', 'info');
    }

    // --- DOM 初始化 ---
    initDOM() {
        const $ = (id) => document.getElementById(id);
        this.els = {
            app: $('app'),
            sidebar: $('sidebar'),
            toggleSidebar: $('toggleSidebar'),
            menuToggle: $('menuToggle'),
            searchInput: $('searchInput'),
            newNoteBtn: $('newNoteBtn'),
            emptyNewNoteBtn: $('emptyNewNoteBtn'),
            notesList: $('notesList'),
            notesCount: $('notesCount'),
            tagsList: $('tagsList'),
            customTags: $('customTags'),
            addTagBtn: $('addTagBtn'),
            allCount: $('allCount'),
            favCount: $('favCount'),
            trashCount: $('trashCount'),
            noteTitle: $('noteTitle'),
            noteEditor: $('noteEditor'),
            noteDate: $('noteDate'),
            noteWordCount: $('noteWordCount'),
            emptyState: $('emptyState'),
            editorArea: $('editorArea'),
            previewContent: $('previewContent'),
            previewToggle: $('previewToggle'),
            pinNoteBtn: $('pinNoteBtn'),
            favNoteBtn: $('favNoteBtn'),
            deleteNoteBtn: $('deleteNoteBtn'),
            themeToggle: $('themeToggle'),
            exportNoteBtn: $('exportNoteBtn'),
            settingsBtn: $('settingsBtn'),
            footerStats: $('footerStats'),
            boldBtn: $('boldBtn'),
            italicBtn: $('italicBtn'),
            headingBtn: $('headingBtn'),
            listBtn: $('listBtn'),
            codeBtn: $('codeBtn'),
            imageBtn: $('imageBtn'),
            // Modals
            tagModal: $('tagModal'),
            tagModalClose: $('tagModalClose'),
            tagNameInput: $('tagNameInput'),
            tagColors: $('tagColors'),
            tagModalCancel: $('tagModalCancel'),
            tagModalConfirm: $('tagModalConfirm'),
            settingsModal: $('settingsModal'),
            settingsModalClose: $('settingsModalClose'),
            settingsCancel: $('settingsCancel'),
            settingsSave: $('settingsSave'),
            settingEditorMode: $('settingEditorMode'),
            settingAutoSave: $('settingAutoSave'),
            settingFontSize: $('settingFontSize'),
            settingSort: $('settingSort'),
            settingViewMode: $('settingViewMode'),
            confirmModal: $('confirmModal'),
            confirmTitle: $('confirmTitle'),
            confirmMessage: $('confirmMessage'),
            confirmCancel: $('confirmCancel'),
            confirmOk: $('confirmOk'),
            confirmModalClose: $('confirmModalClose'),
            toastContainer: $('toastContainer'),
        };
    }

    // --- 事件绑定 ---
    bindEvents() {
        // 侧边栏切换
        this.els.toggleSidebar.addEventListener('click', () => this.toggleSidebar());
        this.els.menuToggle.addEventListener('click', () => this.toggleSidebar(true));

        // 搜索
        this.els.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.renderNotesList();
        });

        // 新建笔记
        this.els.newNoteBtn.addEventListener('click', () => this.createNote());
        this.els.emptyNewNoteBtn.addEventListener('click', () => this.createNote());

        // 笔记标题和内容编辑 (自动保存)
        this.els.noteTitle.addEventListener('input', () => this.scheduleSave());
        this.els.noteEditor.addEventListener('input', () => {
            this.updatePreview();
            this.scheduleSave();
        });

        // 标签过滤
        this.els.tagsList.addEventListener('click', (e) => {
            const item = e.target.closest('.tag-item');
            if (item) this.setCurrentTag(item.dataset.tag);
        });

        // 添加标签按钮
        this.els.addTagBtn.addEventListener('click', () => this.showTagModal());

        // 标签颜色选择
        this.els.tagColors.addEventListener('click', (e) => {
            const opt = e.target.closest('.color-option');
            if (opt) {
                this.els.tagColors.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            }
        });

        // 标签模态框确认/取消
        this.els.tagModalConfirm.addEventListener('click', () => this.createTag());
        this.els.tagModalCancel.addEventListener('click', () => this.hideTagModal());
        this.els.tagModalClose.addEventListener('click', () => this.hideTagModal());
        this.els.tagNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.createTag();
            if (e.key === 'Escape') this.hideTagModal();
        });

        // 预览切换
        this.els.previewToggle.addEventListener('click', () => this.togglePreviewMode());

        // 置顶/收藏/删除
        this.els.pinNoteBtn.addEventListener('click', () => this.togglePin());
        this.els.favNoteBtn.addEventListener('click', () => this.toggleFav());
        this.els.deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());

        // 主题切换
        this.els.themeToggle.addEventListener('click', () => this.toggleTheme());

        // 导出
        this.els.exportNoteBtn.addEventListener('click', () => this.exportNote());

        // 设置
        this.els.settingsBtn.addEventListener('click', () => this.showSettings());
        this.els.settingsSave.addEventListener('click', () => this.saveSettings());
        this.els.settingsCancel.addEventListener('click', () => this.hideSettings());
        this.els.settingsModalClose.addEventListener('click', () => this.hideSettings());

        // 确认对话框
        this.els.confirmCancel.addEventListener('click', () => this.hideConfirm());
        this.els.confirmOk.addEventListener('click', () => this.executeConfirm());
        this.els.confirmModalClose.addEventListener('click', () => this.hideConfirm());

        // 编辑器工具栏
        this.els.boldBtn.addEventListener('click', () => this.insertMarkdown('**', '**', '粗体文本'));
        this.els.italicBtn.addEventListener('click', () => this.insertMarkdown('*', '*', '斜体文本'));
        this.els.headingBtn.addEventListener('click', () => this.insertMarkdown('\n## ', '', '标题'));
        this.els.listBtn.addEventListener('click', () => this.insertMarkdown('\n- ', '', '列表项'));
        this.els.codeBtn.addEventListener('click', () => this.insertMarkdown('\n```\n', '\n```', '代码块'));
        this.els.imageBtn.addEventListener('click', () => this.insertMarkdown('![', '](image-url)', '图片描述'));

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N 新建笔记
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNote();
            }
            // Ctrl/Cmd + S 手动保存
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
                this.showToast('已保存', 'success');
            }
            // Ctrl/Cmd + Shift + P 切换预览
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
                e.preventDefault();
                this.togglePreviewMode();
            }
            // Ctrl/Cmd + F 聚焦搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.els.searchInput.focus();
            }
            // Escape 关闭模态框
            if (e.key === 'Escape') {
                this.hideTagModal();
                this.hideSettings();
                this.hideConfirm();
            }
        });

        // 点击模态框外部关闭
        this.els.tagModal.addEventListener('click', (e) => {
            if (e.target === this.els.tagModal) this.hideTagModal();
        });
        this.els.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.els.settingsModal) this.hideSettings();
        });
        this.els.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.els.confirmModal) this.hideConfirm();
        });

        // 窗口关闭前保存
        window.addEventListener('beforeunload', () => this.saveCurrentNote());
    }

    // --- 侧边栏 ---
    toggleSidebar(forceOpen = false) {
        if (forceOpen) {
            this.els.sidebar.classList.remove('collapsed');
        } else {
            this.els.sidebar.classList.toggle('collapsed');
        }
    }

    // --- 笔记操作 ---
    createNote() {
        const now = Date.now();
        const note = {
            id: 'note_' + now + '_' + Math.random().toString(36).substr(2, 6),
            title: '',
            content: '',
            createdAt: now,
            updatedAt: now,
            pinned: false,
            favorite: false,
            deleted: false,
            tags: []
        };
        this.storage.addNote(note);
        this.currentNoteId = note.id;
        this.renderNotesList();
        this.openNote(note.id);
        // 如果在回收站，切换到全部
        if (this.currentTag === 'trash') this.setCurrentTag('all');
        this.showToast('已创建新笔记', 'success');
        // 聚焦标题
        setTimeout(() => this.els.noteTitle.focus(), 100);
    }

    openNote(id) {
        const note = this.storage.getNote(id);
        if (!note) return;

        this.currentNoteId = id;
        this.els.emptyState.style.display = 'none';
        this.els.editorArea.style.display = 'flex';

        // 填充内容
        this.els.noteTitle.value = note.title || '';
        this.els.noteEditor.value = note.content || '';
        this.updateNoteMeta(note);
        this.updatePreview();

        // 更新按钮状态
        this.updateActionButtons(note);

        // 更新笔记列表高亮
        this.renderNotesList();
    }

    saveCurrentNote() {
        if (!this.currentNoteId) return;
        const title = this.els.noteTitle.value.trim();
        const content = this.els.noteEditor.value;
        const note = this.storage.updateNote(this.currentNoteId, { title, content });
        if (note) {
            this.updateNoteMeta(note);
            this.renderNotesList();
        }
    }

    scheduleSave() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        const autoSave = this.settings.autoSave;
        if (autoSave === 0) return; // 关闭自动保存
        this.saveTimer = setTimeout(() => this.saveCurrentNote(), autoSave);
        // 显示保存指示
        this.els.footerStats.textContent = '未保存...';
        this.els.footerStats.style.color = 'var(--warning)';
        setTimeout(() => {
            this.els.footerStats.textContent = '已就绪';
            this.els.footerStats.style.color = '';
        }, autoSave - 200);
    }

    deleteCurrentNote() {
        if (!this.currentNoteId) return;
        const note = this.storage.getNote(this.currentNoteId);
        if (!note) return;

        if (note.deleted) {
            // 永久删除
            this.showConfirm('永久删除', '确定要永久删除此笔记吗？此操作不可恢复。', () => {
                this.storage.deleteNote(this.currentNoteId);
                this.currentNoteId = null;
                this.showEmptyState();
                this.renderNotesList();
                this.showToast('笔记已永久删除', 'error');
            });
        } else {
            // 移到回收站
            this.storage.updateNote(this.currentNoteId, { deleted: true });
            this.showToast('笔记已移至回收站', 'warning');
            // 尝试打开下一笔记
            const notes = this.getFilteredNotes().filter(n => n.id !== this.currentNoteId && !n.deleted);
            if (notes.length > 0) {
                this.openNote(notes[0].id);
            } else {
                this.currentNoteId = null;
                this.showEmptyState();
            }
            this.renderNotesList();
        }
    }

    togglePin() {
        if (!this.currentNoteId) return;
        const note = this.storage.getNote(this.currentNoteId);
        if (!note) return;
        this.storage.updateNote(this.currentNoteId, { pinned: !note.pinned });
        this.updateActionButtons({ ...note, pinned: !note.pinned });
        this.renderNotesList();
        this.showToast(note.pinned ? '已取消置顶' : '已置顶', 'info');
    }

    toggleFav() {
        if (!this.currentNoteId) return;
        const note = this.storage.getNote(this.currentNoteId);
        if (!note) return;
        this.storage.updateNote(this.currentNoteId, { favorite: !note.favorite });
        this.updateActionButtons({ ...note, favorite: !note.favorite });
        this.renderNotesList();
        this.showToast(note.favorite ? '已取消收藏' : '已收藏', 'info');
    }

    // --- 标签管理 ---
    loadTags() {
        const tags = this.storage.getTags();
        this.els.customTags.innerHTML = '';
        tags.forEach(tag => {
            const div = document.createElement('div');
            div.className = 'custom-tag';
            div.dataset.tag = 'tag_' + tag.id;
            div.innerHTML = `
                <span class="tag-dot" style="background:${tag.color}"></span>
                <span class="tag-name">${this.escapeHtml(tag.name)}</span>
                <span class="tag-count" id="tagCount_${tag.id}">0</span>
                <span class="tag-remove" data-tag-id="${tag.id}"><i class="fas fa-times"></i></span>
            `;
            div.addEventListener('click', (e) => {
                if (e.target.closest('.tag-remove')) return;
                this.setCurrentTag('tag_' + tag.id);
            });
            div.querySelector('.tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showConfirm('删除标签', `确定要删除标签"${tag.name}"吗？`, () => {
                    this.storage.removeTag(tag.id);
                    this.loadTags();
                    this.renderNotesList();
                    if (this.currentTag === 'tag_' + tag.id) this.setCurrentTag('all');
                    this.showToast('标签已删除', 'info');
                });
            });
            this.els.customTags.appendChild(div);
        });
        this.updateTagCounts();
    }

    showTagModal() {
        this.els.tagModal.classList.add('show');
        this.els.tagNameInput.value = '';
        this.els.tagNameInput.focus();
        // 重置颜色选择
        this.els.tagColors.querySelectorAll('.color-option').forEach((o, i) => {
            o.classList.toggle('active', i === 0);
        });
    }

    hideTagModal() {
        this.els.tagModal.classList.remove('show');
    }

    createTag() {
        const name = this.els.tagNameInput.value.trim();
        if (!name) {
            this.showToast('请输入标签名称', 'warning');
            return;
        }
        const activeColor = this.els.tagColors.querySelector('.color-option.active');
        const color = activeColor ? activeColor.dataset.color : '#6366f1';
        const tag = {
            id: 't_' + Date.now(),
            name,
            color
        };
        this.storage.addTag(tag);
        this.hideTagModal();
        this.loadTags();
        this.renderNotesList();
        this.showToast(`标签"${name}"已创建`, 'success');
    }

    // --- 标签与笔记过滤 ---
    setCurrentTag(tag) {
        this.currentTag = tag;
        // 更新标签高亮
        this.els.tagsList.querySelectorAll('.tag-item').forEach(el => {
            el.classList.toggle('active', el.dataset.tag === tag);
        });
        this.els.customTags.querySelectorAll('.custom-tag').forEach(el => {
            el.classList.toggle('active', el.dataset.tag === tag);
        });
        this.renderNotesList();
        // 检查当前笔记是否在当前过滤中
        if (this.currentNoteId) {
            const notes = this.getFilteredNotes();
            if (!notes.find(n => n.id === this.currentNoteId)) {
                if (notes.length > 0) {
                    this.openNote(notes[0].id);
                } else {
                    this.currentNoteId = null;
                    this.showEmptyState();
                }
            }
        }
    }

    getFilteredNotes() {
        let notes = this.storage.getNotes();

        // 根据当前标签过滤
        if (this.currentTag === 'trash') {
            notes = notes.filter(n => n.deleted);
        } else {
            notes = notes.filter(n => !n.deleted);
            if (this.currentTag === 'favorites') {
                notes = notes.filter(n => n.favorite);
            } else if (this.currentTag && this.currentTag.startsWith('tag_')) {
                const tagId = this.currentTag.replace('tag_', '');
                notes = notes.filter(n => n.tags && n.tags.some(t => t.id === tagId));
            }
            // 'all' 不过滤
        }

        // 搜索过滤
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            notes = notes.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.content.toLowerCase().includes(q)
            );
        }

        // 排序
        const sort = this.settings.sort || 'updated';
        notes.sort((a, b) => {
            // 置顶优先
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            if (sort === 'title') {
                return (a.title || '').localeCompare(b.title || '');
            }
            if (sort === 'created') {
                return b.createdAt - a.createdAt;
            }
            return b.updatedAt - a.updatedAt;
        });

        return notes;
    }

    updateTagCounts() {
        const notes = this.storage.getNotes();
        const active = notes.filter(n => !n.deleted);
        const fav = active.filter(n => n.favorite);
        const trash = notes.filter(n => n.deleted);

        this.els.allCount.textContent = active.length;
        this.els.favCount.textContent = fav.length;
        this.els.trashCount.textContent = trash.length;

        // 自定义标签计数
        const tags = this.storage.getTags();
        tags.forEach(tag => {
            const count = active.filter(n => n.tags && n.tags.some(t => t.id === tag.id)).length;
            const el = document.getElementById('tagCount_' + tag.id);
            if (el) el.textContent = count;
        });
    }

    // --- 渲染笔记列表 ---
    renderNotesList() {
        const notes = this.getFilteredNotes();
        this.els.notesList.innerHTML = '';
        this.els.notesCount.textContent = notes.length;

        if (notes.length === 0) {
            const emptyMsg = this.searchQuery
                ? '没有找到匹配的笔记'
                : this.currentTag === 'trash'
                    ? '回收站为空'
                    : '暂无笔记，点击"新建笔记"开始';
            this.els.notesList.innerHTML = `
                <div class="empty-list" style="text-align:center;padding:40px 20px;color:var(--text-tertiary);font-size:0.9rem;">
                    <i class="fas fa-file-alt" style="font-size:2rem;opacity:0.3;margin-bottom:12px;display:block;"></i>
                    ${emptyMsg}
                </div>
            `;
        } else {
            notes.forEach(note => {
                const item = document.createElement('div');
                item.className = 'note-item' + (note.id === this.currentNoteId ? ' active' : '');
                item.dataset.id = note.id;

                const preview = note.content.replace(/[#*`>\-\[\]!()]/g, '').substring(0, 60) || '空笔记';

                let metaHtml = '';
                if (note.tags && note.tags.length > 0) {
                    note.tags.forEach(t => {
                        metaHtml += `<span class="note-tag" style="background:${t.color}">${this.escapeHtml(t.name)}</span>`;
                    });
                }
                if (note.favorite) metaHtml += '<span class="fav-icon"><i class="fas fa-star"></i></span>';

                item.innerHTML = `
                    <div class="note-item-title">
                        ${note.pinned ? '<span class="pinned-icon"><i class="fas fa-thumbtack"></i></span>' : ''}
                        ${this.escapeHtml(note.title || '无标题')}
                    </div>
                    <div class="note-item-preview">${this.escapeHtml(preview)}</div>
                    <div class="note-item-meta">
                        <span>${this.formatDate(note.updatedAt)}</span>
                        ${metaHtml}
                    </div>
                `;

                item.addEventListener('click', () => {
                    if (note.deleted) {
                        // 在回收站中点击，提供恢复选项
                        this.showConfirm('恢复笔记', '是否恢复此笔记？', () => {
                            this.storage.updateNote(note.id, { deleted: false });
                            this.renderNotesList();
                            this.setCurrentTag('all');
                            this.openNote(note.id);
                            this.showToast('笔记已恢复', 'success');
                        });
                    } else {
                        this.openNote(note.id);
                    }
                });

                // 右键菜单 - 快速操作
                item.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    // 简单右键操作 - 切换收藏
                    if (!note.deleted) {
                        this.storage.updateNote(note.id, { favorite: !note.favorite });
                        this.renderNotesList();
                        if (note.id === this.currentNoteId) {
                            this.updateActionButtons({ ...note, favorite: !note.favorite });
                        }
                        this.showToast(note.favorite ? '已取消收藏' : '已收藏', 'info');
                    }
                });

                this.els.notesList.appendChild(item);
            });
        }

        // 应用视图模式
        if (this.settings.viewMode === 'compact') {
            this.els.notesList.classList.add('compact');
        } else {
            this.els.notesList.classList.remove('compact');
        }

        this.updateTagCounts();
    }

    // --- 预览 ---
    updatePreview() {
        const content = this.els.noteEditor.value || '';
        this.els.previewContent.innerHTML = this.mdParser.parse(content);
        // 更新字数
        const wordCount = content.replace(/\s/g, '').length;
        this.els.noteWordCount.textContent = wordCount + ' 字';
    }

    togglePreviewMode() {
        const area = this.els.editorArea;
        if (this.editorMode === 'split') {
            this.editorMode = 'preview';
            area.classList.add('preview-only');
            area.classList.remove('edit-only');
            this.els.previewToggle.innerHTML = '<i class="fas fa-pen"></i>';
            this.showToast('预览模式', 'info');
        } else if (this.editorMode === 'preview') {
            this.editorMode = 'edit';
            area.classList.remove('preview-only');
            area.classList.add('edit-only');
            this.els.previewToggle.innerHTML = '<i class="fas fa-eye"></i>';
            this.showToast('编辑模式', 'info');
        } else {
            this.editorMode = 'split';
            area.classList.remove('preview-only', 'edit-only');
            this.els.previewToggle.innerHTML = '<i class="fas fa-eye"></i>';
            this.showToast('分屏模式', 'info');
        }
    }

    // --- 编辑器工具栏 ---
    insertMarkdown(before, after, placeholder) {
        const editor = this.els.noteEditor;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.substring(start, end) || placeholder;
        const text = before + selected + after;
        editor.focus();
        document.execCommand('insertText', false, text);
        editor.dispatchEvent(new Event('input'));
    }

    // --- 笔记元数据更新 ---
    updateNoteMeta(note) {
        this.els.noteDate.textContent = '创建: ' + this.formatDate(note.createdAt) + ' | 更新: ' + this.formatDate(note.updatedAt);
    }

    updateActionButtons(note) {
        this.els.pinNoteBtn.innerHTML = note.pinned
            ? '<i class="fas fa-thumbtack" style="color:var(--warning)"></i>'
            : '<i class="fas fa-thumbtack"></i>';
        this.els.favNoteBtn.innerHTML = note.favorite
            ? '<i class="fas fa-star" style="color:var(--warning)"></i>'
            : '<i class="far fa-star"></i>';
    }

    // --- 空状态 ---
    showEmptyState() {
        this.els.emptyState.style.display = 'flex';
        this.els.editorArea.style.display = 'none';
        this.els.noteTitle.value = '';
        this.els.noteEditor.value = '';
    }

    // --- 导出 ---
    exportNote() {
        if (!this.currentNoteId) {
            this.showToast('请先选择要导出的笔记', 'warning');
            return;
        }
        const note = this.storage.getNote(this.currentNoteId);
        if (!note) return;

        const title = note.title || '无标题笔记';
        const content = note.content || '';
        const md = `# ${title}\n\n${content}`;
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('笔记已导出', 'success');
    }

    // --- 主题 ---
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.els.themeToggle.innerHTML = next === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        this.storage.saveSettings({ theme: next });
        this.settings.theme = next;
    }

    // --- 设置 ---
    showSettings() {
        this.els.settingEditorMode.value = this.settings.editorMode || 'split';
        this.els.settingAutoSave.value = String(this.settings.autoSave || 3000);
        this.els.settingFontSize.value = this.settings.fontSize || '16px';
        this.els.settingSort.value = this.settings.sort || 'updated';
        this.els.settingViewMode.value = this.settings.viewMode || 'list';
        this.els.settingsModal.classList.add('show');
    }

    hideSettings() {
        this.els.settingsModal.classList.remove('show');
    }

    saveSettings() {
        const newSettings = {
            editorMode: this.els.settingEditorMode.value,
            autoSave: parseInt(this.els.settingAutoSave.value),
            fontSize: this.els.settingFontSize.value,
            sort: this.els.settingSort.value,
            viewMode: this.els.settingViewMode.value
        };
        this.settings = this.storage.saveSettings(newSettings);

        // 应用编辑器模式
        this.editorMode = this.settings.editorMode;
        const area = this.els.editorArea;
        area.classList.remove('preview-only', 'edit-only');
        if (this.editorMode === 'preview') area.classList.add('preview-only');
        else if (this.editorMode === 'edit') area.classList.add('edit-only');

        // 应用字体大小
        this.els.noteEditor.style.fontSize = this.settings.fontSize;

        // 应用视图模式
        this.renderNotesList();

        this.hideSettings();
        this.showToast('设置已保存', 'success');
    }

    applySettings() {
        // 主题
        if (this.settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.els.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // 字体大小
        this.els.noteEditor.style.fontSize = this.settings.fontSize;

        // 编辑器模式
        this.editorMode = this.settings.editorMode;
        if (this.editorMode === 'preview') {
            this.els.editorArea.classList.add('preview-only');
        } else if (this.editorMode === 'edit') {
            this.els.editorArea.classList.add('edit-only');
        }
    }

    // --- 确认对话框 ---
    showConfirm(title, message, callback) {
        this.els.confirmTitle.textContent = title;
        this.els.confirmMessage.textContent = message;
        this.els.confirmModal.classList.add('show');
        this.els.confirmOk.onclick = () => {
            this.hideConfirm();
            if (callback) callback();
        };
    }

    hideConfirm() {
        this.els.confirmModal.classList.remove('show');
        this.els.confirmOk.onclick = null;
    }

    executeConfirm() {
        // 由 showConfirm 的 onclick 处理
    }

    // --- Toast 通知 ---
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${this.escapeHtml(message)}`;
        this.els.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-remove');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 工具方法 ---
    formatDate(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const now = new Date();
        const diff = now - d;

        // 1分钟内: 刚刚
        if (diff < 60000) return '刚刚';
        // 1小时内: 几分钟前
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
        // 今天: 显示时间
        if (d.toDateString() === now.toDateString()) {
            return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        }
        // 昨天: 昨天
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return '昨天';
        // 今年: 月-日
        if (d.getFullYear() === now.getFullYear()) {
            return (d.getMonth() + 1) + '月' + d.getDate() + '日';
        }
        // 更早: 年-月-日
        return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- 加载数据 ---
    loadNotes() {
        const notes = this.storage.getNotes();
        if (notes.length > 0) {
            // 尝试打开第一个非删除的笔记
            const active = notes.find(n => !n.deleted);
            if (active) {
                this.openNote(active.id);
            } else {
                // 全部在回收站
                this.showEmptyState();
            }
        } else {
            this.showEmptyState();
        }
        this.renderNotesList();
    }
}

// ============================================
// 4. 启动应用
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NotesApp();
});
