const fs = require('fs');

const createDirIfDoesntExist = function(directoryPath){
    try {
        let oldUmask = process.umask(0) //sets the umask to zero and returns the previous one
        
        if (!fs.existsSync(directoryPath)){
            fs.mkdirSync(directoryPath, {recursive:true})
            oldUmask = process.umask(oldUmask)

            return true
        }

        return false
    } catch (error) {
        console.error(`An error happened at createDirIfDoesntExist: '${error}'`)
        throw error
    }
}

module.exports.createDirIfDoesntExist = createDirIfDoesntExist
module.exports =  createDirIfDoesntExist