const fs = require('fs');

const createDirIfDoesntExist = function(dst){
    if (!fs.existsSync(dst)){
        fs.mkdirSync(dst,{recursive:true});
        return true
    }
    return false
}

module.exports.createDirIfDoesntExist = createDirIfDoesntExist
module.exports =  createDirIfDoesntExist