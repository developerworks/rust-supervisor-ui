#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
WORKSPACE_ROOT="$(cd "${UI_ROOT}/.." && pwd)"
RELAY_CERT_DIR="${WORKSPACE_ROOT}/rust-supervisor-relay/examples/certs"
UI_CERT_DIR="${UI_ROOT}/tests/three-end/certs"
WORK_DIR="${UI_CERT_DIR}/work"

mkdir -p "${RELAY_CERT_DIR}" "${UI_CERT_DIR}" "${WORK_DIR}"

CA_KEY="${WORK_DIR}/operators-ca.key"
CA_CRT="${WORK_DIR}/operators-ca.crt"
RELAY_KEY="${WORK_DIR}/relay.key"
RELAY_CSR="${WORK_DIR}/relay.csr"
RELAY_CRT="${WORK_DIR}/relay.crt"
OPERATOR_KEY="${WORK_DIR}/operator.key"
OPERATOR_CSR="${WORK_DIR}/operator.csr"
OPERATOR_CRT="${WORK_DIR}/operator.crt"
OPERATOR_P12="${WORK_DIR}/operator.p12"
OPERATOR_BROWSER_P12="${WORK_DIR}/operator-browser.p12"
RELAY_EXT="${WORK_DIR}/relay.ext"
OPERATOR_EXT="${WORK_DIR}/operator.ext"

cat > "${RELAY_EXT}" <<'EOF'
subjectAltName = DNS:localhost,IP:127.0.0.1
extendedKeyUsage = serverAuth
keyUsage = digitalSignature,keyEncipherment
EOF

cat > "${OPERATOR_EXT}" <<'EOF'
extendedKeyUsage = clientAuth
keyUsage = digitalSignature,keyEncipherment
EOF

openssl genrsa -out "${CA_KEY}" 2048
openssl req -x509 -new -nodes -key "${CA_KEY}" -sha256 -days 30 \
  -subj "/CN=rust-supervisor local operator CA" \
  -out "${CA_CRT}"

openssl genrsa -out "${RELAY_KEY}" 2048
openssl req -new -key "${RELAY_KEY}" \
  -subj "/CN=localhost" \
  -out "${RELAY_CSR}"
openssl x509 -req -in "${RELAY_CSR}" -CA "${CA_CRT}" -CAkey "${CA_KEY}" -CAcreateserial \
  -out "${RELAY_CRT}" -days 30 -sha256 -extfile "${RELAY_EXT}"

openssl genrsa -out "${OPERATOR_KEY}" 2048
openssl req -new -key "${OPERATOR_KEY}" \
  -subj "/CN=rust-supervisor local operator" \
  -out "${OPERATOR_CSR}"
openssl x509 -req -in "${OPERATOR_CSR}" -CA "${CA_CRT}" -CAkey "${CA_KEY}" -CAcreateserial \
  -out "${OPERATOR_CRT}" -days 30 -sha256 -extfile "${OPERATOR_EXT}"

openssl pkcs12 -export -out "${OPERATOR_P12}" \
  -inkey "${OPERATOR_KEY}" \
  -in "${OPERATOR_CRT}" \
  -certfile "${CA_CRT}" \
  -passout pass:

openssl pkcs12 -export -legacy \
  -name "rust-supervisor local operator" \
  -caname "rust-supervisor local operator CA" \
  -out "${OPERATOR_BROWSER_P12}" \
  -inkey "${OPERATOR_KEY}" \
  -in "${OPERATOR_CRT}" \
  -certfile "${CA_CRT}" \
  -passout pass:rust-supervisor

cp "${RELAY_CRT}" "${RELAY_CERT_DIR}/relay.crt"
cp "${RELAY_KEY}" "${RELAY_CERT_DIR}/relay.key"
cp "${CA_CRT}" "${RELAY_CERT_DIR}/operators-ca.crt"
cp "${OPERATOR_CRT}" "${UI_CERT_DIR}/operator.crt"
cp "${OPERATOR_KEY}" "${UI_CERT_DIR}/operator.key"
cp "${OPERATOR_P12}" "${UI_CERT_DIR}/operator.p12"
cp "${OPERATOR_BROWSER_P12}" "${UI_CERT_DIR}/operator-browser.p12"
cp "${CA_CRT}" "${UI_CERT_DIR}/operators-ca.crt"

chmod 600 \
  "${RELAY_CERT_DIR}/relay.key" \
  "${UI_CERT_DIR}/operator.key" \
  "${UI_CERT_DIR}/operator.p12" \
  "${UI_CERT_DIR}/operator-browser.p12"

printf 'local mTLS certificates written to %s and %s\n' "${RELAY_CERT_DIR}" "${UI_CERT_DIR}"
