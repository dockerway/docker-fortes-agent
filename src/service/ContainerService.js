import Docker from 'dockerode';
import { createDirIfItDoesntExist } from '../helpers/createDirIfItDoesntExist.js';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export async function containerStats(containerId) {
    try {
        const container = await docker.getContainer(containerId)
        const metric = await container.stats({ stream: false })

        const stats = {
            cpu: '',
            memoryLimit: '',
            memoryUsage: ''
        }

        //CPU
        const cpuDelta = metric.cpu_stats.cpu_usage.total_usage - metric.precpu_stats.cpu_usage.total_usage
        const systemDelta = metric.cpu_stats.system_cpu_usage - metric.precpu_stats.system_cpu_usage
        // let cpu = cpuDelta / systemDelta * metric.cpu_stats.cpu_usage.percpu_usage.length * 100
        const cpu = cpuDelta / systemDelta * 100
        stats.cpu = Math.round((cpu + Number.EPSILON) * 100) / 100


        //Memory
        stats.memoryLimit = formatBytes(metric.memory_stats.limit)
        stats.memoryUsage = formatBytes(metric.memory_stats.usage)

        console.log(`Stats: '${stats}'`)
        return stats
    } catch (error) {
        console.log(`An error happened while we tried to get the container with id ${containerId}'s stats`)
        throw(error)
    }
}

export async function foldersCreator(volumes) {
    try {
        const volumesCreated = []
        let created = ""

        for (let i = 0; i < volumes.length; i++) {
            created = await createDirIfItDoesntExist(volumes[i]) //create the directory  
            created != null ? volumesCreated.push({ volume: volumes[i], created: created }) : volumesCreated
        }

        return(volumesCreated)
    } catch (error) {
        console.log(`An error happened while we tried to create the volumens '${volumes}'`)
        throw(error)
    }
}

