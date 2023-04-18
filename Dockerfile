ARG pwrstatVersion=1.4.1
FROM --platform=amd64 node:18-bullseye-slim
ENV PWRSTAT_OUTPUT_FILEPATH=pwrstat.prom
ENV PWRSTAT_REFRESH_INTERVAL=500;
ENV PWRSTAT_DEBUG=0;
COPY ./versions/PPL_64bit_v1.4.1.deb /root
RUN dpkg -i /root/PPL_64bit_v1.4.1.deb && npm install pm2@5.3.0 -g
COPY ./entrypoint.sh /root/entrypoint.sh
COPY ./main.js /root/main.js
VOLUME /root/textfile_collector
VOLUME /etc/pwrstatd.conf
CMD "/root/entrypoint.sh"