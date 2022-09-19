// require("dotenv").config();

const {
  getTapTransactions,
  findPeelTransactions,
  calculateGasSpendPerAddress,
} = require("../helpers");

// async function main() {
//   const startblock = process.argv[2];
//   if (!startblock) {
    // console.error("Run failed. Specify start block.");
    // process.exit(1);
//   }

//   const tapTransactions = await getTapTransactions({ startblock });
//   const peelTaps = findPeelTransactions(tapTransactions);
//   console.log(`Found ${peelTaps.length} \`tap\` transactions.`);

//   const gas = await calculateGasSpendPerAddress(peelTaps);

//   console.log(gas);
// }

export const getJuiceboxGasSpend = async (startblock: number) => {
  if (!startblock) {
    console.error("Run failed. Specify start block.");
  }

  const tapTransactions = await getTapTransactions({ startblock });
  const peelTaps = findPeelTransactions(tapTransactions);
  console.log(`Found ${peelTaps.length} \`tap\` transactions.`);

  const gas = await calculateGasSpendPerAddress(peelTaps);
  return gas;
}

// main();
