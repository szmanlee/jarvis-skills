const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 升级住户表结构脚本
const dbPath = path.join(__dirname, 'database/rental_system.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 开始升级住户信息表结构...');

db.serialize(() => {
    // 检查是否已经有新字段
    db.all("PRAGMA table_info(tenants)", (err, columns) => {
        if (err) {
            console.error('❌ 检查表结构失败:', err);
            db.close();
            return;
        }

        const existingColumns = columns.map(col => col.name);
        console.log('📋 当前字段:', existingColumns);

        // 需要添加的新字段
        const newFields = [
            { name: 'id_card', type: 'TEXT', desc: '身份证号码' },
            { name: 'phone_number', type: 'TEXT', desc: '电话号码' },
            { name: 'work_unit', type: 'TEXT', desc: '工作单位' },
            { name: 'occupants_info', type: 'TEXT', desc: '居住人员信息（JSON格式）' },
            { name: 'emergency_contact', type: 'TEXT', desc: '紧急联系人' },
            { name: 'emergency_phone', type: 'TEXT', desc: '紧急联系电话' },
            { name: 'entry_date', type: 'TEXT', desc: '入住日期' },
            { name: 'contract_end_date', type: 'TEXT', desc: '合同到期日期' },
            { name: 'remarks', type: 'TEXT', desc: '备注信息' },
            { name: 'payment_method', type: 'TEXT', desc: '付款方式：微信/支付宝/现金/银行卡' },
            { name: 'monthly_payment_day', type: 'INTEGER', desc: '每月交租日' }
        ];

        let addedCount = 0;
        
        newFields.forEach(field => {
            if (!existingColumns.includes(field.name)) {
                const sql = `ALTER TABLE tenants ADD COLUMN ${field.name} ${field.type}`;
                db.run(sql, (err) => {
                    if (err) {
                        console.error(`❌ 添加字段${field.name}失败:`, err);
                    } else {
                        console.log(`✅ 成功添加字段: ${field.name} (${field.desc})`);
                        addedCount++;
                    }
                    
                    // 检查是否所有字段都添加完成
                    if (addedCount === newFields.length) {
                        console.log('🎉 住户表结构升级完成！');
                        
                        // 为现有住户添加默认示例数据
                        addSampleData();
                    }
                });
            } else {
                console.log(`⏭️  字段${field.name}已存在，跳过`);
                addedCount++;
                
                if (addedCount === newFields.length) {
                    console.log('🎉 所有字段都存在！');
                    addSampleData();
                }
            }
        });
    });
});

// 添加示例数据
function addSampleData() {
    console.log('📝 为现有住户添加示例详细信息...');
    
    // 为前几个住户添加示例数据
    const sampleData = [
        {
            room_number: '101',
            id_card: '440306199001011234',
            phone_number: '13800138001',
            work_unit: '深圳科技有限公司',
            occupants_info: JSON.stringify({
                main_tenant: { name: '杨柳', relation: '业主', id_card: '440306199001011234' },
                family_members: [
                    { name: '李明', relation: '配偶', phone: '13900139001' }
                ]
            }),
            emergency_contact: '杨柳',
            emergency_phone: '13800138001',
            entry_date: '2023-01-01',
            contract_end_date: '2024-12-31',
            remarks: '租期2年，按时交租',
            payment_method: '微信支付',
            monthly_payment_day: 1
        },
        {
            room_number: '103',
            id_card: '440306199002022345',
            phone_number: '13800138003',
            work_unit: '深圳贸易公司',
            occupants_info: JSON.stringify({
                main_tenant: { name: '杨冰瑜', relation: '租客', id_card: '440306199002022345' }
            }),
            emergency_contact: '杨冰瑜',
            emergency_phone: '13800138003',
            entry_date: '2023-06-01',
            contract_end_date: '2024-05-31',
            remarks: '学生租客，按时交租',
            payment_method: '现金',
            monthly_payment_day: 5
        },
        {
            room_number: '201',
            id_card: '440306199003033456',
            phone_number: '13800238004',
            work_unit: '深圳建筑公司',
            occupants_info: JSON.stringify({
                main_tenant: { name: '杨妍', relation: '租客', id_card: '440306199003033456' },
                family_members: [
                    { name: '王芳', relation: '子女', age: 8 },
                    { name: '王军', relation: '子女', age: 5 }
                ]
            }),
            emergency_contact: '杨妍',
            emergency_phone: '13800238004',
            entry_date: '2022-03-01',
            contract_end_date: '2025-02-28',
            remarks: '家庭租客，2个小孩',
            payment_method: '支付宝',
            monthly_payment_day: 10
        }
    ];

    let updateCount = 0;
    
    sampleData.forEach(data => {
        const sql = `
            UPDATE tenants SET 
                id_card = ?,
                phone_number = ?,
                work_unit = ?,
                occupants_info = ?,
                emergency_contact = ?,
                emergency_phone = ?,
                entry_date = ?,
                contract_end_date = ?,
                remarks = ?,
                payment_method = ?,
                monthly_payment_day = ?
            WHERE room_number = ?
        `;
        
        const params = [
            data.id_card, data.phone_number, data.work_unit, data.occupants_info,
            data.emergency_contact, data.emergency_phone, data.entry_date,
            data.contract_end_date, data.remarks, data.payment_method,
            data.monthly_payment_day, data.room_number
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error(`❌ 更新${data.room_number}失败:`, err);
            } else {
                console.log(`✅ 房间${data.room_number}详细信息已更新`);
                updateCount++;
                
                if (updateCount === sampleData.length) {
                    console.log('🎉 示例数据添加完成！');
                    displayFinalResult();
                }
            }
        });
    });
}

// 显示最终结果
function displayFinalResult() {
    console.log('\n🎊 住户信息升级完成！');
    console.log('📋 新增字段列表：');
    console.log('  - 身份证号码 (id_card)');
    console.log('  - 电话号码 (phone_number)');
    console.log('  - 工作单位 (work_unit)');
    console.log('  - 居住人员信息 (occupants_info) - JSON格式');
    console.log('  - 紧急联系人 (emergency_contact)');
    console.log('  - 紧急联系电话 (emergency_phone)');
    console.log('  - 入住日期 (entry_date)');
    console.log('  - 合同到期日期 (contract_end_date)');
    console.log('  - 备注信息 (remarks)');
    console.log('  - 付款方式 (payment_method)');
    console.log('  - 每月交租日 (monthly_payment_day)');
    
    setTimeout(() => {
        db.close();
        console.log('\n✅ 数据库升级脚本执行完成！');
        console.log('🔄 请重启服务器并刷新页面查看新功能！');
    }, 1000);
}

if (require.main === module) {
    console.log('🚀 启动住户信息表升级...');
}