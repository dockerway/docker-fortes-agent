const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const createDirIfDoesntExist = require('../helpers/createDirIfDoesntExist');
const { checkIfMountedDirectoriesExists, notMountedMessage } = require('../helpers/checkMountedVolumes');

function formatBytes(bytes, decimals = 2) {
    try {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    } catch (error) {
        console.error(`An error happened at the 'formatBytes' function: '${error.message ? error.message : error}'`)
        throw error
    }
}

async function containerStats(containerId) {
    try {
        const metric = await docker.getContainer(containerId).stats({ stream: false })

        if (metric) {
            const cpuDelta = metric.cpu_stats.cpu_usage.total_usage - metric.precpu_stats.cpu_usage.total_usage
            const systemDelta = metric.cpu_stats.system_cpu_usage - metric.precpu_stats.system_cpu_usage
            const cpu = cpuDelta / systemDelta * 100

            const stats = {
                cpu: Math.round((cpu + Number.EPSILON) * 100) / 100,
                memoryLimit: formatBytes(metric.memory_stats.limit),
                memoryUsage: formatBytes(metric.memory_stats.usage)
            }
            
            console.log(`containerStats debug: | stats: '${JSON.stringify(stats, null, 2)}`)
            return stats
        }
    } catch (error) {
        console.error(`An error happened at the 'containerStats' function: '${error.message ? error.message : error}'`)
        throw error
    }
}

function foldersCreator(volumes) {
    if (checkIfMountedDirectoriesExists()) {
        try {
            let created = false
            const volumesCreated = []

            for (let i = 0; i < volumes.length; i++) {
                created = createDirIfDoesntExist(volumes[i]) //create the directory  
                created ? volumesCreated.push({ volume: volumes[i], created: created }) : volumesCreated
            }

            return volumesCreated
        } catch (error) {
            console.error(`An error happened at the 'foldersCreator' function: '${error.message ? error.message : error}'`)
            throw error
        }
    } else {
        return notMountedMessage
    }
}



module.exports = {
    containerStats, foldersCreator
}
