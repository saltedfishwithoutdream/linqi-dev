'use strict';
const pkgDir = require('pkg-dir').sync
const path = require('path')
const pathExists = require('path-exists').sync
const npminstall = require('npminstall')
const fse = require('fs-extra')


const {isObject} = require('@lq-dev/utils')
const formatPath = require('@lq-dev/format-path')
const { getDefaultRegistry, getNpmLatestVersion } = require('@lq-dev/get-npm-info')

class Package {
    constructor (options) {
        if (!options) {
            throw new Error('Package need options!')
        }
        if (!isObject(options)) {
            throw new Error('options must be a object!')
        }
        // package路径
        this.targetPath = options.targetPath
        // 缓存package的路径
        this.storeDir = options.storeDir
        // package name
        this.packageName = options.packageName
        // package version
        this.packageVersion = options.packageVersion
        // package缓存目录的前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_')
    }

    async prepare () {
        if (this.storeDir && !pathExists(this.storeDir)) {
            // 创建缓存目录
            fse.mkdirpSync(this.storeDir)
        }
        if (this.packageVersion === 'latest') {
            // 将latest转换为真实的版本号
            this.packageVersion = await getNpmLatestVersion(this.packageName)
        }
    }

    get cacheFilePath () {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
    }

    getSpecificCacheFilePath (packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
    }

    // 判断package是否存在
    async exists () {
        if (this.storeDir) { // 缓存模式
            await this.prepare()
            return pathExists(this.cacheFilePath)
        } else { // 直接使用targetPath
            return pathExists(this.targetPath)
        }
    }

    // 安装package
    async install () {
        await this.prepare()
        return npminstall({
            root: this.targetPath,  // 模块路径
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName, 
                version: this.packageVersion
            }]
        })
    }

    // 更新package
    async update () {
        await this.prepare()
        // 获取最新的版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName)

        // 查询最新版本号对应的路径是否存在
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
        // 如果不存在，则直接安装最新版本
        if (!pathExists(latestFilePath)) {
            await npminstall({
                root: this.targetPath,  // 模块路径
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName, 
                    version: latestPackageVersion
                }]
            })
            this.packageVersion = latestPackageVersion
        }
        return latestFilePath
    }

    // 获取入口文件路径
    getRootFilePath () {
        function _getRootFile (targetPath) {
            // 获取package.json所在目录 pkg-dir
            const dir = pkgDir(targetPath)
            if (dir) {
                // 读取package.json require()
                const pkgFile = require(path.resolve(dir, 'package.json'))
            
                // main/lib  path
                if (pkgFile && (pkgFile.main)) {
                    // 路径兼容 mac/windows
                    return formatPath(path.resolve(dir, pkgFile.main))
                }
            }
            return null
        }
        // 使用缓存时
        if (this.storeDir) {
            console.log(99999);
            return _getRootFile(this.cacheFilePath)
        } else {
            return _getRootFile(this.targetPath)
        }
        
    }
}

module.exports = Package;
