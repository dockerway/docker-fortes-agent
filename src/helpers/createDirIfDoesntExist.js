const fs = require('fs');

const createDirIfDoesntExist = function(directoryPath){
    try {
        if (!fs.existsSync(directoryPath)){
            fs.mkdirSync(directoryPath, {recursive:true})
            return true
        }

        return false
    } catch (error) {
        console.error(`An error happened at createDirIfDoesntExist: '${createDirIfDoesntExist}'`)
        throw error
    }
}

module.exports.createDirIfDoesntExist = createDirIfDoesntExist
module.exports =  createDirIfDoesntExist