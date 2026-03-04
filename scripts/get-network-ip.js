const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
console.log(`\n🚀 Dev server will be accessible at:`);
console.log(`   Local:   http://localhost:3000`);
console.log(`   Network: http://${ip}:3000`);
console.log(`\nIf using HTTPS, visit https://${ip}:3000 (after setup)\n`);
