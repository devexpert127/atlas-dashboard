import { Table } from "antd";
import React, { useState, useEffect } from "react";
import { useConnection } from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import "./trade.less";

import { WRAPPED_SOL_MINT } from "../../utils/ids";
import { useConnectionConfig } from '../../dashboard-api/contexts/connection'
import { useMarkets } from '../../dashboard-api/contexts/market'
import { useUserBalance } from '../../dashboard-api/hooks/useUserBalance'

const columns = [
  {
    title: "",
    key: "icon",
    dataIndex: "icon",
    width: 20,
    render: (text: string, token: any) => {

      return (<img src={token.logoURI} alt='token logo' width={20} height={20} />)
    }
  },
  {
    title: "Platform",
    key: "platform",
    dataIndex: "platform",
    width: 150,

  },
  {
    title: "Asset",
    key: "symbol",
    dataIndex: "symbol",
    width: 150,

  },
  {
    title: "Balance",
    key: "balance",
    dataIndex: "balance",
  },
  {
    title: "Price",
    key: "price",
    dataIndex: "price",
  },
  {
    title: "Value",
    key: "value",
    dataIndex: "value",
  },
]

// TODO:
// Compute price breakdown with/without fee
// Show slippage
// Show fee information

export const TokenList = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const [token_list, setTokenList] = useState([]);
  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();

  const SRM_ADDRESS = 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt';
  const SRM = useUserBalance(WRAPPED_SOL_MINT.toBase58());

  useEffect(() => {
    if (SRM.balanceInUSD > 0) {
    }

    if (connected) {
      getTokenList(connection, wallet).then((tokens: any) => {
        tokens.forEach(async (token: any) => {
          token.price = SRM.balanceInUSD;
          let tokenStr:string = token.logoURI && token.logoURI.indexOf('mainnet') > 0 ? token.logoURI.substr(token.logoURI.indexOf('mainnet') + 8, 43) : token.tokenAccountAddress;
          console.log(tokenStr);
          console.log(midPriceInUSD(tokenStr));
          // token.price = await getBalance(connection, token);
        });

        setTokenList(tokens);
      });
    }
  }, [setTokenList, connection, wallet, wallet.publicKey, connected])

  return (
    <>
      <div>
        <Table columns={columns} dataSource={token_list} loading={false} />
      </div>
    </>
  );
};
