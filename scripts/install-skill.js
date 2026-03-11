/**
 * 安装脚本 - 安装单个或所有技能
 * 
 * 使用方法:
 *   node scripts/install-skill.js          # 安装所有技能
 *   node scripts/install-skill.js browse   # 安装单个技能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 技能配置
const SKILLS = {
  browse: {
    name: 'Browse',
    emoji: '🌐',
    description: 'Browserbase 浏览器自动化',
    features: ['Browserbase 集成', 'Stagehand CLI', '认证流程', '脚本创建']
  },
  'docker-sandbox': {
    name: 'Docker Sandbox',
    emoji: '🐳',
    description: 'Docker 沙箱 VM 环境',
    features: ['安全隔离', '多 Agent 支持', '网络代理', '自动清理']
  },
  'docker-essentials': {
    name: 'Docker Essentials',
    emoji: '📦',
    description: 'Docker 容器管理基础',
    features: ['容器管理', '镜像操作', '网络管理', '卷管理']
  },
  'coding-agent': {
    name: 'Coding Agent',
    emoji: '🤖',
    description: 'Codex CLI 编程助手',
    features: ['Claude Code', 'Codex CLI', 'OpenCode', '后台运行']
  },
  'git-workflows': {
    name: 'Git Workflows',
    emoji: '🔧',
    description: '高级 Git 操作',
    features: ['Rebase', 'Bisect', 'Worktree', 'Reflog']
  },
  'emergency-rescue': {
    name: 'Emergency Rescue',
    emoji: '🚨',
    description: '灾难恢复工具',
    features: ['Force-push 恢复', '密钥清理', '磁盘清理', '进程恢复']
  },
  'tdd-guide': {
    name: 'TDD Guide',
    emoji: '🧪',
    description: '测试驱动开发',
    features: ['测试生成', '覆盖率分析', '多框架支持', 'CI 集成']
  },
  ontology: {
    name: 'Ontology',
    emoji: '📊',
    description: '知识图谱管理',
    features: ['实体管理', '关系链接', '约束执行', '图变换']
  },
  'ssh-tunnel': {
    name: 'SSH Tunnel',
    emoji: '🔐',
    description: 'SSH 隧道和端口转发',
    features: ['本地转发', '远程转发', '动态代理', 'Jump host']
  },
  healthcheck: {
    name: 'Healthcheck',
    emoji: '🏥',
    description: '安全加固和风险配置',
    features: ['安全审计', '防火墙', 'SSH 加固', '更新检查']
  },
  'regex-patterns': {
    name: 'Regex Patterns',
    emoji: '🔍',
    description: '实用正则表达式',
    features: ['输入验证', '日志解析', '数据提取', '代码重构']
  },
  'self-improving-agent': {
    name: 'Self-improving Agent',
    emoji: '🎓',
    description: '持续学习改进',
    features: ['错误记录', '纠正学习', 'API 失败处理', '知识更新']
  },
  github: {
    name: 'GitHub',
    emoji: '🦊',
    description: 'GitHub CLI 操作',
    features: ['Issues 管理', 'PR 操作', 'CI 检查', 'API 查询']
  },
  'gh-issues': {
    name: 'GitHub Issues',
    emoji: '🐛',
    description: 'Issues 管理自动化',
    features: ['Issue 修复', 'PR 创建', '代码审查', '自动合并']
  },
  oracle: {
    name: 'Oracle',
    emoji: '🧙',
    description: 'Oracle CLI',
    features: ['Prompt 绑定', '文件附件', '多引擎', '会话管理']
  },
  'bat-cat': {
    name: 'Bat Cat',
    emoji: '🐱',
    description: '语法高亮版 cat',
    features: ['语法高亮', '行号显示', 'Git 集成', '轻量级']
  },
  weather: {
    name: 'Weather',
    emoji: '🌤️',
    description: '天气预报',
    features: ['当前天气', '天气预报', '多数据源', '无需 API Key']
  },
  'agent-council': {
    name: 'Agent Council',
    emoji: '👥',
    description: '多 Agent 系统',
    features: ['Agent 创建', 'Discord 管理', '协作系统', '任务分配']
  }
};

// OpenClaw Skills 目录
const TARGET_BASE = '/root/.openclaw/skills';

function installSkill(skillId) {
  const config = SKILLS[skillId];
  if (!config) {
    console.error(`❌ 未知的技能: ${skillId}`);
    console.log('可用的技能:', Object.keys(SKILLS).join(', '));
    return false;
  }

  const sourceDir = path.join(__dirname, '..', 'skills', skillId);
  const targetDir = path.join(TARGET_BASE, skillId);

  console.log(`\n📦 安装 ${config.emoji} ${config.name}...`);
  console.log(`   源目录: ${sourceDir}`);
  console.log(`   目标目录: ${targetDir}`);

  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ 源目录不存在: ${sourceDir}`);
    return false;
  }

  // 复制文件
  try {
    copyDirectory(sourceDir, targetDir);
    console.log(`✅ 复制文件完成`);
    
    console.log(`\n✅ ${config.name} 技能安装完成!`);
    console.log(`   功能: ${config.features.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 安装失败: ${error.message}`);
    return false;
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function installAll() {
  console.log('🚀 开始安装所有技能...\n');
  
  let success = 0;
  let failed = 0;
  
  for (const skillId of Object.keys(SKILLS)) {
    if (installSkill(skillId)) {
      success++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log(`📊 安装完成: ${success} 成功, ${failed} 失败`);
  console.log('='.repeat(50));
  
  return failed === 0;
}

function listSkills() {
  console.log('📋 可用的技能:\n');
  
  for (const [id, config] of Object.entries(SKILLS)) {
    console.log(`  ${config.emoji} ${id.padEnd(18)} - ${config.description}`);
    console.log(`     功能: ${config.features.slice(0, 2).join(', ')}`);
    console.log('');
  }
}

// 主程序
const args = process.argv.slice(2);
const skillId = args[0];

if (!skillId) {
  // 安装所有技能
  installAll();
} else if (skillId === '--list' || skillId === '-l') {
  // 列出所有技能
  listSkills();
} else {
  // 安装单个技能
  installSkill(skillId);
}
