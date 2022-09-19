var net = require('net');
var resolve = require('path').resolve;
var fs = require('fs').promises;
var process = require('process');
var socketPath = '/var/pwrstatd.ipc';
var outputFolder = resolve(__dirname, './textfile_collector');
var outputFilename = process.env.PWRSTAT_OUTPUT_FILEPATH;
var outputPath = resolve(outputFolder, outputFilename);
var refreshInterval = parseInt(process.env.PWRSTAT_REFRESH_INTERVAL);
var debug = process.env.PWRSTAT_DEBUG ? true : false;

var parseData = (data) => {
    const info = data.toString('utf-8').split('\n').slice(1).map(
         (value) => value.split('=')
     )
     .reduce(
         (accum, row) => {
             accum[row[0]] = row[1];
             return accum;
         },
         {}
     );

     return `
 # HELP cyberpower_info Information about UPS
 # TYPE cyberpower_info gauge
 cyberpower_info{firmware_num="${info['firmware_num']}", model_name="${info['model_name']}"} 1.0
 
 # HELP cyberpower_utility_volt Voltage from the utility
 # TYPE cyberpower_utility_volt gauge
 cyberpower_utility_volt ${parseFloat(info['utility_volt'])/1000}
 
 # HELP cyberpower_output_volt Voltage output
 # TYPE cyberpower_output_volt gauge
 cyberpower_output_volt ${parseFloat(info['output_volt'])/1000}
 
 # HELP cyberpower_diagnostic_result Result of last diagnostic
 # TYPE cyberpower_diagnostic_result gauge
 cyberpower_diagnostic_result ${parseInt(info['diagnostic_result'], 10)}
 
 # HELP cyberpower_battery_remainingtime Seconds of battery time remaining
 # TYPE cyberpower_battery_remainingtime gauge
 cyberpower_battery_remainingtime ${parseFloat(info['battery_remainingtime'])*1000}
 
 # HELP cyberpower_battery_charging Is battery charging
 # TYPE cyberpower_battery_charging gauge
 cyberpower_battery_charging ${(info['battery_charging'] === 'yes' ? '1' : '0')}
 
 # HELP cyberpower_battery_discharging Is battery discharging
 # TYPE cyberpower_battery_discharging gauge
 cyberpower_battery_discharging ${(info['battery_discharging'] === 'yes' ? '1' : '0')}
 
 # HELP cyberpower_ac_present Is AC power present
 # TYPE cyberpower_ac_present gauge
 cyberpower_ac_present ${(info['ac_present'] === 'yes' ? '1' : '0')}
 
 # HELP cyberpower_load Load percentage
 # TYPE cyberpower_load gauge
 cyberpower_load ${parseFloat(info['load'])/100000}
 
 # HELP cyberpower_battery_capacity Percentage of battery remaining
 # TYPE cyberpower_battery_capacity gauge
 cyberpower_battery_capacity ${parseFloat(info['battery_capacity'])/100}
 
 # HELP cyberpower_input_rating_volt Input voltage rating
 # TYPE cyberpower_input_rating_volt gauge
 cyberpower_input_rating_volt ${parseFloat(info['input_rating_volt'])/1000}
 
 # HELP cyberpower_output_rating_watt Output watts rating
 # TYPE cyberpower_output_rating_watt gauge
 cyberpower_output_rating_watt ${parseFloat(info['output_rating_watt'])/1000}
 `;
 }

var getTime = () => Date.now();

var log = (...msg) => {
    if (debug) {
        console.log(...msg);
    }
}

var main = async (client) => {
    log(`Starting
Socket Path: ${socketPath}
Output Path: ${outputPath}
Refresh Interval (ms): ${refreshInterval}
`);
    await fs.mkdir(outputFolder, { recursive: true });
    log('Initialized');
    var lastUpdate;
    var timeoutId; 
    var client = net.createConnection(socketPath);

    var update = () => {
        lastUpdate = getTime();
        client.write(Buffer.from('STATUS\n\n'))
    };

    var onConnect = () => {
        log('Connected');
        update();
    }
    var onUpdate = (data) => {
        log('Updating');
        fs.writeFile(outputPath, parseData(data));
        
        var time = getTime();
        var timeUntilUpdate = (time + refreshInterval) - lastUpdate;
        
        log('Next update in ', timeUntilUpdate, 'ms');
        timeUntilUpdate = (timeUntilUpdate <= 0) ? 0 : timeUntilUpdate;
        timeoutId = setTimeout(update, timeUntilUpdate);
        
    };
    var onError = (error) => {
        console.error(error);
        client.destroy();
    }
    var onClose = () => {
        clearTimeout(timeoutId);
        client.destroy();
    }
    client.on('connect', onConnect);
    client.on('data', onUpdate);
    client.on('error', onError);
    process.on('SIGTERM', onClose);

}

main();