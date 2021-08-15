'use strict';

const Command = require('@lq-dev/command')
const log = require('@lq-dev/log')
const fs = require('fs')

class InitCommand extends Command {
    init () {
        this.projectName = this._argv[0] || ''
        this.force = !!this._cmd.force
        log.verbose('projectName', this.projectName)
        log.verbose('force', this.force)
    }

    exec () {
        console.log('init的业务逻辑')
        try {
            // 准备阶段
            this.prepare()
            // 下载模板 
            // 安装模板
        } catch (e) {
            log.error(e.message)
        }
        

    }

    prepare () {
        // 判断当前目录是否为空
        const ret = this.isCwdEmpty()
        console.log('目录为空？', ret)
        // 是否开启强制更新
        // 选择创建项目或组件
        // 获取项目的基本信息
    }

    isCwdEmpty () {
        const localPath = process.cwd()
        let fileList = fs.readdirSync(localPath)
        fileList = fileList.filter(file => {
            return !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
        })
        console.log(fileList)
        return !fileList || fileList.length <= 0
    }
}

function init(argv) {
    // console.log('--init--', argv, process.env.CLI_TARGET_PATH)
    return new InitCommand(argv)
}



module.exports.InitCommand = InitCommand;
module.exports = init