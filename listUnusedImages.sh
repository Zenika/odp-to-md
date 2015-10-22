#!/bin/bash

# version 1.0.0

mkdir backup
for f in `ls images`;do grep $f ../*.md >/dev/null || echo mv \"images/$f\" \"backup/$f\";done > list.sh
