const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const serverPath = path.join(root, "tools", "french8_pronunciation_server_local.py");
const servicePath = path.join(root, "deploy", "jaralingua-pronunciation.service");

let server = fs.readFileSync(serverPath, "utf8");
server = server.replace(
  'MODEL_CACHE = ROOT / ".jaralingua-local" / "whisper"',
  'MODEL_CACHE = Path(os.environ.get("WHISPER_CACHE_DIR", str(ROOT / ".jaralingua-local" / "whisper")))'
);
if (!server.includes("WHISPER_CACHE_DIR")) throw new Error("Configurable Whisper cache was not installed.");
fs.writeFileSync(serverPath, server, "utf8");

let service = fs.readFileSync(servicePath, "utf8");
service = service.replace("Environment=HF_HOME=/var/cache/jaralingua-whisper", "Environment=HF_HOME=/var/cache/jaralingua-whisper\nEnvironment=WHISPER_CACHE_DIR=/var/cache/jaralingua-whisper");
fs.writeFileSync(servicePath, service, "utf8");
console.log("Production Whisper cache path aligned.");
