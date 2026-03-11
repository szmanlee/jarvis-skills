const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件 - Firefox兼容版
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "http:", "https:"],
            "font-src": ["'self'", "data:", "http:", "https:"],
            "upgrade-insecure-requests": null, // 禁用强制HTTPS
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: false // 禁用HSTS，避免HTTPS强制升级
}));
app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.32.23:3000", "http://192.168.32.88:3000", "https://192.168.32.23:3000"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 每个IP最多100个请求
});
// 暂时禁用速率限制以方便调试
// app.use(limiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接
const db = new sqlite3.Database(path.join(__dirname, 'database/rental_system.db'), (err) => {
    if (err) {
        console.error('❌ 数据库连接失败:', err.message);
    } else {
        console.log('✅ 数据库连接成功');
        initDatabaseIfEmpty();
    }
});

// API路由

// 获取所有月份列表
app.get('/api/months', (req, res) => {
    const query = `
        SELECT * FROM months 
        ORDER BY year DESC, month DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 创建新月份
app.post('/api/months', (req, res) => {
    const { year, month, name } = req.body;
    
    if (!year || !month) {
        return res.status(400).json({ error: '年份和月份必填' });
    }
    
    const query = `
        INSERT INTO months (year, month, name)
        VALUES (?, ?, ?)
    `;
    
    db.run(query, [year, month, name || `${year}年${month}月`], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // 为新月份创建所有住户的空记录
        createEmptyChargesForMonth(this.lastID);
        
        res.json({
            id: this.lastID,
            year,
            month,
            name: name || `${year}年${month}月`
        });
    });
});

// 获取特定月份的详细数据
app.get('/api/months/:id', (req, res) => {
    const monthId = req.params.id;
    
    // 获取月份信息
    db.get('SELECT * FROM months WHERE id = ?', [monthId], (err, month) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!month) {
            res.status(404).json({ error: '月份数据不存在' });
            return;
        }
        
        // 获取费用记录
        const query = `
            SELECT c.*, t.tenant_name, t.room_code
            FROM charges c
            LEFT JOIN tenants t ON c.room_number = t.room_number
            WHERE c.month_id = ?
            ORDER BY c.room_number
        `;
        
        db.all(query, [monthId], (err, charges) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // 获取统计信息
            const statsQuery = `
                SELECT 
                    SUM(rent_amount) as total_rent,
                    SUM(electric_amount) as total_electric,
                    SUM(water_amount) as total_water,
                    SUM(management_fee) as total_management,
                    SUM(total_amount) as total_amount
                FROM charges WHERE month_id = ?
            `;
            
            db.get(statsQuery, [monthId], (err, stats) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                res.json({
                    month,
                    charges,
                    statistics: stats || {
                        total_rent: 0,
                        total_electric: 0,
                        total_water: 0,
                        total_management: 0,
                        total_amount: 0
                    }
                });
            });
        });
    });
});

// 更新费用记录
app.put('/api/charges/:id', (req, res) => {
    const chargeId = req.params.id;
    const {
        electric_last_month,
        electric_current_month,
        water_last_month,
        water_current_month,
        rent_amount,
        management_fee,
        notes,
        collector,
        payment_status
    } = req.body;
    
    // 计算用量和费用
    const electricUsage = Math.max(0, (electric_current_month || 0) - (electric_last_month || 0));
    const waterUsage = Math.max(0, (water_current_month || 0) - (water_last_month || 0));
    const electricAmount = electricUsage * 1.00;  // 1元/度
    const waterAmount = waterUsage * 7.00;      // 7元/吨
    const totalAmount = (rent_amount || 0) + electricAmount + waterAmount + (management_fee || 0);
    
    const query = `
        UPDATE charges SET 
            electric_last_month = ?,
            electric_current_month = ?,
            electric_usage = ?,
            electric_amount = ?,
            water_last_month = ?,
            water_current_month = ?,
            water_usage = ?,
            water_amount = ?,
            rent_amount = ?,
            management_fee = ?,
            total_amount = ?,
            notes = ?,
            collector = ?,
            payment_status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    
    const params = [
        electric_last_month, electric_current_month, electricUsage, electricAmount,
        water_last_month, water_current_month, waterUsage, waterAmount,
        rent_amount, management_fee, totalAmount, notes, collector, payment_status,
        chargeId
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // 更新月度统计
        updateMonthStatistics(chargeId);
        
        res.json({
            id: chargeId,
            changes: this.changes,
            calculated: {
                electric_usage: electricUsage,
                electric_amount: electricAmount,
                water_usage: waterUsage,
                water_amount: waterAmount,
                total_amount: totalAmount
            }
        });
    });
});

// 获取住户信息
app.get('/api/tenants', (req, res) => {
    db.all('SELECT * FROM tenants WHERE is_active = 1 ORDER BY room_number', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 获取单个住户信息
app.get('/api/tenants/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM tenants WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: '住户不存在' });
            return;
        }
        res.json(row);
    });
});

// 创建新住户
app.post('/api/tenants', (req, res) => {
    const { room_number, room_code, tenant_name, deposit, rent_amount } = req.body;
    
    if (!room_number || !tenant_name) {
        return res.status(400).json({ error: '房号和住户姓名必填' });
    }
    
    const query = `
        INSERT INTO tenants (room_number, room_code, tenant_name, deposit, rent_amount)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(query, [room_number, room_code || '', tenant_name, deposit || 0, rent_amount || 2000], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        res.json({
            id: this.lastID,
            room_number,
            room_code: room_code || '',
            tenant_name,
            deposit: deposit || 0,
            rent_amount: rent_amount || 2000
        });
    });
});

// 更新住户信息
app.put('/api/tenants/:id', (req, res) => {
    const id = req.params.id;
    const { room_number, room_code, tenant_name, deposit, rent_amount, is_active } = req.body;
    
    const query = `
        UPDATE tenants SET 
            room_number = ?,
            room_code = ?,
            tenant_name = ?,
            deposit = ?,
            rent_amount = ?,
            is_active = ?
        WHERE id = ?
    `;
    
    db.run(query, [room_number, room_code || '', tenant_name, deposit || 0, rent_amount || 2000, is_active !== undefined ? is_active : 1, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '住户不存在' });
            return;
        }
        
        res.json({
            id,
            room_number,
            room_code: room_code || '',
            tenant_name,
            deposit: deposit || 0,
            rent_amount: rent_amount || 2000,
            is_active: is_active !== undefined ? is_active : 1
        });
    });
});

// 删除住户
app.delete('/api/tenants/:id', (req, res) => {
    const id = req.params.id;
    
    // 软删除，设置为非活跃状态
    db.run('UPDATE tenants SET is_active = 0 WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: '住户不存在' });
            return;
        }
        
        res.json({ message: '住户已删除' });
    });
});

// 获取系统设置
app.get('/api/settings', (req, res) => {
    db.all('SELECT key, value FROM settings', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });
        
        res.json(settings);
    });
});

// 工具函数
function initDatabaseIfEmpty() {
    db.get("SELECT COUNT(*) as count FROM months", [], (err, row) => {
        if (err) {
            console.error('❌ 检查数据库失败:', err.message);
            return;
        }
        
        if (row.count === 0) {
            console.log('📊 数据库为空，正在创建默认数据...');
            createDefaultData();
        } else {
            console.log('📊 数据库已就绪');
        }
    });
}

function createDefaultData() {
    // 创建2026年3月
    db.run("INSERT INTO months (year, month, name, total_rent, total_amount) VALUES (?, ?, ?, ?, ?)", 
        [2026, 3, '2026年3月', 38000, 0],
        function(err) {
            if (err) {
                console.error('❌ 创建3月记录失败:', err.message);
                return;
            }
            
            const monthId = this.lastID;
            console.log(`📅 创建2026年3月记录，ID: ${monthId}`);
            
            // 为所有住户创建空记录
            db.all('SELECT room_number FROM tenants', [], (err, tenants) => {
                if (err) {
                    console.error('❌ 获取住户失败:', err.message);
                    return;
                }
                
                const stmt = db.prepare(`
                    INSERT INTO charges (month_id, room_number, rent_amount, management_fee)
                    VALUES (?, ?, 2000, 30)
                `);
                
                tenants.forEach(tenant => {
                    stmt.run([monthId, tenant.room_number]);
                });
                
                stmt.finalize();
                console.log('🏠 为所有住户创建了基础费用记录');
            });
        }
    );
}

function createEmptyChargesForMonth(monthId) {
    db.all('SELECT room_number, rent_amount FROM tenants WHERE is_active = 1', [], (err, tenants) => {
        if (err) {
            console.error('❌ 获取住户失败:', err.message);
            return;
        }
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO charges (month_id, room_number, rent_amount, management_fee)
            VALUES (?, ?, ?, 30)
        `);
        
        tenants.forEach(tenant => {
            stmt.run([monthId, tenant.room_number, tenant.rent_amount || 2000]);
        });
        
        stmt.finalize();
        console.log(`🏠 为月份${monthId}创建了${tenants.length}个住户记录`);
    });
}

function updateMonthStatistics(chargeId) {
    // 获取费用记录的月份ID
    db.get('SELECT month_id FROM charges WHERE id = ?', [chargeId], (err, charge) => {
        if (err || !charge) return;
        
        // 重新计算月度统计
        db.run(`
            UPDATE months SET
                total_rent = (SELECT COALESCE(SUM(rent_amount), 0) FROM charges WHERE month_id = ?),
                total_electric = (SELECT COALESCE(SUM(electric_amount), 0) FROM charges WHERE month_id = ?),
                total_water = (SELECT COALESCE(SUM(water_amount), 0) FROM charges WHERE month_id = ?),
                total_management = (SELECT COALESCE(SUM(management_fee), 0) FROM charges WHERE month_id = ?),
                total_amount = (SELECT COALESCE(SUM(total_amount), 0) FROM charges WHERE month_id = ?),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [charge.month_id, charge.month_id, charge.month_id, charge.month_id, charge.month_id, charge.month_id]);
    });
}

// 主页路由
app.get('/', (req, res) => {
    // 检测用户代理，移动端使用简化版本
    const userAgent = req.get('User-Agent') || '';
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
        res.sendFile(path.join(__dirname, 'public', 'index-mobile.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

app.get('/debug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

app.get('/month/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'month-detail.html'));
});

app.get('/tenants', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tenants.html'));
});

// API健康检查端点
app.get('/api/health', (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        server: 'rental-management-system',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };
    res.json(healthCheck);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 石岩房租管理系统已启动！`);
    console.log(`🌐 访问地址: http://localhost:${PORT}`);
    console.log(`📊 月份管理: http://localhost:${PORT}/`);
    console.log(`🔑 API文档: http://localhost:${PORT}/api/months`);
});

module.exports = app;