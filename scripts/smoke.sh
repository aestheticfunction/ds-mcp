#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXAMPLE_DIR="$PROJECT_DIR/examples"
DSPACK_FILE="$EXAMPLE_DIR/shadcn-ui.dspack.json"
SERVER="$PROJECT_DIR/dist/index.js"

echo "=== ds-mcp smoke test ==="

# Step 1: Build
echo "[1/5] Building..."
cd "$PROJECT_DIR"
npm run build --silent

# Step 2: Download shadcn-ui example if not present
if [ ! -f "$DSPACK_FILE" ]; then
  echo "[2/5] Downloading shadcn-ui example dspack..."
  mkdir -p "$EXAMPLE_DIR"
  curl -sL "https://raw.githubusercontent.com/aestheticfunction/dspack/main/examples/shadcn-ui.dspack.json" \
    -o "$DSPACK_FILE"
else
  echo "[2/5] shadcn-ui example dspack already present"
fi

# Step 3: Send MCP messages and capture output
echo "[3/5] Sending MCP messages..."
OUTFILE=$(mktemp)
cleanup() {
  rm -f "$OUTFILE"
}
trap cleanup EXIT

INIT_MSG='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke-test","version":"0.1.0"}}}'

node "$SERVER" --dspack "$DSPACK_FILE" > "$OUTFILE" 2>/dev/null <<EOF &
$INIT_MSG
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get-component","arguments":{"id":"button"}}}
EOF
SERVER_PID=$!

sleep 2
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true

# Parse responses
LINES=$(wc -l < "$OUTFILE" | tr -d ' ')
echo "  Received $LINES response(s)"

if [ "$LINES" -lt 3 ]; then
  echo "FAIL: Expected at least 3 responses, got $LINES"
  cat "$OUTFILE"
  exit 1
fi

# Step 4: Validate initialize response
echo "[4/5] Validating initialize response..."
INIT_RESPONSE=$(sed -n '1p' "$OUTFILE")
if echo "$INIT_RESPONSE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  if (r.id !== 1 || !r.result?.serverInfo?.name) process.exit(1);
" 2>/dev/null; then
  echo "  OK: Initialize response valid"
else
  echo "FAIL: Invalid initialize response"
  echo "  $INIT_RESPONSE"
  exit 1
fi

# Step 5: Validate tools/list and get-component responses
echo "[5/5] Validating tool responses..."
TOOLS_RESPONSE=$(sed -n '2p' "$OUTFILE")
if echo "$TOOLS_RESPONSE" | node -e "
  const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const tools = r.result?.tools;
  if (!Array.isArray(tools) || tools.length !== 9) process.exit(1);
  const names = tools.map(t => t.name).sort();
  const expected = ['get-component','get-framework-mapping','get-layout','get-pattern','get-theme','get-token','list-antipatterns','list-components','search-tokens'];
  if (JSON.stringify(names) !== JSON.stringify(expected)) process.exit(1);
" 2>/dev/null; then
  echo "  OK: tools/list response valid (9 tools)"
else
  echo "FAIL: Invalid tools/list response"
  echo "  $TOOLS_RESPONSE"
  exit 1
fi

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
  exit 1
fi

echo ""
echo "=== All smoke tests passed ==="
