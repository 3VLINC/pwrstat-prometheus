# Cyberpower Powerstat Prometheus Node Exporter

This image allows you to run [Power Panel Personal](https://www.cyberpowersystems.com/products/software/power-panel-personal/) to monitor the status of your CyberPower UPS and export these stats to a textfile in Prometheus format.

This allows you to create dashboards in tools such as Grafana that display the status of your UPS and setup alerts.

# Installation Docker-Compose
An easy installation method is to use a docker-compose.yaml file to run the image.

```
version: "3.7"
services:
  pwrstat:
    image: threevl/pwrstat-node-exporter:0.0.1
    privileged: true
    environment:
        PWRSTAT_OUTPUT_FILEPATH: # Rename the output prometheus data file (defaults to pwrstat.prom)
        PWRSTAT_REFRESH_INTERVAL: # Change the refresh interval in ms (defaults to 1000)
        PWRSTAT_DEBUG: # View debugging information (defaults to 0)
    volumes:
        - /dev/bus/usb:/dev/bus/usb # Use this to mount the USB bus of your linux server inside the container so that it can interact with your cyberpower UPS
        - /var/lib/node_exporter/textfile_collector:/root/textfile_collector # Use this to mount the volume where the prometheus data file should be exported to
```