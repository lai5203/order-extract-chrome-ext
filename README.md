# order-extract-chrome-ext
导出订单日期、物品名称、实付价格、收货地址、快递公司名、物流号和签收状态。导出结果表格到粘贴板，可以直接粘贴进 Excel 等文件内。
- 同一订单多个物品，显示第一个，同时提示其他物品件数
- 同一订单多个包裹，由于限制，只能自动获取到第一个

Chrome 商店地址：
https://chrome.google.com/webstore/detail/%E8%AE%A2%E5%8D%95%E5%AF%BC%E5%87%BA/pbibapppdhjgfdlbhnbienoejojehjhc

### V1.2.2
- 优化收货地址获取，解决偶尔获取出错的问题

### V1.2
- 物流信息和收货地址可选，默认全选
- 可检测疑似额外包裹订单

### V1.0.3
- 更新到最新Chrome Manifest V3（V2 Chrome即将不再支持）
- 添加订单日期到导出数据

### V1.0.2
- 优化获取计件和价格逻辑