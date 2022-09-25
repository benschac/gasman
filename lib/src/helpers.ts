import { utils, BigNumber } from 'ethers';
import { EthersNormalTxByAddress, listTransactions } from './etherscan/api';

/**
 * (Block Base Fee Per Gas + MaxPriorityFee Per Gas) * Gas Used
 * @param {*} transaction
 * @returns BigNumber
 */
const calculateTransactionGas = (transaction: EthersNormalTxByAddress) => {
  // todo - calculate this instead of using gasused
  //  (Block Base Fee Per Gas + MaxPriorityFee Per Gas) * Gas Used
  return BigNumber.from(transaction.gasUsed).mul(transaction.gasPrice);
};

export const calculateGasSpendPerAddress = (
  transactions: EthersNormalTxByAddress[]
) => {
  const gas = transactions.map((tx) => {
    const gasFeeGwei = calculateTransactionGas(tx);
    const gasFeeETH = utils.formatEther(gasFeeGwei);

    return {
      from: tx.from,
      hash: tx.hash,
      gasFeeGwei,
      gasFeeETH,
    };
  });

  type ReduceReturnType = Record<string, BigNumber>;

  const sumGas = gas.reduce<ReduceReturnType>((acc, tx) => {
    if (acc[tx.from] === undefined) {
      acc[tx.from] = tx.gasFeeGwei;
    } else {
      acc[tx.from] = acc[tx.from].add(tx.gasFeeGwei);
    }

    return acc;
  }, {});

  const formattedGas = Object.keys(sumGas).reduce<Record<string, string>>(
    (acc, addr) => {
      acc[addr] = utils.formatEther(sumGas[addr]);
      return acc;
    },
    {}
  );

  return formattedGas;
};

const decodeTransactionInputs = (
  tx: EthersNormalTxByAddress,
  functionName: string,
  // TODO - add abi type from wagmi abi lib
  abi: string
): utils.Result => {
  const abiInterface = new utils.Interface(abi);
  const decodedData = abiInterface.decodeFunctionData(functionName, tx.input);
  return decodedData;
};

export const getFnTransactions = async ({
  startblock = 0,
  endblock = 99999999,
  terminalAddress,
  terminalFuncName,
  abi,
}: {
  startblock: number;
  endblock: number;
  // Use wagmi abi lib to get this
  terminalAddress: string;
  terminalFuncName: string;
  abi: string;
}) => {
  const transactions = await listTransactions(terminalAddress, {
    startblock,
    endblock,
  });

  const tapTransactions = transactions.data.result.filter((tx) =>
    tx.functionName.startsWith(terminalFuncName)
  );

  const transactionsDecoded = tapTransactions.map((tx) => {
    return {
      ...tx,
      decodedData: decodeTransactionInputs(tx, terminalFuncName, abi),
    } as const;
  });

  return transactionsDecoded;
};

type TxDecoded = Awaited<ReturnType<typeof getFnTransactions>>;
export const findPeelTransactions = ({
  transactions,
  projectId,
  contributors,
}: {
  transactions: TxDecoded;
  projectId: number;
  contributors: string[];
}) =>
  transactions.filter(
    (tx) =>
      tx.decodedData._projectId.toNumber() === projectId &&
      contributors.includes(utils.getAddress(tx.from))
  );

export const getMultisigTransactions = async ({
  startblock = '0',
  endblock = '99999',
  MULTISIG_SAFE_ADDRESS = null,
}) => {
  if (!MULTISIG_SAFE_ADDRESS) {
    throw Error('need MULTISIGN_SAFE_ADDRESS');
  }

  const transactions = await listTransactions(MULTISIG_SAFE_ADDRESS, {
    startblock,
    endblock,
  });

  return transactions.data.result;
};
