import { Table } from "antd";
import React, { useState, useEffect } from "react";
import { useConnection } from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import "./trade.less";

import { getPriceWithTokenAddress } from '../../dashboard-api/hooks/getPriceWithTokenAddress'

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

  useEffect(() => {
    if (connected) {
      getTokenList(connection, wallet).then(async (tokens: any) => {
        for await (const token of tokens){
          let tokenStr:string = token.logoURI && token.logoURI.indexOf('mainnet') > 0 ?
            token.logoURI.substr(token.logoURI.indexOf('mainnet') + 8, token.logoURI.indexOf('/logo.png') - token.logoURI.indexOf('mainnet') - 8) :
            token.tokenAccountAddress;
          token.price = (await getPriceWithTokenAddress(tokenStr));
          token.value = token.price * token.balance;
        }

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
