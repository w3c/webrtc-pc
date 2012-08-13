#!/bin/bash

function usage {
  echo "Usage: ./publish.sh <file> [<path>]"
  echo "  <file> can be either webrtc.html or getusermedia.html"
  echo "  <path> should point to the W3C CVS checkout (default is ../2011/webrtc)"
  exit 1
}

if [ -z $1 ]; then
  usage
fi

FILE=$1
if [ ! -f ${FILE} ]; then
  echo "Invalid file specified"
  usage
fi

CVS_PATH=$2
if [ -z ${CVS_PATH} ]; then
  CVS_PATH="../2011/webrtc"
fi

if [ ! -f "${CVS_PATH}/editor/${FILE}" ]; then
  echo "Invalid CVS path directory specified"
  usage
fi

DATE=`date "+%Y%m%d"`
FILENAME=${FILE%.*}
DATED_FILE="${FILENAME}-${DATE}.html"

if [ -f ${DATED_FILE} ]; then
  echo "ABORT: File ${DATED_FILE} already exists (delete and retry)!"
  exit 1
fi

PREVIOUS_FILE=`ls -U ${FILENAME}-* | tail -n 1`
PREVIOUS_URI="http://dev.w3.org/2011/webrtc/editor/${PREVIOUS_FILE}"

echo "Setting previous version to ${PREVIOUS_FILE}"
sed "s|previousURI: [^ ]*|previousURI: \"${PREVIOUS_URI}\",|" ${FILENAME}.js

echo "Archiving current version as ${DATED_FILE}"
cp ${FILE} ${DATED_FILE}

echo "Committing files to CVS"
pushd ${CVS_PATH}
cvs add ${DATED_FILE}
cvs commit -m "Updating draft to github version ${DATED_FILE}"

echo "DONE!"
