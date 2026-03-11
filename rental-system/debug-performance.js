// 性能优化脚本 - 可直接在浏览器控制台运行

// 1. 清理缓存并刷新
localStorage.clear();
console.log('已清理本地缓存');
location.reload();

// 2. 检查网络请求状态
fetch('/api/months')
  .then(response => {
    console.log('API响应状态:', response.status);
    if (response.ok) {
      return response.json();
    }
    throw new Error('API请求失败');
  })
  .then(data => {
    console.log('获取的月份数据:', data);
    console.log('数据长度:', data.length);
  })
  .catch(error => {
    console.error('网络请求错误:', error);
  });

// 3. 检查住户数据
fetch('/api/tenants')
  .then(response => response.json())
  .then(data => {
    console.log('住户数据:', data.length, '户');
    console.log('活跃住户:', data.filter(t => t.is_active === 1).length, '户');
  });

// 4. 强制重新加载数据
setTimeout(() => {
  if (typeof loadMonths === 'function') {
    console.log('手动调用loadMonths函数');
    loadMonths();
  }
  
  if (typeof updateStats === 'function') {
    console.log('手动调用updateStats函数');
    updateStats();
  }
}, 1000);

console.log('🚀 性能优化脚本已执行');