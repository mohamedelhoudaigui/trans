#!/bin/bash

# Function to expand (load and export) variables from a .env file
expand_env_file() {
    local env_file="$1"
    
    if [ ! -f "$env_file" ]; then
        echo "Error: .env file not found at $env_file"
        exit 1
    fi

    # Read the file line by line, skipping comments and empty lines
    while IFS= read -r line; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^\s*# ]]; then
            continue
        fi

        # Split the line into key and value, trimming whitespace
        key=$(echo "$line" | cut -d '=' -f 1 | tr -d '[:space:]')
        value=$(echo "$line" | cut -d '=' -f 2- | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/" | tr -d '[:space:]')

        # Export the variable, evaluating nested variables
        if [ -n "$key" ]; then
            # Use eval to expand nested variables, ensuring spaces are preserved
            eval "export $key=\"$value\""

            # echo "DEBUG: Exported $key=$value"
        fi
    done < <(grep -v '^#' "$env_file" | grep -v '^$')
}

# Import .env file, using the provided argument or default path
env_file="${1:-../../.env}"
expand_env_file "$env_file"

# Validate required environment variables
if [ -z "$PROJECT_PATH" ]; then
    echo "Error: PROJECT_PATH is not defined in the .env file."
    exit 1
fi

# Set DEVOPS_PATH and EXTERNAL_VOLUMES_PATH, trimming any whitespace
DEVOPS_PATH=$(echo "$PROJECT_PATH/devops" | tr -d '[:space:]')
EXTERNAL_VOLUMES_PATH=$(echo "$DEVOPS_PATH/external-volumes" | tr -d '[:space:]')

# Validate EXTERNAL_VOLUMES_PATH
if [ -z "$EXTERNAL_VOLUMES_PATH" ]; then
    echo "Error: EXTERNAL_VOLUMES_PATH could not be derived from PROJECT_PATH."
    exit 1
fi

# echo "DEBUG: PROJECT_PATH=$PROJECT_PATH"
# echo "DEBUG: DEVOPS_PATH=$DEVOPS_PATH"
# echo "DEBUG: EXTERNAL_VOLUMES_PATH=$EXTERNAL_VOLUMES_PATH"

DIRECTORIES=(
    "$EXTERNAL_VOLUMES_PATH/grafana"
    "$EXTERNAL_VOLUMES_PATH/prometheus"
    # "$EXTERNAL_VOLUMES_PATH/elasticsearch"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "Created directory: $dir"
    else
        echo "Directory already exists: $dir"
    fi
done
