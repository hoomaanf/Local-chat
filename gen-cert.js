const { execSync } = require("child_process");
const fs = require("fs");

if (fs.existsSync("key.pem") && fs.existsSync("cert.pem")) {
  console.log("✅ Certificates already exist");
  process.exit(0);
}

try {
  execSync(
    'openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost" 2>/dev/null',
    { stdio: "pipe", timeout: 10000 },
  );
  console.log("✅ Certificates generated with openssl");
} catch (e) {
  console.log("⚠️ openssl failed, using self-signed...");

  const {
    generateKeyPairSync,
    createSign,
    X509Certificate,
  } = require("crypto");

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  fs.writeFileSync("key.pem", privateKey);

  const cert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJALz6s9bG2qMfMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEA0=-----END CERTIFICATE-----`;

  fs.writeFileSync("cert.pem", cert);
  console.log("✅ Self-signed certificates generated");
}
