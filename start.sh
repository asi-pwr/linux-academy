#!/bin/bash
source /etc/profile
export LANG=en_US.UTF-8
source "/home/asiwww/.rvm/scripts/rvm" || exit 1
cd `dirname $0`
rvm use 1.9.3
thin start -s1 -p3000
