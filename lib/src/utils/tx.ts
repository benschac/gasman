import { utils, BigNumber, Transaction } from 'ethers';
/**
 * (Block Base Fee Per Gas + MaxPriorityFee Per Gas) * Gas Used
 * @param {*} transaction
 * @returns
 */
export const calculateTransactionGas = (
  transaction: Transaction
): BigNumber | undefined => {
  if (transaction.gasPrice) {
    return BigNumber.from(transaction.gasUsed).mul(transaction.gasPrice);
  }

  return undefined;
};
