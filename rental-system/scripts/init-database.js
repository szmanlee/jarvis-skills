const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库
function initDatabase() {
    const dbPath = path.join(__dirname, '../database/rental_system.db');
    
    // 确保目录存在
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const db = new sqlite3.Database(dbPath);
    
    console.log('🏢 开始初始化数据库...');
    
    // 创建月份表
    db.serialize(() => {
        // 月份管理表
        db.run(`CREATE TABLE IF NOT EXISTS months (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            name TEXT NOT NULL,
            total_rent REAL DEFAULT 0,
            total_electric REAL DEFAULT 0,
            total_water REAL DEFAULT 0,
            total_management REAL DEFAULT 0,
            total_amount REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(year, month)
        )`);
        
        // 住户表
        db.run(`CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_number TEXT UNIQUE NOT NULL,
            room_code TEXT UNIQUE,
            tenant_name TEXT,
            deposit REAL DEFAULT 0,
            rent_amount REAL DEFAULT 2000,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        // 费用记录表
        db.run(`CREATE TABLE IF NOT EXISTS charges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month_id INTEGER NOT NULL,
            room_number TEXT NOT NULL,
            electric_last_month REAL DEFAULT 0,
            electric_current_month REAL DEFAULT 0,
            electric_usage REAL DEFAULT 0,
            electric_amount REAL DEFAULT 0,
            water_last_month REAL DEFAULT 0,
            water_current_month REAL DEFAULT 0,
            water_usage REAL DEFAULT 0,
            water_amount REAL DEFAULT 0,
            gas_amount REAL DEFAULT 0,
            management_fee REAL DEFAULT 0,
            rent_amount REAL DEFAULT 0,
            total_amount REAL DEFAULT 0,
            payment_status TEXT DEFAULT 'pending',
            notes TEXT,
            collector TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (month_id) REFERENCES months (id),
            FOREIGN KEY (room_number) REFERENCES tenants (room_number)
        )`);
        
        // 系统设置表
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        console.log('✅ 数据库表创建完成');
        
        // 插入默认设置
        const defaultSettings = [
            ['electric_rate', '1.00'],  // 电费 1元/度
            ['water_rate', '7.00'],     // 水费 7元/吨
            ['management_fee_low', '20'],  // 低档管理费
            ['management_fee_high', '40'], // 高档管理费
            ['currency', 'CNY']        // 货币单位
        ];
        
        const stmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
        defaultSettings.forEach(setting => {
            stmt.run(setting);
        });
        stmt.finalize();
        
        console.log('⚙️ 默认设置插入完成');
        
        // 插入19户默认住户数据（基于Excel分析结果）
        const defaultTenants = [
            // 101-104
            { room: '101', code: '4403060060021400173000001', name: '杨柳',      deposit: 11700, rent: 3900 },
            { room: '102', code: '4403060060021400173000003', name: '杨柳',      deposit: 2000,  rent: 1600 },
            { room: '103', code: '4403060060021400173000002', name: '杨冰瑜',    deposit: 650,   rent: 650 },
            { room: '104', code: '4403060060021400173000004', name: '杨妍',      deposit: 1100,  rent: 1100 },
            
            // 201-204
            { room: '201', code: '4403060060021400173000005', name: '杨妍',      deposit: 1100,  rent: 1100 },
            { room: '202', code: '4403060060021400173000006', name: '杨妍',      deposit: 1200,  rent: 1200 },
            { room: '203', code: '4403060060021400173000007', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '204', code: '4403060060021400173000008', name: '杨妍(补押金16交租)', deposit: 500, rent: 1050 },
            
            // 301-310
            { room: '301', code: '4403060060021400173000009', name: '杨妍',      deposit: 1100,  rent: 1100 },
            { room: '302', code: '4403060060021400173000010', name: '杨冰瑜(302)', deposit: 1100,  rent: 1100 },
            { room: '303', code: '4403060060021400173000011', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '304', code: '4403060060021400173000012', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '305', code: '4403060060021400173000013', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '306', code: '4403060060021400173000014', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '307', code: '4403060060021400173000015', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '308', code: '4403060060021400173000016', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '309', code: '4403060060021400173000017', name: '杨妍',      deposit: 500,   rent: 1100 },
            { room: '310', code: '4403060060021400173000018', name: '杨妍',      deposit: 500,   rent: 1100 }
        ];
        
        const tenantStmt = db.prepare("INSERT OR IGNORE INTO tenants (room_number, room_code, tenant_name, deposit, rent_amount) VALUES (?, ?, ?, ?, ?)");
        defaultTenants.forEach(tenant => {
            tenantStmt.run(tenant.room, tenant.code, tenant.name, tenant.deposit, tenant.rent);
        });
        tenantStmt.finalize();
        
        console.log('👥 19户默认住户数据插入完成');
        
        // 创建2026年3月的记录（基于Excel数据）
        createMarch2026Data(db);
    });
    
    db.close();
}

function createMarch2026Data(db) {
    // 检查是否已存在2026年3月数据
    db.get("SELECT id FROM months WHERE year = 2026 AND month = 3", (err, row) => {
        if (err) {
            console.error('❌ 检查3月数据失败:', err);
            return;
        }
        
        if (row) {
            console.log('📅 2026年3月数据已存在，跳过创建');
            db.close();
            return;
        }
        
        // 插入2026年3月记录
        db.run("INSERT INTO months (year, month, name, total_rent, total_amount) VALUES (?, ?, ?, ?, ?)", 
            [2026, 3, '2026年3月', 38000, 0],
            function(err) {
                if (err) {
                    console.error('❌ 插入3月记录失败:', err);
                    db.close();
                    return;
                }
                
                const monthId = this.lastID;
                console.log(`📅 创建2026年3月记录，ID: ${monthId}`);
                
                // 插入真实的费用数据（基于Excel分析的19户数据）
                const march2026Data = [
                    { room: '101', electric_last: 40283, electric_current: 40650, water_last: 3590, water_current: 3591, rent: 3900, management: 40, collector: '杨柳' },
                    { room: '102', electric_last: 12317, electric_current: 12469, water_last: 1312, water_current: 1314, rent: 1600, management: 30, collector: '杨柳' },
                    { room: '103', electric_last: 3681,  electric_current: 3687,  water_last: 747,  water_current: 747,  rent: 650,   management: 20, collector: '杨冰瑜' },
                    { room: '201', electric_last: 5340,  electric_current: 5458,  water_last: 762,  water_current: 766,  rent: 1100,  management: 40, collector: '杨妍' },
                    { room: '202', electric_last: 14145, electric_current: 14186, water_last: 1340, water_current: 1346, rent: 1200, management: 40, collector: '杨妍' },
                    { room: '203', electric_last: 7366,  electric_current: 7403,  water_last: 1064, water_current: 1064, rent: 1100, management: 40, collector: '杨妍' },
                    { room: '204', electric_last: 8091,  electric_current: 8107,  water_last: 410,  water_current: 410,  rent: 1050, management: 40, collector: '杨妍（补押金16交租）' },
                    { room: '301', electric_last: 3142,  electric_current: 3151,  water_last: 1050, water_current: 1052, rent: 1100, management: 40, collector: '杨妍' },
                    { room: '302', electric_last: 7877,  electric_current: 7974,  water_last: 933,  water_current: 946,  rent: 1100, management: 40, collector: '杨冰瑜（302）' },
                ];
                
                const chargeStmt = db.prepare(`
                    INSERT INTO charges (
                        month_id, room_number, electric_last_month, electric_current_month,
                        water_last_month, water_current_month, rent_amount, management_fee,
                        collector
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                
                let totalElectric = 0;
                let totalWater = 0;
                let totalAmount = 0;
                
                march2026Data.forEach(data => {
                    const electricUsage = Math.max(0, data.electric_current - data.electric_last);
                    const waterUsage = Math.max(0, data.water_current - data.water_last);
                    const electricAmount = electricUsage * 1.00;  // 1元/度
                    const waterAmount = waterUsage * 7.00;        // 7元/吨
                    const total = data.rent + electricAmount + waterAmount + data.management;
                    
                    chargeStmt.run([
                        monthId, data.room, data.electric_last, data.electric_current,
                        data.water_last, data.water_current, data.rent, data.management,
                        data.collector
                    ]);
                    
                    totalElectric += electricAmount;
                    totalWater += waterAmount;
                    totalAmount += total;
                });
                
                chargeStmt.finalize();
                
                // 为剩余房间添加默认数据
                const remainingRooms = ['303', '304', '305', '306', '307', '308', '309', '310', '104'];
                
                remainingRooms.forEach(room => {
                    chargeStmt.run([
                        monthId, room, 0, 0, 0, 0, 1100, 40, '杨妍'
                    ]);
                    totalAmount += 1100 + 40;
                });
                
                // 更新月度统计
                db.run(`
                    UPDATE months SET 
                        total_electric = ?, 
                        total_water = ?, 
                        total_amount = ?, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [totalElectric, totalWater, totalAmount, monthId]);
                
                console.log(`📊 2026年3月费用统计: 电费¥${totalElectric}, 水费¥${totalWater}, 总额¥${totalAmount}`);
                
                console.log('🎉 数据库初始化完成！');
                console.log('🎯 你现在可以启动服务器: npm start');
                
                db.close();
            }
        );
    });
}

if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };