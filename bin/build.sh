#!/bin/bash

EXT_ROOT=$(cd "$(dirname "$0")/../"; pwd);

if [[ ! -d $EXT_ROOT/dist ]]; then
	mkdir -p $EXT_ROOT/dist;
fi;

cd $EXT_ROOT/chrome;

chromium --pack-extension="$EXT_ROOT/chrome" --pack-extension-key="$EXT_ROOT/chrome.pem";
mv $EXT_ROOT/chrome.crx $EXT_ROOT/dist/github-scrumboard.crx;

