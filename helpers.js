import TerminalV1_1 from "@jbx-protocol/contracts-v1/deployments/mainnet/TerminalV1_1.json";
import { utils, BigNumber } from "ethers";
import { listTransactions } from "./lib/etherscan/api";
import {
  MULTISIG_SAFE_ADDRESS,
  TAP_FUNCTION_NAME,
  PEEL_PROJECT_ID,
  PEEL_CONTRIBUTORS,
} from "./constants";

const TERMINAL_V1_1_INTERFACE = new utils.Interface(TerminalV1_1.abi);

/**
 * (Block Base Fee Per Gas + MaxPriorityFee Per Gas) * Gas Used
 * @param {*} transaction
 * @returns
 */
const calculateTransactionGas = (transaction) => {
  return BigNumber.from(transaction.gasUsed).mul(transaction.gasPrice);
};

export const calculateGasSpendPerAddress = async (transactions) => {
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

  const sumGas = gas.reduce((acc, tx) => {
    if (acc[tx.from] === undefined) {
      acc[tx.from] = tx.gasFeeGwei;
    } else {
      acc[tx.from] = acc[tx.from].add(tx.gasFeeGwei);
    }

    return acc;
  }, {});

  const formattedGas = Object.keys(sumGas).reduce((acc, addr) => {
    acc[addr] = utils.formatEther(sumGas[addr]);
    return acc;
  }, {});

  return formattedGas;
};

const decodeTransactionInputs = (tx, functionName) => {
  const decodedData = TERMINAL_V1_1_INTERFACE.decodeFunctionData(
    functionName,
    tx.input
  );

  return decodedData;
};

export const getTapTransactions = async ({ startblock, endblock } = {}) => {
  const transactions = await listTransactions(TerminalV1_1.address, {
    startblock,
    endblock,
  });

  const tapTransactions = transactions.data.result.filter((tx) =>
    tx.functionName.startsWith(TAP_FUNCTION_NAME)
  );
  const transactionsDecoded = tapTransactions.map((tx) => {
    return {
      ...tx,
      decodedData: decodeTransactionInputs(tx, TAP_FUNCTION_NAME),
    };
  });

  return transactionsDecoded;
};

export const findPeelTransactions = (transactions) =>
  transactions.filter(
    (tx) =>
      tx.decodedData._projectId.toNumber() === PEEL_PROJECT_ID &&
      PEEL_CONTRIBUTORS.includes(utils.getAddress(tx.from))
  );

export const getMultisigTransactions = async ({ startblock, endblock } = {}) => {
  const transactions = await listTransactions(MULTISIG_SAFE_ADDRESS, {
    startblock,
    endblock,
  });

  return transactions.data.result;
};
