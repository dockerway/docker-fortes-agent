import fs from 'fs';

export function createDirIfItDoesntExist(path){
    try {
        if (!fs.existsSync(path)){
            fs.mkdirSync(path, {recursive:true})
            return true
        }

        return false
    } catch (error) {
        console.log(`An error happened when we tried to execute the createDirIfItDoesntExist function: '${error}'`)
        throw(error)
    }
}
