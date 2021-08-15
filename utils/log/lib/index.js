'use strict';


const log = require('npmlog')

log.level = process.env.LOG_LEVEL || 'info' // log级别
log.heading = 'lq' // 修改前缀
log.headingStyle = {fg: 'red'} // 修改前缀样式

// 添加自定义命令
log.addLevel('success', '2000', {fg: 'green', bold: true, bg: 'white'})


module.exports = log;
