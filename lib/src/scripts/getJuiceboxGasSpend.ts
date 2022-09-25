import {
    getTapTransactions,
    findPeelTransactions,
    calculateGasSpendPerAddress,
} from '../helpers'

export const getProjectGasSpend = async ({ startblock = '0', endblock = '999999999', terminalAddress = undefined, terminalFuncName = undefined, abi }: {
    startblock: string;
    endblock: string;
    terminalAddress: string | undefined
    terminalFuncName: unknown
    abi: unknown
}) => {
    if (!startblock) {
        console.error("Run failed. Specify start block.");
        return;
    }

    if (!terminalAddress) {
        console.error('specify terminal address')
        return;
    }

    if (!terminalFuncName) {
        console.error('specify terminal address')
        return;
    }

    if (!abi) {
        console.error('no abi')
        return
    }

    const tapTransactions = await getTapTransactions({ startblock, endblock, terminalAddress, terminalFuncName, abi });
    const peelTaps = findPeelTransactions(tapTransactions);
    console.log(`Found ${peelTaps.length} \`tap\` transactions.`);

    const gas = await calculateGasSpendPerAddress(peelTaps);
    return gas;
}
