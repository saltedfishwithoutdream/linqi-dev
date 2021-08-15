'use strict';

const fs = require('fs')
const inquirer = require('inquirer')
const fse = require('fs-extra')

const Command = require('@lq-dev/command')
const log = require('@lq-dev/log')

class InitCommand extends Command {
    init () {
        this.projectName = this._argv[0] || ''
        this.force = !!this._cmd.force
        log.verbose('projectName', this.projectName)
        log.verbose('force', this.force)
    }

    async exec () {
        console.log('init的业务逻辑')
        try {
            // 准备阶段
            await this.prepare()
            // 下载模板 
            // 安装模板
        } catch (e) {
            log.error(e.message)
        }
        

    }

    async prepare () {
        const localPath = process.cwd()
        // 判断当前目录是否为空
        if (!this.isDirEmpty(localPath)) {
            // 不为空，询问用户是否继续创建
            const { ifContinue } = await inquirer.prompt({
                type: 'confirm',
                name: 'ifContinue',
                default: false,
                message: '当前文件夹不为空，是否继续创建项目？'
                
            })
            

            if (ifContinue) {
                // 让用户二次确认
                const {confirmDelete} = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    default: false,
                    message: '是否确认清空当前目录下的文件？'
                })
                if (confirmDelete) {
                    // 清空当前目录
                    fse.emptyDirSync(localPath)
                }
                
            }
        } else {
            // 否则直接创建
        }
        
        // 是否开启强制更新
        // 选择创建项目或组件
        // 获取项目的基本信息
    }

    isDirEmpty (localPath) {
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