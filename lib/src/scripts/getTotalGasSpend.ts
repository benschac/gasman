import {
  getFnTransactions,
  calculateGasSpendPerAddress,
  getMultisigTransactions,
} from '../helpers';

// async function main() {
//   const startblock = process.argv[2];
//   const endblock = process.argv[3];
//   if (!startblock) {
//     console.error("run failed. specify start block.");
//     process.exit(1);
//   }

//   const taptransactions = await gettaptransactions({ startblock, endblock });
//   const peeltaps = findpeeltransactions(taptransactions);
//   const multisigtransactions = await getmultisigtransactions({
//     startblock,
//     endblock,
//   });

//   const alltransactions = [...multisigtransactions, ...peeltaps];

//   console.log(`found ${alltransactions.length} transactions.`);

//   const gas = await calculategasspendperaddress(alltransactions);

//   console.log(gas);
// // // }

export const getTotalGasSpend = async (
  startblock: number,
  endblock: number
) => {
  if (!startblock) {
    console.error('Run failed. Specify start block.');
    process.exit(1);
  }

  const tapTransactions = await getFnTransactions({ startblock, endblock });
  const peelTaps = findPeelTransactions(tapTransactions);
  const multisigTransactions = await getMultisigTransactions({
    startblock,
    endblock,
  });

  const allTransactions = [...multisigTransactions, ...peelTaps];

  console.log(`Found ${allTransactions.length} transactions.`);
  const gas = await calculateGasSpendPerAddress(allTransactions);
  console.log(gas);
  return gas;
};

// main();
