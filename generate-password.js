const bcrypt = require('bcrypt');

async function main() {
  const hash = await bcrypt.hash('Manager12', 10);
  console.log(hash);
}

main();