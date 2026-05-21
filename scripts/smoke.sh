#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXAMPLE_DIR="$PROJECT_DIR/examples"
DSPACK_FILE="$EXAMPLE_DIR/shadcn-ui.dspack.json"
SERVER="$PROJECT_DIR/dist/index.js"

echo "=== ds-mcp smoke test ==="

# Step 1: Build
echo "[1/7] Building..."
cd "$PROJECT_DIR"
npm run build --silent

# Step 2: Download shadcn-ui example if not present
if [ ! -f "$DSPACK_FILE" ]; then
  echo "[2/7] Downloading shadcn-ui example dspack..."
  mkdir -p "$EXAMPLE_DIR"
  curl -sL "https://raw.githubusercontent.com/aestheticfunction/dspack/main/examples/shadcn-ui.dspack.json" \
    -o "$DSPACK_FILE"
else
  echo "[2/7] shadcn-ui example dspack already present"
fi

# Step 3: Start the server in background
echo "[3/7] Starting ds-mcp server..."
FIFO=$(mktemp -u)
mkfifo "$FIFO"
exec 3<>"$FIFO"
rm "$FIFO"

node "$SERVER" --dspack "$DSPACK_FILE" <&3 &
SERVER_PID=$!

cleanup() {
  exec 3>&-
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 1

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "FAIL: Server did not start"
  exit 1
fi

# Helper to send a message and read response
send_and_read() {
  local msg="$1"
  local label="$2"
  echo "$msg" >&3
  sleep 1
  # Read available output from the server's stdout
  local response
  response=$(timeout 3 head -n 1 /proc/$SERVER_PID/fd/1 2>/dev/null || true)
  echo "$response"
}

# Step 4: Send initialize
echo "[4/7] Sending initialize..."
INIT_MSG='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke-test","version":"0.1.0"}}}'

# Use a temporary file to capture server output
OUTFILE=$(mktemp)
node "$SERVER" --dspack "$DSPACK_FILE" > "$OUTFILE" 2>/dev/null <<EOF &
$INIT_MSG
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get-component","arguments":{"id":"button"}}}
EOF
INLINE_PID=$!

sleep 2
kill "$INLINE_PID" 2>/dev/null || true
wait "$INLINE_PID" 2>/dev/null || true

# Kill the background server started earlier since we used a separate inline one
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true
trap - EXIT

# Parse responses
LINES=$(wc -l < "$OUTFILE" | tr -d ' ')
echo "  Received $LINES response(s)"

if [ "$LINES" -lt 3 ]; then
  echo "FAIL: Expected at least 3 responses, got $LINES"
  cat "$OUTFILE"
  rm -f "$OUTFILE"
  exit 1
fi

# Step 5: Validate initialize response
echo "[5/7] Validating initialize response..."
INIT_RESPONSE=$(sed -n '1p' "$OUTFILE")
if echo "$INIT_RESPONSE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  if (r.id !== 1 || !r.result?.serverInfo?.name) process.exit(1);
" 2>/dev/null; then
  echo "  OK: Initialize response valid"
else
  echo "FAIL: Invalid initialize response"
  echo "  $INIT_RESPONSE"
  rm -f "$OUTFILE"
  exit 1
fi

# Step 6: Validate tools/list response
echo "[6/7] Validating tools/list response..."
TOOLS_RESPONSE=$(sed -n '2p' "$OUTFILE")
if echo "$TOOLS_RESPONSE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const tools = r.result?.tools;
  if (!Array.isArray(tools) || tools.length !== 7) process.exit(1);
  const names = tools.map(t => t.name).sort();
  const expected = ['get-component','get-framework-mapping','get-pattern','get-token','list-antipatterns','list-components','search-tokens'];
  if (JSON.stringify(names) !== JSON.stringify(expected)) process.exit(1);
" 2>/dev/null; then
  echo "  OK: tools/list response valid (7 tools)"
else
  echo "FAIL: Invalid tools/list response"
  echo "  $TOOLS_RESPONSE"
  rm -f "$OUTFILE"
  exit 1
fi

# Step 7: Validate tools/call get-component response
echo "[7/7] Validating get-component response..."
CALL_RESPONSE=$(sed -n '3p' "$OUTFILE")
if echo "$CALL_RESPONSE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const content = r.result?.content;
  if (!Array.isArray(content) || content.length === 0) process.exit(1);
  const data = JSON.parse(content[0].text);
  if (data.name !== 'Button') process.exit(1);
" 2>/dev/null; then
  echo "  OK: get-component returned Button component"
else
  echo "FAIL: Invalid get-component response"
  echo "  $CALL_RESPONSE"
  rm -f "$OUTFILE"
  exit 1
fi

rm -f "$OUTFILE"
echo ""
echo "=== All smoke tests passed ==="
