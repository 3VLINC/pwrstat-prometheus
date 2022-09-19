# Pwrstat Prometheus

This image allows you to export the [CyberPower PowerPanel](https://www.pwrstatsystems.com/products/software/power-panel-personal/) stats to to Prometheus format so they can be consumed by the [Prometheus Node Exporter](https://hub.docker.com/r/prom/node-exporter) text collector and displayed within [Grafana](https://grafana.com/).

# Installation Docker-Compose
An easy installation method is to use a docker-compose.yaml file to run the image.

```
version: "3.7"
services:
  pwrstatPrometheus:
    image: threevl/pwrstat-prometheus:0.0.1
    privileged: true
    environment:
        PWRSTAT_OUTPUT_FILEPATH: # Rename the output prometheus data file (defaults to pwrstat.prom)
        PWRSTAT_REFRESH_INTERVAL: # Change the refresh interval in ms (defaults to 1000)
        PWRSTAT_DEBUG: # View debugging information (defaults to 0)
    volumes:
        - /dev/bus/usb:/dev/bus/usb # Use this to mount the USB bus of your linux server inside the container so that it can interact with your pwrstat UPS
        - /var/lib/node_exporter/textfile_collector:/root/textfile_collector # Use this to mount the volume where the prometheus data file should be exported to
```

# Accessible metrics
This gives you access to the following metrics
```
pwrstat_info.firmware_num
pwrstat_info.model_name
pwrstat_utility_volt
pwrstat_output_volt
pwrstat_diagnostic_result
pwrstat_battery_remainingtime
pwrstat_battery_charging
pwrstat_battery_discharging
pwrstat_ac_present
pwrstat_load
pwrstat_battery_capacity
pwrstat_output_rating_watt
pwrstat_input_rating_volt
```