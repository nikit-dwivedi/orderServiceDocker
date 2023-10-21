#!/bin/bash

# Prompt the user for their Git username
# read -p "Enter your Git username: " git_username
# read -sp "Enter your Git password: " git_password
# echo


# Pull the latest code from the Git repository
git pull "https://nikit-dwivedi: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@github.com/Jet/orderServiceDocker.git" main

# expect -c "
# spawn /usr/bin/git pull
# expect \"Username for 'https://github.com':\"
# send \"nikit-dwivedi\r\"
# expect \"Password for 'https://nikit-dwivedi@github.com':\"
# send \"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\r\"
# expect eof
# "
# Build the Docker image from the Dockerfile in the current directory
echo "______________________________________________________________________"
echo "Building the Docker image..."
echo "______________________________________________________________________"

docker build -t orderservice .



# Stop and remove the old Docker container and image
echo "______________________________________________________________________"
echo "Stopping and removing the old Docker container..."
echo "______________________________________________________________________"

docker-compose down

# Run Docker Compose with the new image
echo "______________________________________________________________________"
echo "Running Docker Compose with the new image..."
echo "______________________________________________________________________"
docker-compose up -d


# Remove Old Docker image
echo "______________________________________________________________________"
echo "Removing Old Docker image..."
echo "______________________________________________________________________"
docker rmi $(docker images -f "dangling=true" -q)


echo "______________________________________________________________________"
echo "Done!"
echo "______________________________________________________________________"
