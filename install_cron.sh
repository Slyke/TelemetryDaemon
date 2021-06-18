#!/bin/bash

CPWD=$(pwd)
NODEEXEC=$(which node)

if [[ ! -f "./index.js" ]]; then
  echo "'./index.js' file not detected. Please execute from within TelemetryDaemon directory."
  exit 1
fi

if [[ ! -f "./.isTelemetryDaemon" ]]; then
  echo "'./.isTelemetryDaemon' file not detected. Please execute from within TelemetryDaemon directory."
  exit 1
fi

if [ -z "$NODEEXEC" ]; then
  echo "NodeJS binary couldn't be found in PATH. Ensure that NodeJS is installed."
  read -p "Install NVM (NodeJS Version Manager)? [y/N] " -n 1 -r < /dev/tty
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
    echo ""
    echo "Please reload your environment and setup NodeJS:"
    echo "  source ~/.bashrc"
    echo "  nvm install v16.3.0"
    exit 0
  else
    echo ""
    echo "Cancelling installation"
    exit 3
  fi
fi

crontab -l 2>/dev/null | grep -q -i "$NODEEXEC $CPWD/index.js"
FOUND_CRON=$?

if [[ "$FOUND_CRON" -eq 0 ]]; then
  echo "Entry already in crontab";
  echo "Please edit and remove with";
  echo "  crontab -e";
  exit 2
fi

echo "This will install the telemetry client to run every 2 minutes on your host."
echo "The cronjob will use the current directory as the scripts path: $CPWD"
echo "The NodeJS binary is located at: $NODEEXEC"
echo ""
$NODEEXEC $CPWD/index.js -h
echo "Please enter CLI arguments for crontab"
echo "eg:"
echo "  --hostname \"yourserver.com\" --route \"/telemetry\""
read -p "Args: " -r < /dev/tty
CLIARGS=$REPLY
echo ""
echo "Script will run as:"
echo "  $NODEEXEC $CPWD/index.js $CLIARGS"
echo ""
read -p "Is this correct? [y/N] " -n 1 -r < /dev/tty
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  crontab -l | { cat; echo "*/59 *  *  *  * $NODEEXEC $CPWD/index.js $CLIARGS"; } | crontab -
  echo "Crontab installed:"
  echo "  */2 *  *  *  *   $NODEEXEC $CPWD/index.js $CLIARGS"
  echo ""
  echo "You can remove by editing your crontab with"
  echo "  crontab -e";
else
  echo "Cancelling installation"
  exit 0
fi


