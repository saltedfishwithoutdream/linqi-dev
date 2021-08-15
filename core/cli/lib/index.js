'use strict';

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const path = require('path')
const commander = require('commander')
const log = require('@lq-dev/log')
const init = require('@lq-dev/init')
const exec = require('@lq-dev/exec')

// require: .js .json .node
// .js -> module.exports/exports
// .json -> JSON.parse
// 其他格式的文件，默认使用.js方式解析
const pkg = require('../package.json')
const constant = require('./const.js')


let args, config;
const program = new commander.Command()
// const {program} = commander


async function core() {
    try {
        await prepare()
        registerCommand()
    } catch (e) {
        log.error(e.message)
    }
    
}

// 注册命令
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d --debug', '是否开启调试模式', false)
        .option('-tp --targetPath <targetPath>', '是否指定本地调试文件路径', '')

    // 注册命令
    program
        .command('init [projectName]')
        .option('-f --force', '是否强制初始化项目')
        .action(exec)

    // 监听debug参数,开启debug模式
    program.on('option:debug', function (a) {
        if (program.opts().debug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
        log.verbose('test')
    })

    // 指定targetPath
    program.on('option:targetPath', function () {
        process.env.CLI_TARGET_PATH = program.opts().targetPath
    })

    // 监听所有未注册的命令
    program.on('command:*', function (obj) {
        const availableCommands = program.commands.map(cmd => cmd.name())
        console.log(colors.red('未知的命令：' + obj[0]))
        if (availableCommands.length > 0) {
            console.log(colors.red('可用命令：' + availableCommands.join(',')))
        }
    })

    program.parse(process.argv)

    if(process.argv.length < 3 || program.args.length < 1) {
        program.outputHelp()
        console.log()
    }


}

// 准备工作
async function prepare () {
    checkPkgVersion()
    // checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    checkEnv()
    await checkGlobalUpdate()
}

// 检查是否是最新版本
async function checkGlobalUpdate () {
    // 获取当前版本号和模块名
    const currentVersion = pkg.version
    const npmName = pkg.name
    // 调用npm api 获取线上所有版本号 get https://registry.npmjs.org/@lq-dev/core
    const {getNpmSemverVersion} = require('@lq-dev/get-npm-info')
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow(`请手动更新${npmName}，当前版本：${currentVersion}，最新版本：${lastVersion}
            更新命令：npm install -g ${npmName}
        `));
        
    }
    // 提取所有版本号，找出大于当前版本号的版本号
    
}

// 检查环境变量
function checkEnv () {
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome, './env')
    // dotenv.config会将.env中的键值对放到环境变量process.env中
    if (pathExists(dotenvPath)) {
        config = dotenv.config({
            path: dotenvPath
        })
    } else {
        config = dotenv.config()
    }
    createDefaultConfig()
    // console.log('环境变量', config, process.env.test)
}

function createDefaultConfig () {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }

    process.env.CLI_HOME_PATH = cliConfig.cliHome
}

// 检查入参
function checkInputArgs () {
    var minimist = require('minimist')
    args = minimist((process.argv.slice(2)))
    checkArgs()
}

function checkArgs () {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

// 检查主目录
function checkUserHome () {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在！'))
    }
}

function checkRoot () {
    const rootCheck = require('root-check') // 用于讲root账户降级
    rootCheck()
    // root账户的uid是0
    // console.log(process.geteuid())
}

function checkNodeVersion () {
    const currentVersion = process.version
    const lowestVersion= constant.LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`lq-cli 需要安装 v${lowestVersion} 以上版本的node.js`))
    }
}

// 检查版本号
function checkPkgVersion () {
    // console.log(pkg.version);
    // log.success('cli', 'success')
}

module.exports = core;