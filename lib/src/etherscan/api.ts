import axios, { AxiosPromise } from 'axios';

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const baseURL = 'https://api.etherscan.io/api';
const axiosInstance = axios.create({
  baseURL,
});

export type EthersNormalTxByAddress = {
  blockNumber: number;
  timeStamp: number;
  hash: string;
  nonce: number;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
};

interface ListTransactions {
  status: string;
  message: string;
  result: EthersNormalTxByAddress[];
}
export const listTransactions = (
  contractAddress: string,
  { startblock, endblock } = { startblock: 0, endblock: 99999999 }
): AxiosPromise<ListTransactions> => {
  return axiosInstance.get('', {
    params: {
      module: 'account',
      action: 'txlist',
      address: contractAddress,
      startblock: `${startblock}`,
      endblock: `${endblock}`,
      page: '1',
      offset: '0',
      sort: 'desc',
      apikey: ETHERSCAN_API_KEY,
    },
  });
};
