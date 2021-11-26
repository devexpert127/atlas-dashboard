import React, { useEffect, useState } from "react";
import { Button, Card, Popover } from "antd";
import { TokenList } from "./tokens";

import { PoolAccounts } from "./pool/view";
import { useWallet } from "../utils/wallet";
import { AccountInfo } from "./accountInfo";
import { Settings } from "./settings";
import { SettingOutlined } from "@ant-design/icons";
import { useUserBalance } from '../dashboard-api/hooks/useUserBalance'
import { WRAPPED_SOL_MINT } from "../utils/ids";
import { useConnectionConfig } from '../dashboard-api/contexts/connection';
import { useMarkets } from '../dashboard-api/contexts/market';
import { formatUSD } from "../dashboard-api/utils/utils";

export const ExchangeView = () => {
  const { connected, wallet } = useWallet();
  const { marketEmitter, midPriceInUSD } = useMarkets();
  const { tokenMap } = useConnectionConfig();
  const SOL = useUserBalance(WRAPPED_SOL_MINT);

  const tabStyle: React.CSSProperties = { width: 120 };

  useEffect(() => {
    const refreshTotal = () => {};

    const dispose = marketEmitter.onMarket(() => {
      refreshTotal();
    });

    refreshTotal();

    return () => {
      dispose();
    };
  }, [marketEmitter, midPriceInUSD, tokenMap]);
  
  const tabList = [
    {
      key: "tokens",
      tab: <div style={tabStyle}>Tokens</div>,
      render: () => {
        return <TokenList />;
      },
    }
  ];

  const [activeTab, setActiveTab] = useState(tabList[0].key);

  const TopBar = (
    <div className="App-Bar">
      <div className="App-Bar-left">
        <div className="App-logo" />
      </div>
      <div className="App-Bar-right">

        <AccountInfo />
        {connected && (
          <Popover
            placement="bottomRight"
            content={<PoolAccounts />}
            trigger="click"
          >
            <Button type="text">My Pools</Button>
          </Popover>
        )}
        <div>
          {!connected && (
            <Button
              type="text"
              size="large"
              onClick={connected ? wallet.disconnect : wallet.connect}
              style={{ color: "#2abdd2" }}
            >
              Connect
            </Button>
          )}
          {connected && (
            <Popover
              placement="bottomRight"
              title="Wallet public key"
              trigger="click"
            ></Popover>
          )}
        </div>
        {
          <Popover
            placement="topRight"
            title="Settings"
            content={<Settings />}
            trigger="click"
          >
            <Button
              shape="circle"
              size="large"
              type="text"
              icon={<SettingOutlined />}
            />
          </Popover>
        }
      </div>
    </div>
  );

  return (
    <>
      {TopBar}
      <Card
        className="exchange-card"
        headStyle={{ padding: 0 }}
        tabList={tabList}
        tabProps={{
          tabBarGutter: 0,
        }}
        activeTabKey={activeTab}
        onTabChange={(key) => {
          setActiveTab(key);
        }}
      >
        {tabList.find((t) => t.key === activeTab)?.render()}
      </Card>
    </>
  );
};
