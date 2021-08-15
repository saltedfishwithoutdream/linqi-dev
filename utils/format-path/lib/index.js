'use strict';

const path = require('path')

module.exports = function formatPath(p) {
    if (p && typeof p === 'string') {
        const sep = path.sep; // 路径分隔符
        if (sep === '/') {
            return p
        } else {
            // windows的文件分隔符是\
            return p.replace(/\\/g, '/')
        }
    }
    return p
}


