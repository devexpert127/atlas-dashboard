import { Table } from "antd";
import React, { useState, useEffect } from "react";
import { useConnection } from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import { PythConnection, getPythProgramKeyForCluster } from "@pythnetwork/client";

import "./trade.less";
import { Cluster } from "@solana/web3.js";
import { getPrice } from "../../utils/liquidity";
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
const SOLANA_CLUSTER_NAME: Cluster = 'mainnet-beta';

export const TokenList = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const [token_list, setTokenList] = useState([]);
  useEffect(() => {
    if (connected) {

      

      getTokenList(connection, wallet).then((tokens: any) => {
        const pythConnection = new PythConnection(connection, getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME))
        pythConnection.onPriceChange((product, price) => {
          // sample output:
          // SRM/USD: $8.68725 ±$0.0131
          // console.log(product);
          const tokenName = product.description.substr(0, product.description.indexOf('/'));

          let allSet = true;
          tokens.forEach((token:any) => {
            if (token.symbol === tokenName && price.price && !token.price) {
              token.price = '$' + price.price.toFixed(2);
              token.value = '$' + (price.price * token.balance).toFixed(2);

              console.log(token.price);
              console.log(token.value);
              setTokenList(tokens);
            }

            if (!token.price) {
              allSet = false;
            }
          });

          if (allSet) {
            pythConnection.stop();
            setTokenList(tokens);
          }

        });

        // setTokenList(tokens);

        // Start listening for price change events.
        pythConnection.start()
      })

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
