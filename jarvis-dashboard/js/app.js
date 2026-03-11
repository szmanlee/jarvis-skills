// 贾维斯控制面板 v2.0 - 主应用逻辑
const VERSION = '2.0.0';
const API_BASE = '';

// ==================== 通用函数 ====================
async function fetchAPI(endpoint, params = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return { success: false, error: e.message };
    }
}

async function postAPI(endpoint, data = {}) {
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function addActivity(icon, text, time = '刚刚') {
    const list = document.getElementById('activityList');
    if (!list) return;
    
    const item = document.createElement('li');
    item.className = 'activity-item';
    item.innerHTML = `
        <span class="activity-icon">${icon}</span>
        <span class="activity-text">${text}</span>
        <span class="activity-time">${time}</span>
    `;
    list.insertBefore(item, list.firstChild);
    while (list.children.length > 10) list.removeChild(list.lastChild);
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 贾维斯控制面板 v${VERSION} 已启动`);
    initNavigation();
    initTerminal();
    loadAllData();
    addActivity('🚀', `控制面板 v${VERSION} 已启动`);
});

function loadAllData() {
    loadDashboard();
    loadSystemMonitor();
    loadContainers();
    loadFiles();
    loadSkills();
}

// ==================== 导航 ====================
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            
            // 切换到 Skills 页面时刷新数据
            if (page === 'skills') {
                loadSkills();
            }
        });
    });
}

// ==================== 仪表盘 ====================
async function loadDashboard() {
    const data = await fetchAPI('/api/all');
    if (!data.success) return;
    
    const d = data.data;
    
    // 更新系统状态
    if (d.cpu !== undefined) {
        document.getElementById('cpuUsage').style.width = Math.min(d.cpu, 100) + '%';
        document.getElementById('cpuValue').textContent = d.cpu.toFixed(1) + '%';
    }
    
    if (d.memory) {
        const memPct = d.memory.percent || 0;
        document.getElementById('memUsage').style.width = memPct + '%';
        document.getElementById('memValue').textContent = `${memPct}% (${d.memory.used?.toFixed(1) || '?'}GB / ${d.memory.total?.toFixed(1) || '?'}GB)`;
    }
    
    if (d.disk) {
        document.getElementById('diskUsage').style.width = d.disk.percent + '%';
        document.getElementById('diskValue').textContent = `${d.disk.used} / ${d.disk.total} (${100 - d.disk.percent}%)`;
    }
    
    // 更新系统信息
    if (d.uptime) document.getElementById('uptime').textContent = d.uptime;
    if (d.hostname) document.getElementById('hostname').textContent = d.hostname;
    
    // 更新容器状态
    loadContainersUI(d.docker);
}

async function loadSystemMonitor() {
    const data = await fetchAPI('/api/all');
    if (!data.success || !data.data) return;
    
    const m = data.data.memory;
    const c = data.data.cpu;
    const d = data.data.disk;
    const p = data.data.processes;
    
    const el = (id) => document.getElementById(id);
    
    if (m && el('memPercent')) el('memPercent').textContent = m.percent + '%';
    if (m && el('memUsed')) el('memUsed').textContent = (m.used || 0).toFixed(1) + 'GB';
    if (m && el('memTotal')) el('memTotal').textContent = (m.total || 0).toFixed(1) + 'GB';
    
    if (c !== undefined && el('cpuPercent')) el('cpuPercent').textContent = c.toFixed(1) + '%';
    
    if (d && el('diskPercent')) el('diskPercent').textContent = d.percent + '%';
    if (d && el('diskUsed')) el('diskUsed').textContent = `${d.used || '--'} / ${d.total || '--'}`;
    
    // 渲染进程列表
    loadProcessesUI(p);
}

function loadProcessesUI(processes) {
    const list = document.getElementById('processList');
    if (!list || !processes || !Array.isArray(processes)) {
        if (list) list.innerHTML = '<tr><td colspan="5">无法加载进程</td></tr>';
        return;
    }
    
    if (processes.length === 0) {
        list.innerHTML = '<tr><td colspan="5">无进程数据</td></tr>';
        return;
    }
    
    list.innerHTML = processes.map(p => `
        <tr><td>${p.pid}</td><td>${p.name}</td><td>${p.cpu}%</td><td>${p.mem}%</td><td>${p.stat}</td></tr>
    `).join('');
}

function loadContainersUI(containers) {
    const grid = document.getElementById('containersGrid');
    if (!grid || !containers) return;
    
    grid.innerHTML = containers.map(c => `
        <div class="container-card ${c.running ? 'running' : 'stopped'}">
            <div class="container-header">
                <span class="container-status">${c.running ? '●' : '○'}</span>
                <span class="container-name">${c.name}</span>
            </div>
            <div class="container-status-text">${c.status}</div>
            ${c.ports ? `<div class="container-ports">${c.ports}</div>` : ''}
        </div>
    `).join('');
}

async function loadContainers() {
    const data = await fetchAPI('/api/docker');
    loadContainersUI(data.success ? data.data : []);
}

// ==================== 文件管理 ====================
let currentDir = '/root/.openclaw/workspace';

async function loadFiles(dir = currentDir) {
    currentDir = dir;
    const data = await fetchAPI('/api/files', { dir });
    
    const list = document.getElementById('fileList');
    const breadcrumb = document.getElementById('fileBreadcrumb');
    if (!list) return;
    
    breadcrumb.textContent = dir;
    
    if (!data.success || !data.data) {
        list.innerHTML = '<div class="empty-state">无法加载文件列表</div>';
        return;
    }
    
    list.innerHTML = data.data.map(f => `
        <div class="file-item">
            <div class="file-main" onclick="${f.perm[0] === 'd' ? `loadFiles('${dir}/${f.name}')` : ''}">
                <span class="file-icon">${f.perm[0] === 'd' ? '📁' : '📄'}</span>
                <span class="file-name">${f.name}</span>
                <span class="file-size">${f.size}</span>
                <span class="file-date">${f.date}</span>
            </div>
            ${f.perm[0] !== 'd' ? `<div class="file-actions"><button onclick="downloadFile('${dir}/${f.name}')">📥</button><button onclick="openFile('${dir}/${f.name}')">📖</button></div>` : ''}
        </div>
    `).join('');
}

function downloadFile(path) {
    window.open('/api/download?path=' + encodeURIComponent(path), '_blank');
}

function openFile(path) {
    window.open('/api/open?path=' + encodeURIComponent(path), '_blank');
}

async function goBack() {
    if (currentDir === '/root/.openclaw/workspace') return;
    const parent = currentDir.substring(0, currentDir.lastIndexOf('/'));
    await loadFiles(parent || '/root/.openclaw/workspace');
}

function refreshFiles() {
    loadFiles(currentDir);
}

// ==================== 终端 ====================
let terminalCwd = '/root/.openclaw/workspace';

function initTerminal() {
    const input = document.getElementById('terminalInput');
    if (!input) return;
    
    input.addEventListener('keydown', async function(e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim();
            if (!cmd) return;
            
            addActivity('💻', `$ ${cmd}`);
            this.value = '';
            
            const data = await fetchAPI('/api/command', { cmd });
            
            if (data.success) {
                addActivity('✅', data.output || '命令执行成功');
            } else {
                addActivity('❌', data.error || '命令执行失败');
            }
        }
    });
}

// ==================== 日志 ====================
async function loadLog() {
    const file = document.getElementById('logFile').value;
    const output = document.getElementById('logContent');
    if (!output) return;
    
    output.textContent = '加载中...';
    const cmd = file === 'syslog' 
        ? 'tail -50 /var/log/syslog 2>/dev/null || journalctl -n 50'
        : 'tail -50 /tmp/openclaw/openclaw.log 2>/dev/null';
    
    const data = await fetchAPI('/api/command', { cmd });
    output.textContent = data.success ? data.output : '无法加载日志: ' + (data.error || '未知错误');
    addActivity('📝', `加载日志: ${file}`);
}

// ==================== 网络工具 ====================
async function runPing() {
    const host = document.getElementById('pingHost').value;
    const output = document.getElementById('pingOutput');
    if (!output || !host) return;
    
    output.textContent = '测试中...';
    const data = await fetchAPI('/api/ping', { host });
    
    output.textContent = data.success ? '连接正常\n' + data.output : 'Ping 失败: ' + data.error;
    addActivity('🔗', `Ping: ${host}`);
}

async function checkPort() {
    const host = document.getElementById('portHost').value;
    const port = document.getElementById('portNum').value;
    const output = document.getElementById('portOutput');
    if (!output) return;
    
    output.textContent = '检查中...';
    const data = await fetchAPI('/api/port', { host, port });
    
    output.textContent = data.success ? `端口 ${port} 开放` : '端口关闭或无法访问';
    addActivity('🔌', `检查端口: ${host}:${port}`);
}

async function runDNS() {
    const host = document.getElementById('dnsHost').value;
    const output = document.getElementById('dnsOutput');
    if (!output || !host) return;
    
    output.textContent = '查询中...';
    const data = await fetchAPI('/api/dns', { host });
    
    output.textContent = data.success ? data.output : 'DNS 查询失败: ' + data.error;
    addActivity('📡', `DNS 查询: ${host}`);
}

// ==================== AI 配置 ====================
async function loadAIConfig() {
    const data = await fetchAPI('/api/command', { cmd: 'cat ~/.openclaw/openclaw.json 2>/dev/null | head -20' });
    const configEl = document.querySelector('.model-info .model-name');
    if (configEl && data.success) {
        try {
            const config = JSON.parse(data.output);
            configEl.textContent = config.model || 'Unknown';
        } catch(e) {}
    }
}

// ==================== Skills 管理 ====================
async function loadSkills() {
    const skillsGrid = document.getElementById('skillsGrid');
    const agentsGrid = document.getElementById('agentsGrid');
    
    if (!skillsGrid) return;
    
    // 加载 Skills
    const skillsData = await fetchAPI('/api/skills');
    
    if (skillsData.success) {
        const skillsList = skillsData.data;
        const skills = skillsList.map(s => ({
            name: s,
            category: 'skill',
            icon: getSkillIcon(s),
            desc: getSkillDesc(s),
            enabled: true
        }));
        
        skillsGrid.innerHTML = skills.map(s => `
            <div class="skill-card" data-category="${s.category}">
                <div class="skill-header">
                    <span class="skill-icon">${s.icon}</span>
                    <span class="skill-name">${s.name}</span>
                    <span class="skill-status enabled">✅ 启用</span>
                </div>
                <p class="skill-desc">${s.desc}</p>
                <p class="skill-feature">${getSkillFeature(s)}</p>
                <span class="skill-category">Skill</span>
            </div>
        `).join('');
    } else {
        skillsGrid.innerHTML = '<div class="empty-state">加载失败</div>';
    }
    
    // 加载 Agents 并更新统计
    try {
        const agents = await loadAgents();
        
        // 更新 Agents 统计
        const runningCount = agents.filter(a => a.running).length;
        const stoppedCount = agents.length - runningCount;
        const elAgentTotal = document.getElementById('agentTotal');
        const elAgentRunning = document.getElementById('agentRunning');
        const elAgentStopped = document.getElementById('agentStopped');
        if (elAgentTotal) elAgentTotal.textContent = agents.length;
        if (elAgentRunning) elAgentRunning.textContent = runningCount;
        if (elAgentStopped) elAgentStopped.textContent = stoppedCount;
        
        // 更新 Skills 统计 (仅当 skillsData 存在时)
        if (skillsData && skillsData.success) {
            const elSkillTotal = document.getElementById('skillTotal');
            const elSkillCoding = document.getElementById('skillCoding');
            const elSkillAuto = document.getElementById('skillAuto');
            if (elSkillTotal) elSkillTotal.textContent = skillsData.data.length;
            if (elSkillCoding) elSkillCoding.textContent = '5';
            if (elSkillAuto) elSkillAuto.textContent = '5';
        }
        
        // 渲染 Agents 卡片
        if (agentsGrid) {
            agentsGrid.innerHTML = agents.map(a => `
                <div class="skill-card agent-card">
                    <div class="skill-header">
                        <span class="skill-icon">${a.emoji}</span>
                        <span class="skill-name">${a.name}</span>
                        <span class="skill-status ${a.running ? 'enabled' : 'disabled'}">
                            ${a.running ? '✅ 运行中' : '⏸️ 未运行'}
                        </span>
                    </div>
                    <p class="skill-feature">${a.intro || ''}</p>
                    <span class="skill-category">Agent</span>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Agents 加载失败:', e);
        if (agentsGrid) agentsGrid.innerHTML = '<div class="empty-state">加载失败</div>';
    }
}

async function loadAgents() {
    const agents = [];
    const agentDirs = ['sherlock', 'reviewer', 'devops', 'trading', 'writer', 'designer', 'data', 'webdev'];
    
    // 检查运行中的 Agents
    const runningAgents = new Set();
    try {
        const psData = await fetchAPI('/api/command', { 
            cmd: 'ps axo comm= | grep agent' 
        });
        if (psData.success && psData.output) {
            ['sherlock', 'reviewer', 'devops', 'trading', 'writer', 'designer', 'data', 'webdev'].forEach(a => {
                if (psData.output.includes(a)) runningAgents.add(a);
            });
        }
    } catch (e) {
        // 静默处理
    }
    
    for (const dir of agentDirs) {
        const soulPath = `/root/.openclaw/workspace/agents/${dir}/SOUL.md`;
        
        try {
            const data = await fetchAPI('/api/command', { cmd: `head -20 ${soulPath}` });
            
            if (data.success && data.output) {
                const soul = data.output;
                // 提取名称并清理（如 "SOUL.md - Sherlock 🕵️" -> "Sherlock"）
                let name = soul.match(/# (.+)/)?.[1] || dir.charAt(0).toUpperCase() + dir.slice(1);
                name = name.replace(/^SOUL\.md\s*-\s*/, '').replace(/\s+[^\s]+$/, '');
                // 提取完整的 emoji - 去除 ** 前缀后取第一个词
                let emojiLine = soul.match(/- \*\*Emoji:\s*(.+)/i)?.[1] || '';
                let emoji = emojiLine.replace(/\*\*/g, '').trim().split(' ')[0] || '🤖';
                const role = soul.match(/- \*\*Role:\s*(.+)/i)?.[1] || soul.match(/- \*\*角色\*\*:\s*(.+)/)?.[1] || 'AI Assistant';
                const specialty = soul.match(/- \*\*Specialty:\s*(.+)/i)?.[1] || soul.match(/- \*\*专长\*\*:\s*(.+)/)?.[1] || '';
                const desc = soul.match(/- \*\*Role:\s*(.+)/i)?.[1] || soul.match(/- \*\*介绍\*\*:\s*(.+)/)?.[1] || '';
                
                // 使用默认的中文简介（不从英文 SOUL 解析）
                const defaults = {
                    'sherlock': { intro: '研究 OpenClaw Skills 和新兴 AI 技术，发现并安装新技能' },
                    'reviewer': { intro: '检查代码质量、安全漏洞和最佳实践，提供优化建议' },
                    'devops': { intro: '管理 Docker 容器、自动化部署流程、维护 CI/CD 流水线' },
                    'trading': { intro: '分析股票和加密货币市场，开发交易策略，辅助投资决策' },
                    'writer': { intro: '撰写技术文档、博客文章、创意内容，提供写作建议和润色' },
                    'designer': { intro: '提供 UI/UX 设计建议、配色方案、布局指导，创建可视化原型' },
                    'data': { intro: '处理和分析数据，生成统计报告，创建数据可视化图表' },
                    'webdev': { intro: '从前端到后端协助开发网站和 Web 应用，编写代码和调试问题' }
                };
                
                agents.push({ name, role, specialty, emoji, desc, intro: defaults[dir]?.intro || desc, dir, running: runningAgents.has(dir) });
            }
        } catch (e) {
            // 使用默认值
            const defaults = {
                'sherlock': { name: 'Sherlock', role: 'AI 学习助手', emoji: '🕵️', intro: '研究 OpenClaw Skills 和新兴 AI 技术，发现并安装新技能' },
                'reviewer': { name: 'Reviewer', role: '代码审查专家', emoji: '👨‍💻', intro: '检查代码质量、安全漏洞和最佳实践，提供优化建议' },
                'devops': { name: 'DevOps', role: '运维工程师', emoji: '🐳', intro: '管理 Docker 容器、自动化部署流程、维护 CI/CD 流水线' },
                'trading': { name: 'Trading', role: '交易分析师', emoji: '📈', intro: '分析股票和加密货币市场，开发交易策略，辅助投资决策' },
                'writer': { name: 'Writer', role: '写作助手', emoji: '📝', intro: '撰写技术文档、博客文章、创意内容，提供写作建议和润色' },
                'designer': { name: 'Designer', role: '设计助手', emoji: '🎨', intro: '提供 UI/UX 设计建议、配色方案、布局指导，创建可视化原型' },
                'data': { name: 'Data', role: '数据分析师', emoji: '📊', intro: '处理和分析数据，生成统计报告，创建数据可视化图表' },
                'webdev': { name: 'WebDev', role: 'Web 开发', emoji: '🌐', intro: '从前端到后端协助开发网站和 Web 应用，编写代码和调试问题' }
            };
            
            if (defaults[dir]) {
                agents.push({ ...defaults[dir], dir, running: runningAgents.has(dir) });
            }
        }
    }
    
    return agents;
}

function getSkillIcon(name) {
    const icons = {
        'agent-council': '🧠', 'agent-identity-kit': '🪪', 'coding-agent': '💻',
        'docker': '🐳', 'browse': '🌐', 'git-workflows': '📝',
        'docker-sandbox': '📦', 'ssh-tunnel': '🔐',
        'tdd-guide': '🧪', 'debug-pro': '🐛', 'regex-patterns': '🔍',
        'emergency-rescue': '🚨', 'ontology': '🗂️', 'self-improving': '📈',
        'weather': '🌤️', 'healthcheck': '🛡️', 'github': '🐙'
    };
    return icons[name?.toLowerCase?.() || ''] || '🧩';
}

function getSkillDesc(name) {
    const descs = {
        'agent-council': 'AI 智能体管理',
        'agent-identity-kit': '智能体身份识别',
        'backend-patterns': '后端架构模式',
        'bat-cat': '文件查看替代工具',
        'browse': '浏览器自动化',
        'code-mentor': '编程学习导师',
        'coding-agent': '编程助手',
        'debug-pro': '专业调试工具',
        'deepwiki': '知识库管理',
        'deploy-agent': '自动化部署',
        'docker-essentials': 'Docker 基础命令',
        'docker-sandbox': '安全容器沙箱',
        'emergency-rescue': '紧急故障恢复',
        'git-summary': 'Git 仓库摘要',
        'git-workflows': 'Git 工作流指南',
        'idea-coach': '创意激发助手',
        'logseq': '知识管理工具',
        'memory-git-sync': '记忆同步',
        'multi-coding-agent': '多语言编程',
        'ontology': '知识图谱管理',
        'openclaw-backup': '备份工具',
        'pr-reviewer': 'PR 审查工具',
        'regex-patterns': '正则表达式库',
        'self-improving-agent': '自我提升智能体',
        'senior-architect': '架构设计顾问',
        'skill-creator': '技能创建工具',
        'skill-vetter': '技能评估工具',
        'smart-auto-updater': '自动更新工具',
        'ssh-tunnel': 'SSH 隧道管理',
        'system-monitor': '系统监控面板',
        'task-status': '任务状态追踪',
        'tdd-guide': 'TDD 开发指南',
        'voice-reply': '语音回复'
    };
    return descs[name?.toLowerCase?.()] || '功能模块';
}

function getSkillFeature(name) {
    const features = {
        'agent-council': '多智能体协作平台',
        'agent-identity-kit': '智能体身份识别系统',
        'backend-patterns': '提供后端架构最佳实践',
        'bat-cat': '带语法高亮的文件查看器',
        'browse': 'AI 驱动的浏览器自动化',
        'code-mentor': '一对一编程学习辅导',
        'coding-agent': 'AI 编程助手，支持多语言',
        'debug-pro': '专业级代码调试工具',
        'deepwiki': '维基式知识库管理',
        'deploy-agent': '一键部署到云端',
        'docker-essentials': '常用 Docker 命令速查',
        'docker-sandbox': '安全隔离的开发环境',
        'emergency-rescue': '紧急故障恢复指南',
        'git-summary': '快速了解仓库状态',
        'git-workflows': 'Git 协作最佳实践',
        'idea-coach': '头脑风暴和创意激发',
        'logseq': '双向链接笔记工具',
        'memory-git-sync': '自动同步记忆到 Git',
        'multi-coding-agent': '多语言 AI 编程助手',
        'ontology': '知识图谱构建工具',
        'openclaw-backup': '系统备份工具',
        'pr-reviewer': '自动审查 Pull Request',
        'regex-patterns': '常用正则表达式集合',
        'self-improving-agent': '自我学习和改进',
        'senior-architect': '高级架构设计咨询',
        'skill-creator': '创建自定义技能',
        'skill-vetter': '技能质量评估工具',
        'smart-auto-updater': '自动更新工具',
        'ssh-tunnel': '安全的 SSH 隧道管理',
        'system-monitor': '实时系统监控面板',
        'task-status': '任务进度追踪',
        'tdd-guide': '测试驱动开发指南',
        'voice-reply': '语音合成回复'
    };
    return features[name?.toLowerCase?.()] || '';
}

// ==================== 快捷命令 ====================
async function runQuickCmd(cmd) {
    const cmdMap = {
        '系统检查': 'systemctl status openclaw',
        '内存清理': 'sync && echo 3 > /proc/sys/vm/drop_caches',
        '磁盘清理': 'docker system prune -af',
        '容器列表': 'docker ps -a',
        '镜像清理': 'docker image prune -af',
        'Skills列表': 'ls /root/.openclaw/skills/',
        '更新Skills': 'npx openclaw skills update'
    };
    
    const actualCmd = cmdMap[cmd] || cmd;
    const data = await fetchAPI('/api/command', { cmd: actualCmd });
    
    addActivity('⚡', `${cmd}: ${data.success ? '成功' : '失败'}`);
    alert(`${cmd} 结果:\n\n${data.success ? data.output : data.error}`);
}

// ==================== 设置 ====================
function toggleTheme() {
    document.body.classList.toggle('light-theme');
}
