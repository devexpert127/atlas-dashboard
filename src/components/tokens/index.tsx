import "./trade.less";
import { Table } from "antd";
import React, { useState, useEffect } from "react";
import { useConnection } from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import { 
  getPriceWithTokenAddress, 
  getPriceWithSymbol,
  getLPPrice 
} from "atlas-dashboard-apis"

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

export const TokenList = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const [token_list, setTokenList] = useState([]);

  useEffect(() => {
    if (connected) {
      getTokenList(connection, wallet).then(async (rawTokens: any) => {
        let tokens = rawTokens.map((token: any) => {
          token.tokenStr = token.logoURI && token.logoURI.indexOf('mainnet') > 0 ?
            token.logoURI.substr(token.logoURI.indexOf('mainnet') + 8, token.logoURI.indexOf('/logo.png') - token.logoURI.indexOf('mainnet') - 8) :
            token.tokenAccountAddress;
          token.realPrice = 0;
          token.price = '$' + token.realPrice.toFixed(6);
          return token;
        });

        const lpTokens = tokens.filter((token:any) => token.tags && token.tags.indexOf('lp-token') >= 0);
        const singleTokens = tokens.filter((token:any) => token.symbol && (!token.tags || (token.tags && token.tags.indexOf('lp-token') === -1)));

        let prices = [];
        
        for await (const token of singleTokens) {
          token.realPrice = (await getPriceWithTokenAddress(token.tokenStr));

          if (token.realPrice === 0) {
            token.realPrice = (await getPriceWithSymbol(token.symbol));
          }
          token.price = '$' + token.realPrice.toFixed(6);
          prices[token.symbol] = token.realPrice;
        }

        for await (const token of lpTokens) {
          const [totalSupply, coin, pc] = await getLPPrice(connection, token.tokenStr);
          let price = 0;
          price += prices[coin.symbol] * coin.balance.fixed(2);
          price += prices[pc.symbol] * pc.balance.fixed(2);

          token.realPrice = price / totalSupply;
          token.price = '$' + token.realPrice.toFixed(6);
        }

        tokens.forEach((token: any) => {
          // if (token.realPrice === 0)
            console.log(token);
          token.value = '$' + (token.realPrice * token.balance).toFixed(6);
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
