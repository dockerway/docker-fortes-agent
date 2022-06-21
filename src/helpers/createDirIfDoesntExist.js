const fs = require('fs');

const createDirIfDoesntExist = function(dst){
    if (!fs.existsSync(dst)){
        fs.mkdirSync(dst,{recursive:true});
        return dst
    }
    return null
}

module.exports.createDirIfDoesntExist = createDirIfDoesntExist
module.exports =  createDirIfDoesntExist