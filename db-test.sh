#!/bin/bash

# test_db_extensive.sh (v1.1)
# Himothy Covenant FAAFO Extensive Test Suite for Database Integrity
# Axiom I: Unreasonable Goodness in Testing
# Axiom III: FAAFO Engineering - Pushing Limits

# --- Configuration ---
FASTIFY_HOST_PORT="${FASTIFY_HOST_PORT:-3000}"
BACKEND_API_URL="http://localhost:${FASTIFY_HOST_PORT}/api"
PROJECT_NAME="${PROJECT_NAME:-Transcendence}"
MANAGE_STACK_LIFECYCLE="${MANAGE_STACK_LIFECYCLE:-true}"

# --- Test User Data ---
generate_unique_suffix() { date +%s%N | cut -b1-13; }

USER_A_SUFFIX=$(generate_unique_suffix)
USER_A_NAME="UserA_${USER_A_SUFFIX}"
USER_A_EMAIL="${USER_A_NAME}@chimera.local"
USER_A_PASS="PassA123$"
USER_A_AVATAR="http://example.com/avatarA.png"
USER_A_ID=""
USER_A_ACCESS_TOKEN=""
USER_A_REFRESH_TOKEN=""
USER_A_2FA_SECRET_ASCII=""

USER_B_SUFFIX=$(generate_unique_suffix)
USER_B_NAME="UserB_${USER_B_SUFFIX}"
USER_B_EMAIL="${USER_B_NAME}@chimera.local"
USER_B_PASS="PassB123$"
USER_B_AVATAR="http://example.com/avatarB.png"
USER_B_ID=""

# --- Colors ---
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
TEST_FAILURES=0

# --- Helper Functions ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; TEST_FAILURES=$((TEST_FAILURES + 1)); }
log_suite_result() {
    if [ "$TEST_FAILURES" -eq 0 ]; then log_success "=== ALL HIMOTHY EXTENSIVE DB TESTS PASSED ==="; else log_error "=== HIMOTHY EXTENSIVE DB TESTS COMPLETED WITH $TEST_FAILURES FAILURE(S) ==="; fi
    if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then log_info "Bringing down the stack post-test..."; make down > /dev/null 2>&1 || true; fi
    exit "$TEST_FAILURES"
}
make_target() {
    if [[ "$MANAGE_STACK_LIFECYCLE" != "true" ]]; then log_info "Skipping 'make $1'"; return 0; fi
    log_info "Running 'make $1'..."; if ! make "$1"; then log_error "'make $1' failed."; log_suite_result; fi
}

_curl_request() {
    local method="$1" url="$2" data_payload="$3" auth_token="$4"
    local temp_curl_stderr temp_response_body http_status_code curl_exit_code headers curl_cmd_args

    temp_curl_stderr=$(mktemp)
    temp_response_body=$(mktemp)
    headers=(-H "Content-Type: application/json")
    [[ -n "$auth_token" ]] && headers+=(-H "Authorization: Bearer ${auth_token}")

    curl_cmd_args=(-s -o "$temp_response_body" -w "%{http_code}" -X "${method}")
    curl_cmd_args+=("${headers[@]}")
    [[ -n "$data_payload" ]] && curl_cmd_args+=(-d "${data_payload}")
    curl_cmd_args+=("${url}")

    http_status_code=$(curl "${curl_cmd_args[@]}" 2>"$temp_curl_stderr")
    curl_exit_code=$?
    
    local response_body_content
    response_body_content=$(cat "$temp_response_body")
    local curl_stderr_content
    curl_stderr_content=$(cat "$temp_curl_stderr")

    rm "$temp_response_body" "$temp_curl_stderr"

    if [[ $curl_exit_code -ne 0 ]]; then
        log_error "Curl command failed for URL ${url}. Exit: ${curl_exit_code}. Stderr: ${curl_stderr_content}"
        echo "CURL_COMMAND_FAILED"
        return
    fi
    echo "$http_status_code|$response_body_content"
}

curl_test() {
    local method="$1" url="$2" data_payload="$3" test_name="$4" expected_status="$5" auth_token="$6"
    local jq_check_path="$7" jq_expected_value="$8"
    local result http_status_code response_body actual_value

    log_info "TEST: ${test_name}"
    log_info "  => ${method} ${url}"
    [[ -n "$data_payload" ]] && log_info "  => DATA: ${data_payload}"
    [[ -n "$auth_token" ]] && log_info "  => AUTH: Bearer token used"

    result=$(_curl_request "$method" "$url" "$data_payload" "$auth_token")
    if [[ "$result" == "CURL_COMMAND_FAILED" ]]; then log_error "${test_name} FAILED (curl error)."; return 1; fi

    http_status_code=$(echo "$result" | cut -d'|' -f1)
    response_body=$(echo "$result" | cut -d'|' -f2-)

    log_info "  <= STATUS: ${http_status_code}"
    log_info "  <= BODY (first 300): ${response_body:0:300}"

    if [[ "$http_status_code" -ne "$expected_status" ]]; then
        log_error "${test_name} FAILED. Exp status ${expected_status}, got ${http_status_code}."
        return 1
    fi

    if [[ -n "$jq_check_path" && -n "$jq_expected_value" ]]; then
        if ! command -v jq &> /dev/null; then log_warning "jq not found. Skip JSON val for '${test_name}'."; else
            if [[ -z "$response_body" ]]; then log_error "${test_name} FAILED JSON val. Response body is empty."; return 1; fi
            actual_value=$(echo "$response_body" | jq -r "$jq_check_path" 2>/dev/null)
            local jq_exit_code=$?
            if [[ $jq_exit_code -ne 0 ]]; then log_error "${test_name} FAILED JSON val. jq error ($jq_exit_code) parsing: $response_body"; return 1; fi
            if [[ "$actual_value" != "$jq_expected_value" ]]; then
                log_error "${test_name} FAILED JSON val. Exp $jq_check_path='$jq_expected_value', got '$actual_value'."
                return 1
            fi
        fi
    fi
    log_success "${test_name} PASSED."
    echo "$response_body" # Return body
    return 0
}

# --- JQ & oathtool Check ---
[[ ! $(command -v jq) ]] && log_warning "jq command not found. JSON parsing limited."
[[ ! $(command -v oathtool) ]] && log_warning "oathtool command not found. 2FA tests involving OTP generation will be skipped."

# --- Main Test ---
log_info "=== HIMOTHY EXTENSIVE DB & BACKEND FAAFO TEST SUITE (v1.1) ==="
# Phase 0: Env Check
log_info "--- PHASE 0: ENV CHECK ---"
# ... (DB_PATH check - assumed correct from previous run, keep it)
if [[ ! -f "backend/.env" ]]; then log_error "backend/.env not found."; log_suite_result; fi
ACTIVE_DB_PATH_LINE=$(grep -v '^[[:space:]]*#' backend/.env | grep "DB_PATH=")
EXPECTED_DB_PATH="DB_PATH=/dbdata/database.db"
if [[ "$ACTIVE_DB_PATH_LINE" == *"$EXPECTED_DB_PATH"* ]]; then log_success "DB_PATH OK."; else log_error "DB_PATH not OK. Expected: '$EXPECTED_DB_PATH', Found: '$ACTIVE_DB_PATH_LINE'."; log_suite_result; fi


# Phase 1: Stack Ignition
if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then
    log_info "--- PHASE 1: STACK IGNITION ---"
    make_target "down"; log_info "Pruning ${PROJECT_NAME}_sqlite_data..."; docker volume rm "${PROJECT_NAME}_sqlite_data" > /dev/null 2>&1 || true
    make_target "build"; make_target "up"; log_info "Wait 15s for init..."; sleep 15
else
    log_info "--- PHASE 1: STACK CHECK (Assumed Running) ---"
    if ! curl -s --head --fail "${BACKEND_API_URL}/users" > /dev/null; then log_error "Backend unreachable."; log_suite_result; fi
    log_success "Backend reachable."
fi

# --- User Management ---
log_info "--- USER MGMT ---"
USER_A_PAYLOAD="{\"name\": \"${USER_A_NAME}\", \"email\": \"${USER_A_EMAIL}\", \"password\": \"${USER_A_PASS}\", \"avatar\": \"${USER_A_AVATAR}\"}"
RESPONSE_A=$(curl_test "POST" "${BACKEND_API_URL}/users" "$USER_A_PAYLOAD" "Create User A" 200 ".success" "true")
if [[ $? -ne 0 ]]; then log_suite_result; fi # Exit if base user creation fails
if command -v jq &> /dev/null && [[ -n "$RESPONSE_A" ]]; then # Try to get User A ID
    USER_A_ID_CANDIDATE=$(echo "$RESPONSE_A" | jq -r ".result.id // empty") # Assuming your create returns the new ID
    if [[ -z "$USER_A_ID_CANDIDATE" || "$USER_A_ID_CANDIDATE" == "null" ]]; then # Fallback if not in response
       TEMP_USER_LIST_A=$(curl -s "${BACKEND_API_URL}/users")
       USER_A_ID=$(echo "$TEMP_USER_LIST_A" | jq -r --arg EMAIL "$USER_A_EMAIL" '.result[] | select(.email==$EMAIL) | .id' 2>/dev/null)
    else
        USER_A_ID="$USER_A_ID_CANDIDATE"
    fi
    log_info "User A ID set to: ${USER_A_ID}"
    if [[ -z "$USER_A_ID" || "$USER_A_ID" == "null" ]]; then log_error "Failed to set User A ID."; USER_A_ID="UNKNOWN_A"; fi
else log_warning "Cannot determine User A ID (jq or response issue)."; USER_A_ID="UNKNOWN_A"; fi

USER_B_PAYLOAD="{\"name\": \"${USER_B_NAME}\", \"email\": \"${USER_B_EMAIL}\", \"password\": \"${USER_B_PASS}\", \"avatar\": \"${USER_B_AVATAR}\"}"
RESPONSE_B=$(curl_test "POST" "${BACKEND_API_URL}/users" "$USER_B_PAYLOAD" "Create User B" 200 ".success" "true")
if [[ $? -ne 0 ]]; then log_suite_result; fi
if command -v jq &> /dev/null && [[ -n "$RESPONSE_B" ]]; then
    USER_B_ID_CANDIDATE=$(echo "$RESPONSE_B" | jq -r ".result.id // empty")
    if [[ -z "$USER_B_ID_CANDIDATE" || "$USER_B_ID_CANDIDATE" == "null" ]]; then
        TEMP_USER_LIST_B=$(curl -s "${BACKEND_API_URL}/users")
        USER_B_ID=$(echo "$TEMP_USER_LIST_B" | jq -r --arg EMAIL "$USER_B_EMAIL" '.result[] | select(.email==$EMAIL) | .id' 2>/dev/null)
    else
        USER_B_ID="$USER_B_ID_CANDIDATE"
    fi
    log_info "User B ID set to: ${USER_B_ID}"
    if [[ -z "$USER_B_ID" || "$USER_B_ID" == "null" ]]; then log_error "Failed to set User B ID."; USER_B_ID="UNKNOWN_B"; fi
else log_warning "Cannot determine User B ID (jq or response issue)."; USER_B_ID="UNKNOWN_B"; fi


DUPLICATE_EMAIL_PAYLOAD="{\"name\": \"DuplicateUserE\", \"email\": \"${USER_A_EMAIL}\", \"password\": \"PassDup123$\", \"avatar\": \"http://example.com/dup.png\"}"
curl_test "POST" "${BACKEND_API_URL}/users" "$DUPLICATE_EMAIL_PAYLOAD" "Create Dup Email (User A)" 409 ".success" "false"

DUPLICATE_NAME_PAYLOAD="{\"name\": \"${USER_A_NAME}\", \"email\": \"dup_${USER_A_EMAIL}\", \"password\": \"PassDup123$\", \"avatar\": \"http://example.com/dup.png\"}"
curl_test "POST" "${BACKEND_API_URL}/users" "$DUPLICATE_NAME_PAYLOAD" "Create Dup Name (User A)" 409 ".success" "false"

# --- Auth & Token Tests ---
if [[ "$USER_A_ID" != "UNKNOWN_A" ]]; then
    log_info "--- AUTH & TOKEN (User A) ---"
    LOGIN_A_PAYLOAD="{\"email\": \"${USER_A_EMAIL}\", \"password\": \"${USER_A_PASS}\"}"
    LOGIN_RESPONSE_A=$(curl_test "POST" "${BACKEND_API_URL}/auth/login" "$LOGIN_A_PAYLOAD" "Login User A" 200 ".success" "true")
    if [[ $? -eq 0 && -n "$LOGIN_RESPONSE_A" ]] && command -v jq &> /dev/null; then
        USER_A_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE_A" | jq -r '.result.access_token // empty')
        USER_A_REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE_A" | jq -r '.result.refresh_token // empty')
        if [[ -n "$USER_A_ACCESS_TOKEN" && -n "$USER_A_REFRESH_TOKEN" ]]; then log_success "User A tokens extracted."; else log_error "Failed to extract tokens for User A."; fi
    elif [[ $? -ne 0 ]]; then log_warning "Login User A failed, skipping token extraction."; else log_warning "jq not found or login response empty; cannot extract tokens."; fi

    if [[ -n "$USER_A_REFRESH_TOKEN" ]]; then
        REFRESH_PAYLOAD="{\"refresh_token\": \"${USER_A_REFRESH_TOKEN}\"}"
        REFRESH_RESPONSE=$(curl_test "POST" "${BACKEND_API_URL}/auth/refresh" "$REFRESH_PAYLOAD" "Refresh User A Token" 200 ".success" "true")
        if [[ $? -eq 0 && -n "$REFRESH_RESPONSE" ]] && command -v jq &> /dev/null; then
            NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.result // empty') # Your refresh endpoint returns token directly in result
            if [[ -n "$NEW_ACCESS_TOKEN" && "$NEW_ACCESS_TOKEN" != "$USER_A_ACCESS_TOKEN" ]]; then
                log_success "Token refreshed for User A. New AT obtained."
                USER_A_ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
            else log_error "Failed to get new, different AT on refresh."; fi
        fi
        LOGOUT_PAYLOAD="{\"refresh_token\": \"${USER_A_REFRESH_TOKEN}\"}"
        curl_test "DELETE" "${BACKEND_API_URL}/auth/logout" "$LOGOUT_PAYLOAD" "Logout User A" 200 ".success" "true"
        curl_test "POST" "${BACKEND_API_URL}/auth/refresh" "$REFRESH_PAYLOAD" "Attempt Refresh Invalidated Token (User A)" 404 ".success" "false"
        USER_A_ACCESS_TOKEN=""
    fi
else log_warning "Skipping Auth tests (User A ID unknown)."; fi

# --- Friendship Tests ---
if [[ "$USER_A_ID" != "UNKNOWN_A" && "$USER_B_ID" != "UNKNOWN_B" && "$USER_A_ID" != "$USER_B_ID" ]]; then
    log_info "--- FRIENDSHIP (User A & B) ---"
    # Re-login User A if token was cleared or for safety
    if [[ -z "$USER_A_ACCESS_TOKEN" ]]; then
        LOGIN_A_PAYLOAD="{\"email\": \"${USER_A_EMAIL}\", \"password\": \"${USER_A_PASS}\"}"
        TEMP_LOGIN_RESP=$(curl -s -X POST -H "Content-Type: application/json" -d "$LOGIN_A_PAYLOAD" "${BACKEND_API_URL}/auth/login")
        if command -v jq &>/dev/null && [[ -n "$TEMP_LOGIN_RESP" ]]; then USER_A_ACCESS_TOKEN=$(echo "$TEMP_LOGIN_RESP" | jq -r '.result.access_token // empty'); fi
        if [[ -z "$USER_A_ACCESS_TOKEN" ]]; then log_warning "Could not re-login User A for friendship tests that might need auth."; fi
    fi
    # NOTE: Your current friendship routes don't seem to use JWT auth based on controller code.
    # If they did, pass USER_A_ACCESS_TOKEN to curl_test. For now, passing empty.
    ADD_FRIEND_PAYLOAD="{\"user_id\": ${USER_A_ID}, \"friend_id\": ${USER_B_ID}}"
    curl_test "POST" "${BACKEND_API_URL}/friend" "$ADD_FRIEND_PAYLOAD" "Add B as Friend to A" 200 "" ".success" "true"

    CHECK_FRIEND_A_PAYLOAD="{\"friend_id\": ${USER_B_ID}}"
    curl_test "POST" "${BACKEND_API_URL}/friend/${USER_A_ID}" "$CHECK_FRIEND_A_PAYLOAD" "Check A sees B" 200 "" ".success" "true"

    CHECK_FRIEND_B_PAYLOAD="{\"friend_id\": ${USER_A_ID}}"
    curl_test "POST" "${BACKEND_API_URL}/friend/${USER_B_ID}" "$CHECK_FRIEND_B_PAYLOAD" "Check B sees A" 200 "" ".success" "true"

    FRIENDS_A_RESPONSE=$(curl_test "GET" "${BACKEND_API_URL}/friend/${USER_A_ID}" "" "Get Friends of A" 200 "" ".success" "true")
    if [[ $? -eq 0 && -n "$FRIENDS_A_RESPONSE" ]] && command -v jq &> /dev/null; then
        if echo "$FRIENDS_A_RESPONSE" | jq -e --argjson IDB "$USER_B_ID" '.result[] | select(.id==$IDB)' > /dev/null; then log_success "User B in A's friend list."; else log_error "User B NOT in A's list."; fi
    fi

    REMOVE_FRIEND_PAYLOAD="{\"user_id\": ${USER_A_ID}, \"friend_id\": ${USER_B_ID}}"
    curl_test "DELETE" "${BACKEND_API_URL}/friend" "$REMOVE_FRIEND_PAYLOAD" "Remove Friend A-B" 200 "" ".success" "true"
    curl_test "POST" "${BACKEND_API_URL}/friend/${USER_A_ID}" "$CHECK_FRIEND_A_PAYLOAD" "Check A sees B (After Remove)" 404 "" ".success" "false"
else log_warning "Skipping Friendship tests (User IDs unknown/same)."; fi

# --- 2FA Tests ---
if [[ "$USER_A_ID" != "UNKNOWN_A" ]] && command -v oathtool &> /dev/null; then
    log_info "--- 2FA (User A) ---"
    # Ensure User A is logged in for 2FA setup
    if [[ -z "$USER_A_ACCESS_TOKEN" ]]; then
        LOGIN_A_PAYLOAD="{\"email\": \"${USER_A_EMAIL}\", \"password\": \"${USER_A_PASS}\"}"
        LOGIN_RESPONSE_A_FOR_2FA=$(curl_test "POST" "${BACKEND_API_URL}/auth/login" "$LOGIN_A_PAYLOAD" "Login User A (for 2FA)" 200 ".success" "true")
        if [[ $? -eq 0 && -n "$LOGIN_RESPONSE_A_FOR_2FA" ]] && command -v jq &> /dev/null; then
            USER_A_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE_A_FOR_2FA" | jq -r '.result.access_token // empty')
        fi
    fi

    if [[ -n "$USER_A_ACCESS_TOKEN" ]]; then
        SECRET_RESPONSE=$(curl_test "GET" "${BACKEND_API_URL}/auth/2fa_create" "" "Create 2FA Secret (User A)" 200 "$USER_A_ACCESS_TOKEN" ".success" "true")
        if [[ $? -eq 0 && -n "$SECRET_RESPONSE" ]] && command -v jq &> /dev/null; then
            USER_A_2FA_SECRET_ASCII=$(echo "$SECRET_RESPONSE" | jq -r '.result.ascii // empty')
            if [[ -n "$USER_A_2FA_SECRET_ASCII" ]]; then log_success "2FA ASCII extracted: ${USER_A_2FA_SECRET_ASCII}"; else log_error "Failed to extract 2FA ASCII."; fi
        fi

        if [[ -n "$USER_A_2FA_SECRET_ASCII" ]]; then
            CURRENT_TOTP_TOKEN=$(oathtool --totp -b "${USER_A_2FA_SECRET_ASCII}")
            log_info "Generated TOTP for User A: ${CURRENT_TOTP_TOKEN}"
            VERIFY_2FA_PAYLOAD="{\"token\": \"${CURRENT_TOTP_TOKEN}\"}"
            curl_test "POST" "${BACKEND_API_URL}/auth/2fa_verify" "$VERIFY_2FA_PAYLOAD" "Verify 2FA (User A)" 200 "$USER_A_ACCESS_TOKEN" ".success" "true"
            curl_test "POST" "${BACKEND_API_URL}/auth/2fa_verify" "$VERIFY_2FA_PAYLOAD" "Re-Verify 2FA (User A)" 409 "$USER_A_ACCESS_TOKEN" ".result" "2FA already verified"
        fi
        curl_test "DELETE" "${BACKEND_API_URL}/auth/2fa_delete" "" "Delete 2FA Secret (User A)" 200 "$USER_A_ACCESS_TOKEN" ".success" "true"
        curl_test "GET" "${BACKEND_API_URL}/auth/2fa_get" "" "Get Deleted 2FA Secret (User A)" 404 "$USER_A_ACCESS_TOKEN" ".success" "false"
    else log_warning "Skipping 2FA tests (User A AT not available)."; fi
elif [[ "$USER_A_ID" != "UNKNOWN_A" ]]; then log_warning "Skipping 2FA tests (oathtool not found)."; fi


# --- Final Data Persistence (if stack managed) ---
if [[ "$MANAGE_STACK_LIFECYCLE" == "true" ]]; then
    if [[ "$USER_A_ID" != "UNKNOWN_A" && "$USER_B_ID" != "UNKNOWN_B" ]]; then # Only if IDs are known
        log_info "--- FINAL DATA PERSISTENCE ---"
        make_target "down"; log_info "Wait 5s..."; sleep 5
        make_target "up"; log_info "Wait 15s for init..."; sleep 15
        curl_test "GET" "${BACKEND_API_URL}/users/${USER_A_ID}" "" "Check User A Persistence" 200 "" ".result.name" "${USER_A_NAME}"
        curl_test "GET" "${BACKEND_API_URL}/users/${USER_B_ID}" "" "Check User B Persistence" 200 "" ".result.name" "${USER_B_NAME}"
    else
        log_warning "Skipping final persistence check as User A or B ID is unknown."
    fi
fi

# --- Conclude ---
log_suite_result
