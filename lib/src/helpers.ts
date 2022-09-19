import { utils, BigNumber } from "ethers";
import { listTransactions } from "./etherscan/api";


/**
 * (Block Base Fee Per Gas + MaxPriorityFee Per Gas) * Gas Used
 * @param {*} transaction
 * @returns
 */
const calculateTransactionGas = (transaction: any) => {
    return BigNumber.from(transaction.gasUsed).mul(transaction.gasPrice);
};

export const calculateGasSpendPerAddress = async (transactions: any) => {
    const gas = transactions.map((tx: any) => {
        const gasFeeGwei = calculateTransactionGas(tx);
        const gasFeeETH = utils.formatEther(gasFeeGwei);

        return {
            from: tx.from,
            hash: tx.hash,
            gasFeeGwei,
            gasFeeETH,
        };
    });

    const sumGas = gas.reduce((acc: any, tx: any) => {
        if (acc[tx.from] === undefined) {
            acc[tx.from] = tx.gasFeeGwei;
        } else {
            acc[tx.from] = acc[tx.from].add(tx.gasFeeGwei);
        }

        return acc;
    }, {});

    const formattedGas = Object.keys(sumGas).reduce((acc: any, addr) => {
        acc[addr] = utils.formatEther(sumGas[addr]);
        return acc;
    }, {});

    return formattedGas;
};

const decodeTransactionInputs = (tx: any, functionName: any, abi: string) => {
    const abiInterface = new utils.Interface(abi);
    const decodedData = abiInterface.decodeFunctionData(
        functionName,
        tx.input
    );

    return decodedData;
};

export const getTapTransactions = async ({ startblock = '0', endblock = '99999999', terminalAddress, terminalFuncName, abi }: {
    startblock: string;
    endblock: string;
    terminalAddress: string | undefined
    terminalFuncName: string | undefined
    abi: string
}) => {
    const transactions = await listTransactions(terminalAddress, {
        startblock,
        endblock,
    });

    const tapTransactions = transactions.data.result.filter((tx: any) =>
        tx.functionName.startsWith(terminalFuncName)
    );
    const transactionsDecoded = tapTransactions.map((tx: any) => {
        return {
            ...tx,
            decodedData: decodeTransactionInputs(tx, terminalFuncName, abi),
        };
    });

    return transactionsDecoded;
};

export const findPeelTransactions = ({ transactions, projectId, contributors }: {
    transactions: any
    projectId: number
    contributors: string[]
}) =>
    transactions.filter(
        (tx: any) =>
            tx.decodedData._projectId.toNumber() === projectId &&
            contributors.includes(utils.getAddress(tx.from))
    );

export const getMultisigTransactions = async ({ startblock = '0', endblock = '99999', MULTISIG_SAFE_ADDRESS = null }) => {

    if (!MULTISIG_SAFE_ADDRESS) {
        throw Error('need MULTISIGN_SAFE_ADDRESS')
    }

    const transactions = await listTransactions(MULTISIG_SAFE_ADDRESS, {
        startblock,
        endblock,
    });

    return transactions.data.result;
};
