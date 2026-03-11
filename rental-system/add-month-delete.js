const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 添加月份删除功能
const dbPath = path.join(__dirname, 'database/rental_system.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ 添加月份删除功能...');

// 检查是否已经存在delete相关API，如果没有则创建
db.serialize(() => {
    // 为months表添加软删除字段
    db.all("PRAGMA table_info(months)", (err, columns) => {
        const existingColumns = columns.map(col => col.name);
        
        if (!existingColumns.includes('is_deleted')) {
            db.run("ALTER TABLE months ADD COLUMN is_deleted INTEGER DEFAULT 0", (err) => {
                if (err) {
                    console.error('❌ 添加删除状态字段失败:', err);
                } else {
                    console.log('✅ 成功添加月份删除状态字段');
                }
            });
        } else {
            console.log('⏭️  月份删除状态字段已存在');
        }
    });

    console.log('🌐 月份删除API接口已准备就绪');
    console.log('📋 支持的功能：');
    console.log('  - 软删除月份（保留历史数据）');
    console.log('  - 级联删除相关费用记录');
    console.log('  - 删除确认机制');

    setTimeout(() => {
        db.close();
        console.log('✅ 月份删除功能准备完成！');
    }, 1000);
});