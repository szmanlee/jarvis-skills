const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 修复费用数据脚本
const dbPath = path.join(__dirname, 'database/rental_system.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 开始修复费用数据...');

// 基于你Excel文件的真实数据
const realData = [
    // 101-104 - 杨柳负责
    { room: '101', electric_last: 40283, electric_current: 40650, water_last: 3590, water_current: 3591, collector: '杨柳' },
    { room: '102', electric_last: 12317, electric_current: 12469, water_last: 1312, water_current: 1314, collector: '杨柳' },
    { room: '103', electric_last: 3681,  electric_current: 3687,  water_last: 747,  water_current: 747,  collector: '杨冰瑜' },
    { room: '104', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    
    // 201-204 - 杨妍负责
    { room: '201', electric_last: 5340,  electric_current: 5458,  water_last: 762,  water_current: 766,  collector: '杨妍' },
    { room: '202', electric_last: 14145, electric_current: 14186, water_last: 1340, water_current: 1346, collector: '杨妍' },
    { room: '203', electric_last: 7366,  electric_current: 7403,  water_last: 1064, water_current: 1064, collector: '杨妍' },
    { room: '204', electric_last: 8091,  electric_current: 8107,  water_last: 410,  water_current: 410,  collector: '杨妍（补押金16交租）' },
    
    // 301-310 - 杨妍负责
    { room: '301', electric_last: 3142,  electric_current: 3151,  water_last: 1050, water_current: 1052, collector: '杨妍' },
    { room: '302', electric_last: 7877,  electric_current: 7974,  water_last: 933,  water_current: 946,  collector: '杨冰瑜（302）' },
    { room: '303', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '304', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '305', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '306', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '307', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '308', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '309', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' },
    { room: '310', electric_last: 0,     electric_current: 0,     water_last: 0,    water_current: 0,    collector: '杨妍' }
];

// 获取正确的房租金额（基于Excel数据）
const rentAmounts = {
    '101': 3900,
    '102': 1600, 
    '103': 650,
    '104': 1100,
    '201': 1100,
    '202': 1200,
    '203': 1100,
    '204': 1050,
    '301': 1100,
    '302': 1100,
    '303': 1100,
    '304': 1100,
    '305': 1100,
    '306': 1100,
    '307': 1100,
    '308': 1100,
    '309': 1100,
    '310': 1100
};

db.serialize(() => {
    let updateCount = 0;
    let totalElectric = 0;
    let totalWater = 0;
    let totalAmount = 0;

    console.log(`📝 准备更新 ${realData.length} 条费用记录...`);

    realData.forEach(data => {
        const electricUsage = Math.max(0, data.electric_current - data.electric_last);
        const waterUsage = Math.max(0, data.water_current - data.water_last);
        const electricAmount = electricUsage * 1.00;  // 1元/度
        const waterAmount = waterUsage * 7.00;        // 7元/吨
        const rent = rentAmounts[data.room] || 1100;
        const managementFee = data.room <= 104 ? 30 : 40; // 一楼30元，其他40元
        const total = rent + electricAmount + waterAmount + managementFee;

        const stmt = db.prepare(`
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
                collector = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE month_id = 1 AND room_number = ?
        `);

        stmt.run([
            data.electric_last,
            data.electric_current, 
            electricUsage,
            electricAmount,
            data.water_last,
            data.water_current,
            waterUsage, 
            waterAmount,
            rent,
            managementFee,
            total,
            data.collector,
            data.room
        ], function(err) {
            if (err) {
                console.error(`❌ 更新${data.room}失败:`, err);
            } else {
                updateCount++;
                totalElectric += electricAmount;
                totalWater += waterAmount;
                totalAmount += total;
                
                console.log(`✅ 房间${data.room}: 电费¥${electricAmount}, 水费¥${waterAmount}, 合计¥${total}`);
            }
        });

        stmt.finalize();
    });

    // 等待所有更新完成后，更新月度统计
    setTimeout(() => {
        console.log(`\n📊 更新完成${updateCount}条记录`);
        console.log(`💰 总计: 电费¥${totalElectric}, 水费¥${totalWater}, 总金额¥${totalAmount}`);

        db.run(`
            UPDATE months SET 
                total_electric = ?,
                total_water = ?,
                total_amount = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `, [totalElectric, totalWater, totalAmount], function(err) {
            if (err) {
                console.error('❌ 更新月度统计失败:', err);
            } else {
                console.log('✅ 月度统计更新完成');
                console.log('🎉 数据修复完成！现在可以刷新网页查看效果');
            }
        });

        db.close();
    }, 1000);
});