import { HashRouter, Route } from "react-router-dom";
import React from "react";
import { ExchangeView } from "./components/exchange";
import { AccountsProvider } from "./dashboard-api/contexts/accounts";
import { MarketProvider } from "./dashboard-api/contexts/market";
import { ConnectionProvider } from "./dashboard-api/contexts/connection";
import { WalletProvider } from "./dashboard-api/contexts/wallet";

export function Routes() {
  // TODO: add simple view for sharing ...
  return (
    <>
      <HashRouter basename={"/"}>
        <ConnectionProvider>
          <WalletProvider>
            <AccountsProvider>
              <MarketProvider>
                <Route exact path="/" component={ExchangeView} />
              </MarketProvider>
            </AccountsProvider>
          </WalletProvider>
        </ConnectionProvider>
      </HashRouter>
    </>
  );
}
