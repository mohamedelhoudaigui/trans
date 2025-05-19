#!/bin/bash

# test_backend_db.sh (v1.1)
# Himothy Covenant FAAFO Test Script for Backend & DB
# Axiom III: FAAFO Engineering (The "Test Protocol for Reality" Clause)
# Axiom V.D: Automate the Toil, Elevate the Thought

# --- Configuration ---
FASTIFY_HOST_PORT="${FASTIFY_HOST_PORT:-3000}"
BACKEND_API_URL="http://localhost:${FASTIFY_HOST_PORT}/api"
PROJECT_NAME="${PROJECT_NAME:-Transcendence}"

# --- Control Variables ---
# Set to "false" or "no" to skip stack lifecycle management (down/build/up)
MANAGE_STACK_LIFECYCLE="${MANAGE_STACK_LIFECYCLE:-true}" # Default to true

# --- Test User Data ---
TEST_USER_NAME="HimothyTestUser$(date +%s)"
TEST_USER_EMAIL="${TEST_USER_NAME}@chimera.local"
TEST_USER_PASS="TestPass123$"
TEST_USER_AVATAR="http://example.com/avatar.png"
USER_ID_TO_TEST=1

# --- Colors for Output ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Helper Functions ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

make_target() {
    if [[ "$MANAGE_STACK_LIFECYCLE" != "true" ]]; then
        log_info "Skipping 'make $1' (MANAGE_STACK_LIFECYCLE is not true)."
        return 0
    fi
    log_info "Running 'make $1'..."
    if ! make "$1"; then
        log_error "'make $1' failed. Aborting test script."
        exit 1 # Only exit if we are managing the stack
    fi
}

curl_test() {
    local method="$1"
    local url="$2"
    local data_payload="$3"
    local test_name="$4"
    local expected_status="${5:-200}"
    local curl_output_file
    local response_file

    curl_output_file=$(mktemp) # To capture curl's stderr for more detailed errors
    response_file=$(mktemp) # To capture the response body

    log_info "TEST: ${test_name}"
    log_info "  => ${method} ${url}"
    if [[ -n "$data_payload" ]]; then
        log_info "  => DATA: ${data_payload}"
    fi

    local http_status_code
    local curl_cmd_args=(-s -o "$response_file" -w "%{http_code}" -X "${method}")

    if [[ -n "$data_payload" ]]; then
        curl_cmd_args+=(-H "Content-Type: application/json" -d "${data_payload}")
    fi
    curl_cmd_args+=("${url}")

    # Execute curl and capture status code
    http_status_code=$(curl "${curl_cmd_args[@]}" 2>"$curl_output_file")
    local curl_exit_code=$?
    local curl_stderr
    curl_stderr=$(cat "$curl_output_file")

    local response_body
    response_body=$(cat "$response_file")
    rm "$response_file" "$curl_output_file"

    log_info "  <= STATUS: ${http_status_code}"
    log_info "  <= BODY (first 200 chars): ${response_body:0:200}${response_body:200:$((${#response_body}-200))}"

    if [[ $curl_exit_code -ne 0 ]]; then
        log_error "${test_name} FAILED. curl command failed with exit code ${curl_exit_code}."
        log_error "Curl stderr: ${curl_stderr}"
        return 1
    fi

    if [[ "$http_status_code" -ne "$expected_status" ]]; then
        log_error "${test_name} FAILED. Expected status ${expected_status}, got ${http_status_code}."
        return 1
    else
        log_success "${test_name} PASSED."
        return 0
    fi
}

# --- Main Test Execution ---

log_info "=== HIMOTHY BACKEND & DB FAAFO TEST SUITE (v1.1 - CODENAME: REDLINE_LIVE_FIRE) ==="

# Phase 0: Environment Configuration Check
log_info "--- PHASE 0: ENVIRONMENT CONFIGURATION CHECK ---"
if [[ ! -f "backend/.env" ]]; then
    log_error "backend/.env file not found. This is critical for DB_PATH. Aborting."
    exit 1
fi

# More robust check for DB_PATH: find the active (non-commented) DB_PATH line
ACTIVE_DB_PATH_LINE=$(grep -v '^[[:space:]]*#' backend/.env | grep "DB_PATH=")
EXPECTED_DB_PATH="DB_PATH=/dbdata/database.db"

if [[ "$ACTIVE_DB_PATH_LINE" == *"$EXPECTED_DB_PATH"* ]]; then
    log_success "DB_PATH in backend/.env is correctly set to '/dbdata/database.db'."
else
    log_error "DB_PATH in backend/.env is not correctly set to '/dbdata/database.db'."
    log_error "  Expected to find: '${EXPECTED_DB_PATH}'"
    log_error "  Found active line: '${ACTIVE_DB_PATH_LINE}'"
    log_error "Please ensure the active DB_PATH line in backend/.env is exactly '${EXPECTED_DB_PATH}'."
    exit 1
fi

if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then
    log_info "Stack lifecycle management is ENABLED."
    # Phase 1: Ignition and Initial System Check
    log_info "--- PHASE 1: IGNITION & SYSTEM CHECK (Lifecycle Managed) ---"
    make_target "down"
    make_target "build"
    make_target "up"
    log_info "Waiting for backend service to initialize (10 seconds)..."
    sleep 10
else
    log_warning "Stack lifecycle management is DISABLED. Assuming stack is already running."
    log_info "--- PHASE 1: SYSTEM CHECK (Stack Assumed Running) ---"
    log_info "Attempting to connect to backend at ${BACKEND_API_URL}..."
    if ! curl -s --head --fail "${BACKEND_API_URL}/users" > /dev/null; then # Quick check with /users
        log_error "Cannot connect to backend at ${BACKEND_API_URL}/users. Is the stack running and backend accessible?"
        log_error "If MANAGE_STACK_LIFECYCLE=false, ensure services are up before running the script."
        exit 1
    else
        log_success "Successfully connected to a service at ${BACKEND_API_URL}/users."
    fi
fi


log_info "Checking backend logs for startup and DB init messages..."
if [[ "$MANAGE_STACK_LIFECYCLE" == "true" || $(docker-compose ps -q backend 2>/dev/null) ]]; then # Check logs if we managed or if backend container exists
    # Using docker-compose logs directly
    BACKEND_LOGS=$(docker-compose logs --tail="50" backend) # Get recent logs
    if ! echo "${BACKEND_LOGS}" | grep -q "Server listening"; then
        log_warning "Backend server startup message not found in recent logs. (This might be okay if stack was already running for a while)"
    else
        log_success "Backend server startup message found in recent logs."
    fi
    if ! echo "${BACKEND_LOGS}" | grep -q "finished initing db..."; then
        log_warning "DB initialization message 'finished initing db...' not found in recent backend logs. (This might be okay if stack was already running for a while and DB was init'd long ago)"
    else
        log_success "DB initialization message found in recent logs."
    fi
else
    log_warning "Backend container not found or not managed by this script run; skipping log checks."
fi


# Phase 2: API Interaction & Database Functionality Test
log_info "--- PHASE 2: API INTERACTION & DB FUNCTIONALITY ---"
# Test 2.1: Create a Test User
USER_PAYLOAD="{\"name\": \"${TEST_USER_NAME}\", \"email\": \"${TEST_USER_EMAIL}\", \"password\": \"${TEST_USER_PASS}\", \"avatar\": \"${TEST_USER_AVATAR}\"}"
curl_test "POST" "${BACKEND_API_URL}/users" "${USER_PAYLOAD}" "Create Test User" 200 || exit 1

# Test 2.2: Retrieve All Users
curl_test "GET" "${BACKEND_API_URL}/users" "" "Retrieve All Users" 200 || exit 1

# Test 2.3: Retrieve Specific User by ID
# If user creation returned an ID, we'd use it. For now, using a placeholder.
# This part needs to be more robust by parsing the actual ID from the creation step.
log_warning "Attempting to retrieve user with ID ${USER_ID_TO_TEST}. This assumes sequential ID assignment."
# First, let's try to get the ID of the user we just created
CREATED_USER_ID=$(curl -s "${BACKEND_API_URL}/users" | jq -r --arg NAME "$TEST_USER_NAME" '.result[] | select(.name==$NAME) | .id' 2>/dev/null)

if [[ -n "$CREATED_USER_ID" && "$CREATED_USER_ID" != "null" ]]; then
    log_info "Found ID for ${TEST_USER_NAME}: ${CREATED_USER_ID}"
    USER_ID_TO_TEST=$CREATED_USER_ID
else
    log_warning "Could not dynamically determine ID for ${TEST_USER_NAME}. Falling back to ID ${USER_ID_TO_TEST}. (jq might be needed or user not found immediately)"
fi
curl_test "GET" "${BACKEND_API_URL}/users/${USER_ID_TO_TEST}" "" "Retrieve Specific User (ID: ${USER_ID_TO_TEST})" 200


if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then
    # Phase 3: Data Persistence Test (Only meaningful if we control the lifecycle)
    log_info "--- PHASE 3: DATA PERSISTENCE TEST (Lifecycle Managed) ---"
    make_target "down"
    log_info "Services stopped. Waiting 5 seconds..."
    sleep 5
    make_target "up"
    log_info "Services restarted. Waiting for backend service to re-initialize (10 seconds)..."
    sleep 10

    # Test 3.1: Verify Data Persistence (Retrieve All Users Again)
    log_info "Verifying user data persistence after restart..."
    RAW_USER_LIST_AFTER_RESTART=$(curl -s "${BACKEND_API_URL}/users")
    if echo "${RAW_USER_LIST_AFTER_RESTART}" | jq -e --arg NAME "$TEST_USER_NAME" '.result[] | select(.name==$NAME)' > /dev/null 2>&1; then
        log_success "User '${TEST_USER_NAME}' found after restart. Data persistence confirmed."
    else
        log_error "User '${TEST_USER_NAME}' NOT found after restart. Data persistence FAILED."
        log_info "Response: ${RAW_USER_LIST_AFTER_RESTART}"
    fi
else
    log_info "--- PHASE 3: DATA PERSISTENCE TEST (Skipped: MANAGE_STACK_LIFECYCLE is false) ---"
fi


# Phase 4: Direct Database Volume Inspection (Manual Step if needed, or container exec)
log_info "--- PHASE 4: DIRECT DB VOLUME INSPECTION (Optional) ---"
log_info "To manually inspect the DB in the container:"
log_info "  1. Run: docker-compose exec backend sh  (or make it backend)"
log_info "  2. Inside container: apk update && apk add --no-cache sqlite"
log_info "  3. Inside container: sqlite3 /dbdata/database.db"
log_info "  4. SQLite prompt: .tables OR SELECT * FROM users;"


if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then
    # Phase 5: Cleanup (Only if we managed the stack)
    log_info "--- PHASE 5: CLEANUP (Lifecycle Managed) ---"
    make_target "down"
fi

log_success "Test script completed. Review logs for any errors or warnings."
log_info "=== HIMOTHY FAAFO TEST SUITE CONCLUDED ==="

exit 0
