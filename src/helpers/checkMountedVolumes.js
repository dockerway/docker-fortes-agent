const fs = require('fs');

function checkIfMountedDirectoriesExists() {
  const neededVolumes = process.env.NEEDEDVOLUMES ? process.env.NEEDEDVOLUMES : '/localdata,/logs,/storage,/var'
  const directories = neededVolumes.split(',').filter(element => element.startsWith('/'))

  try {
    for (let i = 0; i < directories.length; i++) {
      if (!fs.existsSync(directories[i])) {
        console.log(`Directory does not exist: '${directories[i]}'`)
        return false
      }
    }

    console.log('All directories exist.')
    return true
  } catch (error) {
    console.error(`An error occurred at checkIfMountedDirectoriesExists: '${error}'`)
    throw error
  }
}

const notMountedMessage = 'The needed directories are not mounted; please contact your infrastructure team!'

module.exports.checkIfMountedDirectoriesExists = checkIfMountedDirectoriesExists;
module.exports.notMountedMessage = notMountedMessage;
