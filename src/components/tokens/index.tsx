import { Button, Spin, Table } from "antd";
import React, { useState, useEffect } from "react";
import {
  useConnection,
  useConnectionConfig,
  useSlippageConfig,
} from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import { LoadingOutlined } from "@ant-design/icons";
import { swap, usePoolForBasket } from "../../utils/pools";
import { notify } from "../../utils/notifications";
import { useCurrencyPairState } from "../../utils/currencyPair";

import "./trade.less";
const columns = [
    {
      title: "",
      key: "icon",
      dataIndex: "icon",
      width:20,
    },

    {
        title: "Asset",
        key: "asset",
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
  const [pendingTx, setPendingTx] = useState(false);
  const { A, B, setLastTypedAccount } = useCurrencyPairState();
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  const { slippage } = useSlippageConfig();
  const { env } = useConnectionConfig();
  const [token_list, setTokenList] = useState([]);
  useEffect(() => {
    if(connected){
      getTokenList(connection, wallet).then((tokens:any)=>{
        console.log(tokens)
        setTokenList(tokens)
      })
      
    }
  }, [setTokenList, connection, wallet, wallet.publicKey])
  
  return (
    <>
      <div>
        <Table columns={columns} dataSource={token_list} loading={false}/>
      </div>
    </>
  );
};
