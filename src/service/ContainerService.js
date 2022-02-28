const Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'})



function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

 const containerStats = function (containerId) {
    return new Promise(async (resolve, reject) => {
        try {
            let stats = {
                cpu: '',
                memoryLimit: '',
                memoryUsage: ''
            }
            let container = await docker.getContainer(containerId)

            let opts =  {stream: false};

            let metric = await container.stats(opts)

            //CPU
            let cpuDelta = metric.cpu_stats.cpu_usage.total_usage -  metric.precpu_stats.cpu_usage.total_usage;
            let systemDelta = metric.cpu_stats.system_cpu_usage - metric.precpu_stats.system_cpu_usage;
            let cpu= cpuDelta / systemDelta * metric.cpu_stats.cpu_usage.percpu_usage.length * 100;
            stats.cpu = Math.round((cpu + Number.EPSILON) * 100) / 100

            //Memory
            stats.memoryLimit = formatBytes(metric.memory_stats.limit)
            stats.memoryUsage = formatBytes(metric.memory_stats.usage)

            console.log("stats ",stats)
            resolve(stats)
        } catch (e) {
            reject(e)
        }

    })
}


module.exports = {
    containerStats
}
