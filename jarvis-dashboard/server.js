/**
 * 贾维斯控制面板 v2.0 - HTTP 服务器
 */

// ==================== 模块导入 ====================
const http = require('http');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ==================== 版本与配置 ====================
const VERSION = '2.0.0';

// 环境变量配置（支持自定义）
const CONFIG = {
    PORT: parseInt(process.env.PORT || process.env.DASHBOARD_PORT || '2380', 10),
    BASE_PATH: process.env.BASE_PATH || '/root/.openclaw/workspace',
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1分钟
    COMMAND_TIMEOUT: parseInt(process.env.COMMAND_TIMEOUT || '10000', 10), // 10秒
    MAX_BUFFER: 1024 * 1024 // 1MB
};

// 速率限制存储（带自动清理）
const rateLimitMap = new Map();
const CLEANUP_INTERVAL = 60000; // 每分钟清理一次

// ==================== MIME 类型 ====================
const MIME_TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    '.txt': 'text/plain', '.md': 'text/markdown'
};

// 终端会话状态
let terminalCwd = CONFIG.BASE_PATH;

// ==================== 安全配置 ====================
const ALLOWED_COMMANDS = [
    'ls', 'cat', 'echo', 'pwd', 'date', 'whoami', 'hostname', 'uname', 'top',
    'free', 'df', 'du', 'ps', 'grep', 'find', 'sort', 'head', 'tail', 'wc', 'awk', 'sed',
    'mkdir', 'touch', 'cp', 'mv', 'rm', 'chmod', 'chown', 'cd', 'history', 'id',
    'docker', 'docker ps', 'docker stats', 'docker images', 'docker inspect'
];

// ==================== 安全工具函数 ====================
function sanitizePath(inputPath) {
    if (!inputPath || inputPath.trim() === '') return CONFIG.BASE_PATH;
    const resolved = path.resolve(CONFIG.BASE_PATH, inputPath);
    return resolved.startsWith(CONFIG.BASE_PATH) ? resolved : CONFIG.BASE_PATH;
}

function isCommandAllowed(cmd) {
    const sanitized = cmd.trim();
    const dangerChars = [';', '|', '&', '`', '$', '(', ')', '{', '}', '<', '>', '>>', '<<'];
    if (dangerChars.some(c => sanitized.includes(c))) return false;
    const baseCmd = sanitized.split(' ')[0];
    return ALLOWED_COMMANDS.some(allowed => allowed === baseCmd || sanitized.startsWith(allowed + ' '));
}

function sanitizeHost(host) {
    return (host || '').replace(/[^a-zA-Z0-9.\-]/g, '').substring(0, 253);
}

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip']?.trim() ||
           req.socket.remoteAddress?.replace('::ffff:', '');
}

// ==================== 速率限制 ====================
function checkRateLimit(ip) {
    const now = Date.now();
    let record = rateLimitMap.get(ip);
    
    if (!record || now > record.resetTime) {
        record = { count: 0, resetTime: now + CONFIG.RATE_LIMIT_WINDOW };
    }
    
    record.count++;
    rateLimitMap.set(ip, record);
    return record.count <= CONFIG.RATE_LIMIT_MAX;
}

// 定期清理过期的速率限制记录
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap) {
        if (now > record.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}, CLEANUP_INTERVAL);

// ==================== 系统监控 ====================
const sys = {
    cpu: () => {
        try {
            const output = execSync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | cut -d\'%\' -f1').toString().trim();
            return parseFloat(output) || 0;
        } catch { return 0; }
    },
    memory: () => {
        try {
            const m = execSync('free | grep Mem').toString().split(/\s+/);
            const used = parseFloat(m[2]) / 1024;
            const total = parseFloat(m[1]) / 1024;
            return { used, total, percent: Math.round((used / total) * 100) };
        } catch { return { used: 0, total: 0, percent: 0 }; }
    },
    disk: () => {
        try {
            const d = execSync('df -h / | tail -1').toString().split(/\s+/);
            return { used: d[2], total: d[1], percent: parseInt(d[4]) };
        } catch { return { used: '0', total: '0', percent: 0 }; }
    },
    uptime: () => {
        try {
            return execSync('uptime -p 2>/dev/null || uptime').toString().trim();
        } catch { return 'Unknown'; }
    },
    hostname: () => {
        try { return execSync('hostname').toString().trim(); } catch { return 'Unknown'; }
    },
    kernel: () => {
        try { return execSync('uname -r').toString().trim(); } catch { return 'Unknown'; }
    },
    docker: () => {
        try {
            return execSync('docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}"').toString()
                .trim().split('\n').filter(c => c).map(c => {
                    const p = c.split('|');
                    return { name: p[0], status: p[1], ports: p[2], running: p[1]?.includes('Up') };
                });
        } catch { return []; }
    },
    files: (dir) => {
        const safeDir = sanitizePath(dir);
        try {
            return execSync(`ls -lah --time-style=long-iso "${safeDir}" 2>/dev/null`).toString()
                .split('\n').slice(1).filter(l => l && !l.includes(' cannot access'))
                .map(l => {
                    const p = l.split(/\s+/);
                    return { perm: p[0], size: p[4], date: p[5] + ' ' + p[6], name: p[7] || l.split(' ').pop() };
                });
        } catch { return []; }
    },
    skills: () => {
        try { return execSync('ls /root/.openclaw/skills/').toString().trim().split('\n').filter(s => s); }
        catch { return []; }
    },
    processes: () => {
        try {
            return execSync('ps -eo pid,comm,%cpu,%mem,stat --sort=-%cpu | head -11').toString()
                .split('\n').slice(1).filter(l => l).map(l => {
                    const p = l.trim().split(/\s+/);
                    return { pid: p[0], name: p[1], cpu: p[2], mem: p[3], stat: p[4] };
                });
        } catch { return []; }
    }
};

// ==================== HTTP 服务器 ====================
const server = http.createServer((req, res) => {
    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 速率限制
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded' }));
        return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const url = new URL(req.url, `http://localhost:${CONFIG.PORT}`);
        const pathname = url.pathname;
        const q = url.searchParams;
        
        // API 路由
        if (pathname === '/api/all') {
            res.end(JSON.stringify({
                success: true,
                data: {
                    cpu: sys.cpu(), memory: sys.memory(), disk: sys.disk(),
                    uptime: sys.uptime(), hostname: sys.hostname(), kernel: sys.kernel(),
                    docker: sys.docker(), files: sys.files(), skills: sys.skills(), processes: sys.processes()
                }
            }));
            return;
        }
        
        if (pathname === '/api/docker') {
            res.end(JSON.stringify({ success: true, data: sys.docker() }));
            return;
        }
        
        if (pathname === '/api/files') {
            const safeDir = sanitizePath(q.get('dir'));
            res.end(JSON.stringify({ success: true, data: sys.files(safeDir) }));
            return;
        }
        
        if (pathname === '/api/skills') {
            res.end(JSON.stringify({ success: true, data: sys.skills() }));
            return;
        }
        
        if (pathname === '/api/processes') {
            res.end(JSON.stringify({ success: true, data: sys.processes() }));
            return;
        }
        
        if (pathname === '/api/download') {
            const safePath = sanitizePath(q.get('path'));
            fs.readFile(safePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '文件不存在' }));
                } else {
                    const filename = path.basename(safePath);
                    res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="${filename}"` });
                    res.end(data);
                }
            });
            return;
        }
        
        if (pathname === '/api/open') {
            const safePath = sanitizePath(q.get('path'));
            fs.readFile(safePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '文件不存在' }));
                } else {
                    const ext = path.extname(safePath).toLowerCase();
                    const textExts = ['.md', '.txt', '.js', '.json', '.html', '.css', '.py', '.java', '.c', '.cpp', '.xml', '.yaml', '.yml', '.ini', '.conf', '.log', '.sh'];
                    const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];
                    
                    if (textExts.includes(ext)) {
                        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                        res.end(data);
                    } else if (imgExts.includes(ext)) {
                        const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon' };
                        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
                        res.end(data);
                    } else {
                        const filename = path.basename(safePath);
                        res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `inline; filename="${filename}"` });
                        res.end(data);
                    }
                }
            });
            return;
        }
        
        if (pathname === '/api/command') {
            let cmd = q.get('cmd') || 'echo ok';
            
            // 处理 cd 命令
            if (cmd.startsWith('cd ')) {
                const newDir = cmd.substring(3).trim();
                if (!newDir) {
                    terminalCwd = '/root';
                    res.end(JSON.stringify({ success: true, output: '', cwd: terminalCwd }));
                } else {
                    const safeDir = sanitizePath(newDir);
                    try {
                        execSync(`test -d "${safeDir}"`);
                        terminalCwd = path.isAbsolute(safeDir) ? safeDir : path.resolve(terminalCwd, safeDir);
                        res.end(JSON.stringify({ success: true, output: '', cwd: terminalCwd }));
                    } catch (e) {
                        res.end(JSON.stringify({ success: false, error: `目录不存在: ${safeDir}` }));
                    }
                }
                return;
            }
            
            // 命令白名单检查
            if (!isCommandAllowed(cmd)) {
                res.end(JSON.stringify({ success: false, error: '命令不允许 (只允许安全的命令)' }));
                return;
            }
            
            // 检测 sudo -i
            if (cmd.trim().startsWith('sudo -i')) {
                res.end(JSON.stringify({ success: false, error: 'sudo -i 需要交互式终端' }));
                return;
            }
            
            // 执行命令
            const fullCmd = `cd "${terminalCwd}" && ${cmd}`;
            exec(fullCmd, { shell: '/bin/bash', timeout: CONFIG.COMMAND_TIMEOUT, maxBuffer: CONFIG.MAX_BUFFER },
                (err, stdout, stderr) => {
                    if (err) {
                        res.end(JSON.stringify({ success: false, error: err.message }));
                    } else {
                        res.end(JSON.stringify({ success: true, output: stdout || stderr, cwd: terminalCwd }));
                    }
                });
            return;
        }
        
        // 网络工具
        if (pathname === '/api/ping') {
            const host = sanitizeHost(q.get('host') || '8.8.8.8');
            if (host.length < 1 || host.length > 253) {
                res.end(JSON.stringify({ success: false, error: '无效的主机名' }));
                return;
            }
            try {
                res.end(JSON.stringify({ success: true, output: execSync(`ping -c 4 "${host}"`).toString() }));
            } catch (e) {
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
            return;
        }
        
        if (pathname === '/api/port') {
            const host = sanitizeHost(q.get('host') || 'localhost');
            const port = parseInt(q.get('port')) || 80;
            if (port < 1 || port > 65535) {
                res.end(JSON.stringify({ success: false, error: '无效的端口' }));
                return;
            }
            try {
                res.end(JSON.stringify({ success: true, output: execSync(`nc -zv -w3 "${host}" "${port}"`).toString() }));
            } catch (e) {
                res.end(JSON.stringify({ success: false, error: '端口关闭' }));
            }
            return;
        }
        
        if (pathname === '/api/dns') {
            const host = sanitizeHost(q.get('host'));
            if (!host) {
                res.end(JSON.stringify({ success: false, error: '请提供主机名' }));
                return;
            }
            try {
                res.end(JSON.stringify({ success: true, output: execSync(`nslookup "${host}" 2>&1 | tail -10`).toString() }));
            } catch (e) {
                res.end(JSON.stringify({ success: false, error: 'DNS 失败' }));
            }
            return;
        }
        
        // 静态文件服务
        let fp = '.' + (pathname === '/' ? '/index.html' : pathname);
        const ext = path.extname(fp);
        const ct = MIME_TYPES[ext] || 'text/plain';
        
        fs.readFile(fp, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': ct });
                res.end(data);
            }
        });
        
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: '服务器错误' }));
    }
});

// ==================== 启动服务器 ====================
server.listen(CONFIG.PORT, () => {
    console.log(`🚀 贾维斯控制面板 v${VERSION} on :${CONFIG.PORT}`);
    console.log('🔒 安全: 命令白名单启用, 速率限制启用, 路径清理启用');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${CONFIG.PORT} 已被占用`);
    } else {
        console.error('❌ 服务器错误:', err.message);
    }
    process.exit(1);
});
