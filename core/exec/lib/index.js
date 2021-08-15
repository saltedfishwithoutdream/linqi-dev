'use strict';

const Package = require('@lq-dev/package')
const log = require('@lq-dev/log')
const path = require('path')
const cp = require('child_process')

const SETTINGS = {
    // init: '@lq/init'
    init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies'

async function exec() {
    
    let targetPath = process.env.CLI_TARGET_PATH
    let storeDir = ''
    let pkg;
    const homePath = process.env.CLI_HOME_PATH
    log.verbose('targetPath', targetPath)
    log.verbose('homePath', homePath)

    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    // const packageVersion = '1.1.0'

    if (!targetPath) {
        // 生成路径
        targetPath = path.resolve(homePath, CACHE_DIR)
        storeDir = path.resolve(targetPath, 'node_modules')

        log.verbose('targetPath', targetPath)
        log.verbose('storeDir', storeDir)
        pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if (await pkg.exists()) {
            // 更新package
            console.log('更新package')
            await pkg.update()
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        pkg = new Package({
            targetPath,
            packageName,
            packageVersion
        })
        
    }

    const rootFile = pkg.getRootFilePath();

    if (rootFile) {
        try {
            const args = Array.from(arguments)
            // 新版本的commander，cmd中不包含参数信息，需要手动拼上去
            args[args.length - 1] = Object.assign(args[args.length - 1], args[args.length - 2] || {})

            // 在当前进程中调用
            // require(rootFile).call(null, Array.from(arguments))
            // 在node子进程中调用
            const cmd = args[args.length - 1]
            const o = Object.create(null)
            Object.keys(cmd).forEach(key => {
                if (cmd.hasOwnProperty(key) &&
                    !key.startsWith('_') &&
                    key !== 'parent') {
                        o[key] = cmd[key]
                }
            })

            args[args.length - 1] = o

            let code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
            const child = spawn('node', ['-e', code], {
                cwd: process.cwd(),
                stdio: 'inherit' // 默认是pipe，使用inherit会直接打印出来
            })
            // 当stdio是pipe时需要通过这种方式才能打印出来
            // child.stdout.on('data', (chunk) => {
            //     console.log(chunk.toString())
            // })
            // child.stderr.on('data', (chunk) => {
            //     console.log(chunk)
            // })
            child.on('error', e => {
                log.error(e.message)
                process.exit(1)
            })
            child.on('exit', e => {
                log.verbose('命令执行成功:' + e)
                process.exit(e)
            })
        } catch (e) {
            log.error(e.message)
        }
        
    }

    function spawn(command, args, options) { // 兼容Windows
        const win32 = process.platform === 'win32'
        const cmd = win32 ? 'cmd' : command
        const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

        return cp.spawn(cmd, cmdArgs, options || {})
    }
    
    // targetPath -> modulePath
    // modulePath -> package(npm 模块)
    // package.getRootFile(获取入口文件)
    // package.update / install
}

module.exports = exec;
