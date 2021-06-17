# Telemetry Daemon

Sends useful stats of the host to a endpoint of your choosing in JSON format.

## Install
```
git clone https://github.com/Slyke/TelemetryDaemon.git
```

## Notes
* CLI params take priority over environment variables
* `{}` = Default value
* `[]` = Required value

## Usage [Environment Variables]
* `PORT`           = {"1880"}    - Port of remote host
* [`HOSTNAME`]                   - Hostname of remote host
* `ROUTE`          = {""}        - Path on remote host
* `HTTP`           = {"false"}   - Use HTTP instead of HTTPS
* `METHOD`         = {"POST"}    - HTTP request method
* `USERNAME`       = {empty}     - Basic auth username
* `PASSWORD`       = {empty}     - Basic auth password

## Usage [CLI Params]
* `--port`         = {"1880"}    - Port of remote host
* [`--hostname`]                 - Hostname of remote host
* `--route`        = {""}        - Path on remote host
* `--http`         = {"false"}   - Use HTTP instead of HTTPS
* `--method`       = {"POST"}    - HTTP request method
* `--username`     = {empty}     - Basic auth username
* `--password`     = {empty}     - Basic auth password
* `-h`|`--help`                  - Show this menu

## Example
```
npm start --hostname "yourserver.com" --route "/telemetry"
```

## Cronjob
There's a script to help facilitate NodeJS installation, and insertion into crontab, you can run it with:
```
bash ./install_cron.sh
```
To manually update crontab, and have the script execute every 2 minutes: `crontab -e`
```
*/2 *  *  *  * /path/to/node /home/you/TelemetryDaemon/index.js --hostname "yourserver.com" --route "/telemetry"
```

## Docker
You can run this inside docker, but it may not be able to get all details about the host. Pass the `--privileged` flag to Docker to allow for more details.
