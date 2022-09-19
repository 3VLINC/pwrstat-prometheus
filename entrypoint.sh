#/bin/sh

# Start the pwrstatd service
service pwrstatd start

pm2-runtime /root/main.js