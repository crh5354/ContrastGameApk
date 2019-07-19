/**
* crh 
*/

// mac os
const fs = require("fs");
const path = require('path');
const execSync = require('child_process').execSync; 
//设置根目录
let newRoot = '/Users/feng/Desktop/222/1/test_huawei3.apk';
let oldRoot = '/Users/feng/Desktop/222/1/test_huawei4.apk';
let tempPath = '/Users/feng/Desktop/222/1/tempRes';

let unzipApk = function( apkPath ) {
    let end = apkPath.length-1;
    let tempRoot = apkPath;
    let tempRootApk = '';
    for (let i = end; i >= 0; i--) {
        let char = apkPath[ i ];
        if ( char == '/' && i != end ) {
            tempRootApk = tempRoot.slice(i,tempRoot.length);
            tempRoot = tempRoot.slice(0,i) + '/temp_' + tempRoot.slice(i+1,tempRoot.length).split('.').shift();
            break;
        }
    }

    console.log(tempRoot);
    if ( fs.existsSync( tempRoot ) ) {
        execSync( 'rm -rf ' + tempRoot );
    }

    execSync( 'mkdir ' + tempRoot );

    let newZip = tempRoot + tempRootApk.split('.').shift() + '.zip';
    execSync( 'cp -r ' + apkPath + " " + newZip );

    execSync( 'unzip -n ' + newZip + " -d " + tempRoot );

    execSync( 'rm -rf ' + newZip );

    return tempRoot + '/assets';
}

let getAllFile = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()){
            results = results.concat(getAllFile(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

let getAllFileMD5 = function(list) {
    console.log("获取全部文件md5码开始");
    let table = {};
    for (let i = 0; i < list.length; i++) {
        let cmdStr = 'md5 ' + list[i];
        try {
            let cmd = execSync(cmdStr).toString();
            let temp = 'MD5 (' + list[i] + ' ) =  ';
            let md5 = cmd.slice(temp.length-2,cmd.length);
            table[ list[i] ] = md5;
        }
        catch( err ) {
            console.log( err, cmdStr );
        }
    }
    console.log("获取全部文件md5码结束");
    return table;
}

let getDifferenceFile = function(fileList1, fileList2) {
    console.log("对比两个文件夹的差异文件开始");
    let table = {};
    for (let key in fileList1) {
        let oldPath = oldRoot + key.slice( newRoot.length, key.length );
        if ( fileList1[key] != fileList2[ oldPath ] ) {
            table[ key ] = fileList1[key];
        }
    }
    console.log("对比两个文件夹的差异文件结束");
    return table;
}

// 解压apk
console.log("解压apk");
newRoot = unzipApk( newRoot );
oldRoot = unzipApk( oldRoot );

// // 测试
// newRoot = '/Users/feng/Documents/blastHeroClient/client/bin/res3';
// oldRoot = '/Users/feng/Documents/blastHeroClient/client/bin/res4';
// tempPath = '/Users/feng/Documents/blastHeroClient/client/bin/tempRes';

console.log("新文件夹");
let newFileTable = getAllFileMD5( getAllFile( newRoot ) );
console.log("旧文件夹");
let oldFileTable = getAllFileMD5( getAllFile( oldRoot ) );
let fileTable = getDifferenceFile( newFileTable, oldFileTable );

// 差异文件保存路径
let tempRoot = tempPath;
console.log("差异文件夹"+tempRoot);

// 删除差异文件夹
if ( fs.existsSync( tempRoot ) ) {
    console.log("已存在，删除差异文件夹");
    execSync( 'rm -rf ' + tempRoot );
}

// 创建差异文件夹
execSync( 'mkdir ' + tempRoot );
console.log("创建新的差异文件夹");

// 拷贝最新的文件夹到文件夹
execSync( 'cp -r ' + newRoot + "/ " + tempRoot );
console.log("拷贝全部资源到差异文件夹");

console.log("删除不差异的文件开始");
// let tempFileTable = getAllFileMD5( getAllFile( tempRoot ) );
for (let key in newFileTable) {
    let tempPath = tempRoot + key.slice( newRoot.length, key.length );
    if ( fileTable.hasOwnProperty( key ) ) {
        // 垃圾文件需要删除
        let fileType = tempPath.split('.').pop();
        if ( fileType == 'DS_Store' ) {
            execSync( 'rm  -rf ' + tempPath );
        }
    }else{
        execSync( 'rm  -rf ' + tempPath );
    }
}
console.log("删除不差异的文件结束");
console.log("结束");

