import "./trade.less";
import { Table } from "antd";
import React, { useState, useEffect } from "react";
import { useConnection } from "../../utils/connection";
import { useWallet } from "../../utils/wallet";
import { getTokenList } from "../../utils/token";
import { getPriceWithTokenAddress } from "atlas-dashboard-apis"
import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { getAddressForWhat, LIQUIDITY_POOLS } from "../../utils/pools_liquidity";
import { publicKey, struct, u128, u64 } from "@project-serum/borsh";
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from "../../utils/layouts";
import { OpenOrders } from "@project-serum/serum";
import BigNumber from "bignumber.js";

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

// getMultipleAccounts
export async function getMultipleAccounts(
  connection: Connection,
  publicKeys: PublicKey[],
  commitment?: Commitment
): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
  const keys: PublicKey[][] = []
  let tempKeys: PublicKey[] = []

  publicKeys.forEach((k) => {
    if (tempKeys.length >= 100) {
      keys.push(tempKeys)
      tempKeys = []
    }
    tempKeys.push(k)
  })
  if (tempKeys.length > 0) {
    keys.push(tempKeys)
  }

  const accounts: Array<null | {
    executable: any
    owner: PublicKey
    lamports: any
    data: Buffer
  }> = []

  const resArray: { [key: number]: any } = {}
  await Promise.all(
    keys.map(async (key, index) => {
      const res = await connection.getMultipleAccountsInfo(key, commitment)
      resArray[index] = res
    })
  )

  Object.keys(resArray)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((itemIndex) => {
      const res = resArray[parseInt(itemIndex)]
      for (const account of res) {
        accounts.push(account)
      }
    })

  return accounts.map((account, idx) => {
    if (account === null) {
      return null
    }
    return {
      publicKey: publicKeys[idx],
      account
    }
  })
}

export const commitment: Commitment = 'confirmed'

export class TokenAmount {
  public wei: BigNumber

  public decimals: number
  public _decimals: BigNumber

  constructor(wei: number | string | BigNumber, decimals: number = 0, isWei = true) {
    this.decimals = decimals
    this._decimals = new BigNumber(10).exponentiatedBy(decimals)

    if (isWei) {
      this.wei = new BigNumber(wei)
    } else {
      this.wei = new BigNumber(wei).multipliedBy(this._decimals)
    }
  }

  toEther() {
    return this.wei.dividedBy(this._decimals)
  }

  toWei() {
    return this.wei
  }

  format() {
    const value = this.wei.dividedBy(this._decimals)
    return value.toFormat(value.isInteger() ? 0 : this.decimals)
  }

  fixed(decimals:number = this.decimals) {
    return this.wei.dividedBy(this._decimals).toFixed(decimals)
  }

  isNullOrZero() {
    return this.wei.isNaN() || this.wei.isZero()
  }
  // + plus
  // - minus
  // × multipliedBy
  // ÷ dividedBy
}

export const AMM_INFO_LAYOUT = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('fee'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('pnlRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlX'),
  u64('totalPnlY'),
  u64('systemDecimalsValue'),
  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('ammQuantities'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner')
])

export const AMM_INFO_LAYOUT_V3 = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('fee'),
  u64('min_separate'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('pnlRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlX'),
  u64('totalPnlY'),
  u64('poolTotalDepositPc'),
  u64('poolTotalDepositCoin'),
  u64('systemDecimalsValue'),
  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('ammQuantities'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner'),
  publicKey('srmTokenAccount')
])

const AMM_INFO_LAYOUT_V4 = struct([
  u64('status'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalsValue'),
  // Fees
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  // OutPutData
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlPc'),
  u64('totalPnlCoin'),
  u128('poolTotalDepositPc'),
  u128('poolTotalDepositCoin'),
  u128('swapCoinInAmount'),
  u128('swapPcOutAmount'),
  u64('swapCoin2PcFee'),
  u128('swapPcInAmount'),
  u128('swapCoinOutAmount'),
  u64('swapPc2CoinFee'),

  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner')
])

export const AMM_INFO_LAYOUT_STABLE = struct([
  u64('status'),
  publicKey('own_address'),
  u64('nonce'),
  u64('orderNum'),
  u64('depth'),
  u64('coinDecimals'),
  u64('pcDecimals'),
  u64('state'),
  u64('resetFlag'),
  u64('minSize'),
  u64('volMaxCutRatio'),
  u64('amountWaveRatio'),
  u64('coinLotSize'),
  u64('pcLotSize'),
  u64('minPriceMultiplier'),
  u64('maxPriceMultiplier'),
  u64('systemDecimalsValue'),

  u64('ammMaxPrice'),
  u64('ammMiddlePrice'),
  u64('ammPriceMultiplier'),

  // Fees
  u64('minSeparateNumerator'),
  u64('minSeparateDenominator'),
  u64('tradeFeeNumerator'),
  u64('tradeFeeDenominator'),
  u64('pnlNumerator'),
  u64('pnlDenominator'),
  u64('swapFeeNumerator'),
  u64('swapFeeDenominator'),
  // OutPutData
  u64('needTakePnlCoin'),
  u64('needTakePnlPc'),
  u64('totalPnlPc'),
  u64('totalPnlCoin'),
  u128('poolTotalDepositPc'),
  u128('poolTotalDepositCoin'),
  u128('swapCoinInAmount'),
  u128('swapPcOutAmount'),
  u128('swapPcInAmount'),
  u128('swapCoinOutAmount'),
  u64('swapPcFee'),
  u64('swapCoinFee'),

  publicKey('poolCoinTokenAccount'),
  publicKey('poolPcTokenAccount'),
  publicKey('coinMintAddress'),
  publicKey('pcMintAddress'),
  publicKey('lpMintAddress'),
  publicKey('ammOpenOrders'),
  publicKey('serumMarket'),
  publicKey('serumProgramId'),
  publicKey('ammTargetOrders'),
  publicKey('poolWithdrawQueue'),
  publicKey('poolTempLpTokenAccount'),
  publicKey('ammOwner'),
  publicKey('pnlOwner'),

  u128('currentK'),
  u128('padding1'),
  publicKey('padding2')
])

const getLPPrice = async (connection: Connection, tokenStr: string) => {
  const pool = LIQUIDITY_POOLS.find((pool) => pool.lp.mintAddress === tokenStr)
  const ammId = pool ? pool.ammId : '';
  console.log(pool);
  const accInfo = await connection.getAccountInfo(new PublicKey(ammId));
  let ammLayout: any;

  if (accInfo && accInfo.data) {
    ammLayout = AMM_INFO_LAYOUT_V4.decode(accInfo.data)

    const { poolCoinTokenAccount, poolPcTokenAccount, ammOpenOrders } = ammLayout
    const publicKeys = [] as any

    publicKeys.push(
      new PublicKey(poolCoinTokenAccount),
      new PublicKey(poolPcTokenAccount),
      new PublicKey(ammOpenOrders),
      new PublicKey(ammId),
      new PublicKey(tokenStr)
    )

    const curpool = LIQUIDITY_POOLS.find(v => v.ammId === ammId);
    ammLayout.coin = curpool?.coin;
    ammLayout.pc = curpool?.pc;
    ammLayout.lp = curpool?.lp;
    ammLayout.coin.balance = new TokenAmount(0, ammLayout.coinDecimals)
    ammLayout.pc.balance = new TokenAmount(0, ammLayout.pcDecimals)
    const multipleInfo = await getMultipleAccounts(connection, publicKeys, commitment)

    multipleInfo.forEach((info) => {
      if (info) {
        const address = info.publicKey.toBase58()
        const data = Buffer.from(info.account.data)

        const { key, lpMintAddress, version } = getAddressForWhat(address)

        if (key && lpMintAddress) {
          const poolInfo = ammLayout;

          switch (key) {
            case 'poolCoinTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data)
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(parsed.amount))

              break
            }
            case 'poolPcTokenAccount': {
              const parsed = ACCOUNT_LAYOUT.decode(data)

              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(parsed.amount))

              break
            }
            case 'ammOpenOrders': {
              const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(new PublicKey(poolInfo.serumProgramId))
              const parsed = OPEN_ORDERS_LAYOUT.decode(data)

              const { baseTokenTotal, quoteTokenTotal } = parsed
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(getBigNumber(baseTokenTotal))
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(getBigNumber(quoteTokenTotal))

              break
            }
            case 'ammId': {
              let parsed
              if (version === 2) {
                parsed = AMM_INFO_LAYOUT.decode(data)
              } else if (version === 3) {
                parsed = AMM_INFO_LAYOUT_V3.decode(data)
              } else {
                if (version === 5) {
                  parsed = AMM_INFO_LAYOUT_STABLE.decode(data)
                  poolInfo.currentK = getBigNumber(parsed.currentK)
                } else parsed = AMM_INFO_LAYOUT_V4.decode(data)

                const { swapFeeNumerator, swapFeeDenominator } = parsed
                poolInfo.fees = {
                  swapFeeNumerator: getBigNumber(swapFeeNumerator),
                  swapFeeDenominator: getBigNumber(swapFeeDenominator)
                }
              }

              const { status, needTakePnlCoin, needTakePnlPc } = parsed
              poolInfo.status = getBigNumber(status)
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(getBigNumber(needTakePnlCoin))
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(getBigNumber(needTakePnlPc))

              break
            }
            // getLpSupply
            case 'lpMintAddress': {
              const parsed = MINT_LAYOUT.decode(data)

              poolInfo.lp.totalSupply = new TokenAmount(getBigNumber(parsed.supply), poolInfo.lp.decimals)

              break
            }
          }
        }
      }
    })
  }

  if (ammLayout)
    return [ammLayout.lp.totalSupply.fixed(2), ammLayout.coin, ammLayout.pc];
  
  return [0, 0, 0];
}

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
            token.tokenAccountAddress
          return token;
        });

        const lpTokens = tokens.filter((token:any) => token.tags && token.tags.indexOf('lp-token') >= 0);
        const singleTokens = tokens.filter((token:any) => token.symbol && (!token.tags || (token.tags && token.tags.indexOf('lp-token') === -1)));

        let prices = [];
        
        for await (const token of singleTokens) {
          token.realPrice = (await getPriceWithTokenAddress(token.tokenStr));
          token.price = '$' + token.realPrice.toFixed(6);
          prices[token.symbol] = token.realPrice;

          if (token.price === 0)
            console.log(token);
        }

        for await (const token of lpTokens) {
          const [totalSupply, coin, pc] = await getLPPrice(connection, token.tokenStr);
          let price = 0;
          price += prices[coin.symbol] * coin.balance.fixed(2);
          price += prices[pc.symbol] * pc.balance.fixed(2);

          token.realPrice = price / totalSupply;
          token.price = '$' + token.realPrice.toFixed(6);
        }

        tokens.forEach((token: any) => token.value = '$' + (token.realPrice * token.balance).toFixed(6));
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
