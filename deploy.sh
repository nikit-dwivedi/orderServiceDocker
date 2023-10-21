#!/bin/bash

# Prompt the user for their Git username
# read -p "Enter your Git username: " git_username
# read -sp "Enter your Git password: " git_password
# echo


# Pull the latest code from the Git repository
echo "Pulling the latest code from the Git repository..."
git pull
echo "nikit-dwivedi"
echo "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"

# Build the Docker image from the Dockerfile in the current directory
echo "Building the Docker image..."
docker build -t orderservice .

# Stop and remove the old Docker container and image
echo "Stopping and removing the old Docker container and image..."
docker-compose down

# Run Docker Compose with the new image
echo "Running Docker Compose with the new image..."
docker-compose up -d

echo "Done!"