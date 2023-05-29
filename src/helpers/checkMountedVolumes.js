const fs = require('fs');

function checkIfMountedDirectoriesExists() {

    const neededVolumes = process.env.NEEDEDVOLUMES ? process.env.NEEDEDVOLUMES : '/localdata,/logs,/storage,/var'
    const directories = neededVolumes.split(',').filter(element => element.startsWith('/'));

    let result = null

    try {
        directories.forEach(directory => {
            result = fs.existsSync(directory)
            console.log(`checkIfMountedDirectoriesExists result: '${result}'. Last directory checked: '${directory}'`)
        })

        return result
    } catch (error) {
        console.error(`An error happened at checkIfMountedDirectoriesExists: '${error}'`)
        throw error
    }
}

const notMountedMessage = 'The needed directories are not mounted; please contact your infrastructure team!'

module.exports.checkIfMountedDirectoriesExists = checkIfMountedDirectoriesExists
module.exports.notMountedMessage = notMountedMessage