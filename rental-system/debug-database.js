const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 检查数据库状态
const dbPath = path.join(__dirname, 'database/rental_system.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 开始检查数据库状态...');

// 检查所有表的数据
db.serialize(() => {
    // 检查月份表
    db.get("SELECT COUNT(*) as count FROM months", (err, row) => {
        if (err) {
            console.error('❌ 检查月份表失败:', err);
        } else {
            console.log(`📅 月份表数据: ${row.count} 条记录`);
        }
    });

    // 检查住户表
    db.get("SELECT COUNT(*) as total, COUNT(CASE WHEN is_active = 1 THEN 1 END) as active FROM tenants", (err, row) => {
        if (err) {
            console.error('❌ 检查住户表失败:', err);
        } else {
            console.log(`👥 住户表数据: 总计${row.total}条，活跃${row.active}条`);
        }
    });

    // 检查费用表
    db.get("SELECT COUNT(*) as count FROM charges", (err, row) => {
        if (err) {
            console.error('❌ 检查费用表失败:', err);
        } else {
            console.log(`💰 费用表数据: ${row.count} 条记录`);
        }
    });

    // 检查具体的月份费用数据
    db.get("SELECT COUNT(*) as count, SUM(total_amount) as total FROM charges WHERE month_id = 1", (err, row) => {
        if (err) {
            console.error('❌ 检查月份费用失败:', err);
        } else {
            console.log(`📊 1月份费用: ${row.count}条记录，总金额¥${row.total || 0}`);
        }
    });

    // 检查是否有空的数据
    console.log('\n🔍 检查数据完整性...');
    
    // 检查费用表中的空值
    db.all("SELECT id, room_number, electric_last_month, electric_current_month, water_last_month, water_current_month FROM charges WHERE month_id = 1 LIMIT 5", (err, rows) => {
        if (err) {
            console.error('❌ 检查费用数据失败:', err);
        } else {
            console.log('📋 前5条费用记录样例:');
            rows.forEach((row, index) => {
                console.log(`  ${index + 1}. 房间${row.room_number}: 电表${row.electric_last_month}-${row.electric_current_month}, 水表${row.water_last_month}-${row.water_current_month}`);
            });
        }
    });

    // 检查月份统计数据
    db.get("SELECT * FROM months WHERE id = 1", (err, row) => {
        if (err) {
            console.error('❌ 检查月份数据失败:', err);
        } else {
            console.log(`📈 月份统计: 房租¥${row.total_rent}, 电费¥${row.total_electric}, 水费¥${row.total_water}, 总额¥${row.total_amount}`);
            
            // 检查是否有真实数据
            if (row.total_electric === 0 && row.total_water === 0) {
                console.log('⚠️  警告: 电费和水费都是0，可能是数据未正确计算');
            }
        }
    });
});

// 5秒后关闭数据库
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('❌ 关闭数据库失败:', err);
        } else {
            console.log('\n✅ 数据库检查完成');
        }
    });
}, 5000);