#!/bin/bash
source "/home/redmine/.rvm/scripts/rvm" || exit 1
cd `dirname $0`
rvm use 1.9.3
thin start -s1 -p3000
