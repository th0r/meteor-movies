#! /bin/sh

set -e
# Setting script directory as the current one
SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
cd "$SCRIPT_DIR"

BUNDLE_NAME="meteor-movies"
BUILD_DIR="bundle-build"

# Getting optional flags
# -b: deploying branch name ("master" by default)
while getopts b: option
do
    case "${option}" in
        b) BRANCH=${OPTARG};;
    esac
done

if [ -z "$BRANCH" ]; then
    BRANCH="master"
fi
shift $(($OPTIND - 1))

# Getting deployed bundle path
if [ -z $1 ]; then
    echo "You must provide full path to bundle directory as first parameter!"
    exit 1;
fi

DEPLOY_PATH="$1"

echo "Updating Meteor Movies"
echo "\nDeploying branch \"$BRANCH\":"

# Updating repository
cd ..
echo "\nUpdating project repository..."
git fetch && git reset --hard && git clean -df && git checkout ${BRANCH} && git pull && git submodule init && git submodule update

echo "\nMaking bundle..."
rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}
meteor bundle ${BUILD_DIR}/${BUNDLE_NAME}.tar.gz

echo "\nUnpacking new Meteor Movies bundle..."
tar -xzf ${BUILD_DIR}/${BUNDLE_NAME}.tar.gz -C ${BUILD_DIR} 

echo "\nStopping Meteor Movies web-app..."
stop web-apps/meteor-movies || true

echo "\nUpdating Meteor Movies bundle..."
rm -rf ${DEPLOY_PATH}
mv ${BUILD_DIR}/bundle ${DEPLOY_PATH}
cd ${DEPLOY_PATH}/server
npm uninstall fibers
npm install fibers

echo "\nResetting database..."
cd ${SCRIPT_DIR}
cd ../db
mongo meteor-movies reset.js.mongo

echo "\nCleaning build directory..."
rm -rf ${BUILD_DIR}

echo "\nStarting Meteor Movies application..."
start web-apps/meteor-movies