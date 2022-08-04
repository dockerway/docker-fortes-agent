const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});

const createDirIfDoesntExist = require('../helpers/createDirIfDoesntExist');

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function containerStats(containerId) {
    return new Promise(async (resolve, reject) => {
        try {
            const container = await docker.getContainer(containerId);

            const opts =  {stream: false};
            const metric = await container.stats(opts);

            const stats = {
                cpu: '',
                memoryLimit: '',
                memoryUsage: ''
            };

            //CPU
            let cpuDelta = metric.cpu_stats.cpu_usage.total_usage -  metric.precpu_stats.cpu_usage.total_usage;
            let systemDelta = metric.cpu_stats.system_cpu_usage - metric.precpu_stats.system_cpu_usage;
            // let cpu= cpuDelta / systemDelta * metric.cpu_stats.cpu_usage.percpu_usage.length * 100;
            let cpu= cpuDelta / systemDelta * 100;
            stats.cpu = Math.round((cpu + Number.EPSILON) * 100) / 100;


            //Memory
            stats.memoryLimit = formatBytes(metric.memory_stats.limit);
            stats.memoryUsage = formatBytes(metric.memory_stats.usage);

            console.log("stats ", stats);
            resolve(stats);
        } catch (error) {
            reject(error);
        }

    })
}

function foldersCreator(volumes) {
    return new Promise(async (resolve, reject) => {
        try {

            let created = ""
            let volumesCreated = []

            console.log("Volumes: ",volumes)
            for(let i = 0; i < volumes.length; i++){
                created = await createDirIfDoesntExist(volumes[i]) //create the directory
                created != null ? volumesCreated.push({ volume: volumes[i], created: created }) : volumesCreated
            }

            console.log("Volumes created: ",created)
            resolve(volumesCreated)
        } catch (e) {
            reject(e)
        }
    })
}



module.exports = {
    containerStats, foldersCreator
};
