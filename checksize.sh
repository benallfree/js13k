#!/bin/bash

myfilesize=$(($(wc -c ./out.zip | awk '{print $1}')))

max=13312
warn=1000
remain=$((max-myfilesize))

echo $myfilesize, $remain
if [  $remain -lt $warn ] ; then
    osascript -e "tell app \"System Events\" to display dialog \"${myfilesize} bytes used, ${remain} remaining\""
fi