/**
 ** 把 xxx.md 文件名修改为 title: abc 的字段值，文件名变成 abc.md
 ** title: abc ===>>> abc.md
 ** 因为 hexo 文章的标题是根据 .md 文件中的 title 字段的值作为标题
 **


// 对单个文件操作 ok
const fs = require('fs');
const filePath = './source/_test/1.md';
const fileData = fs.readFileSync(filePath, { encoding: 'utf8' });

var RegExp=/(title:\s*)(.*)/g; // 匹配 .md 文件中 title: 后面的参数值

if(RegExp.test(fileData)){ //如果匹配到`title`字段
  var title = fileData.match(RegExp)[0]; // 匹配结果返回 title: aaaa
  var name  = title.substr(7); // 得到 title 参数值 aaa
  console.log(title);
  console.log(name);
  var newFile = './source/_test/' + name + '.md';
  //修改文件名
  fs.rename(filePath,newFile,(err) => {
    if(err) throw err;
  })
}
**/

/* 对文件夹下的每个文件 操作 ok

//引入fs操作文件
var fs = require('fs');
var join = require('path').join;

// 设置要操作的文件夹
var dirpath = "./source/_posts/";

function getAllFiles(dir){
  let jsonFiles = [];
  function findJsonFile(path){
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      let fPath = join(path,item);
      let stat = fs.statSync(fPath);
      if(stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) { 
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(dir);
  //console.log(jsonFiles);//指定目录下的文件，包括子目录
  return jsonFiles;
}

function doFileEdit(){
  // 文件夹下每个文件的路径json数据
  var filesPathJson = getAllFiles(dirpath);
  //console.log(filesPathJson);
  for(var i=0; i < filesPathJson.length; i++){
    var _file = filesPathJson[i]; // path/to/123456.md
    //console.log(_file);
    var file_full_name = _file.substr(_file.lastIndexOf('/')+1); // 123456.md
    var file_name      = file_full_name.slice(0,-3); // 123456
    var file_suffix    = file_full_name.slice(-3); // .md
    //console.log(file_name);

    var fileData = fs.readFileSync(_file, { encoding: 'utf8' });
    
    // 匹配 .md 文件中 title: 后面的参数值(.md 文件中 冒号后面有空格)
    var RegExp=/(title:\s*)(.*)/g;

    if(RegExp.test(fileData)){ //如果匹配到`title`字段
      var md_title_str = fileData.match(RegExp)[0]; // 返回 title: aaaa
      var md_title_var  = md_title_str.substr(7); // 返回 aaa
      //console.log(md_title_str);
      //console.log(md_title_var);
      
      // 如果 .md 文件中的 title 参数值 与 .md 文件名称不一致，则修改
      if(md_title_var != file_name){
        
        console.log(
        "\x1B[35m"
        + md_title_str
        + "\x1B[0m"
        + "  "
        + file_full_name
        + "\x1B[32m ===> \x1B[0m"
        + "\x1B[36m"
        + md_title_var + file_suffix
        + "\x1B[0m"
        );

        var newFile = dirpath + md_title_var + file_suffix;
        
        //修改文件名
        fs.rename(_file, newFile,(err) => {
          if(err) throw err;
        })
      }
    }
  }
}

console.log("\x1B[1m ---修改文件列表--- \x1B[0m");
doFileEdit();
*/