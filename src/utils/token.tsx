import { Cluster, Connection } from "@solana/web3.js";
import { programIds } from "./ids"
import { TokenAmount } from "./safe-math";
import { NATIVE_SOL } from "./token_list"
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import { getPythProgramKeyForCluster, PythConnection } from "@pythnetwork/client";

const MainNetChainId = 101

const getKnownTokens = async () => {
  let tokens = await (new TokenListProvider()).resolve()
  const tokenList = tokens.filterByChainId(MainNetChainId).getList();//

  let tokenMap = tokenList.reduce((map: Map<string, TokenInfo>, item: TokenInfo) => {
    map.set(item.address, item);
    return map;
  }, new Map());

  // tokenMap.forEach((value)=>{
  //   if(value.tags?.indexOf('lp-token')== -1){
  //     console.log(value.name, "-->", value.symbol)
  //   }
  // })
  // console.log(tokenMap)
  return tokenMap
}
var KnownTokens: Map<string, TokenInfo>;

getKnownTokens().then((tokens) => {
  KnownTokens = tokens;
})

export const getTokenList: any = async (
  conn: Connection,
  wallet: any
) => {

  // const publicKey = new PublicKey(ORACLE_MAPPING_PUBLIC_KEY)

  // conn.getAccountInfo(publicKey).then((accountInfo) => {
  //   const { productAccountKeys } = parseMappingData(accountInfo?.data)
  //   conn.getAccountInfo(productAccountKeys[productAccountKeys.length - 1]).then((accountInfo) => {
  //     const { product, priceAccountKey } = parseProductData(accountInfo?.data)
  //     conn.getAccountInfo(priceAccountKey).then((accountInfo) => {
  //       const { price, confidence } = parsePriceData(accountInfo?.data)
  //       console.log(`${product.symbol}: $${price} \xB1$${confidence}`)
  //       // SRM/USD: $8.68725 ±$0.0131
  //     })
  //   })
  // })

  // const KnownTokens = Object.values(TOKENSBASE)
  // const KnownTokens = await getKnownTokens();

  let parsedTokenAccounts = await conn
    .getParsedTokenAccountsByOwner(
      wallet.publicKey,
      {
        programId: programIds().token
      },
      //   'confirmed'
    )
  const tokenAccounts: any = {}

  const solBalance = await conn.getBalance(wallet.publicKey, /*'confirmed'*/)
  tokenAccounts[NATIVE_SOL.mintAddress] = {
    tokenAccountAddress: wallet.publicKey.toBase58(),
    balance: new TokenAmount(solBalance, NATIVE_SOL.decimals).fixed(4),
    name: 'Solana',
    symbol: 'SOL',
    logoURI: KnownTokens.get('So11111111111111111111111111111111111111112')?.logoURI,
    tags: [],
    platform: '',
  }

  parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {

    const tokenAccountPubkey = tokenAccountInfo.pubkey
    const tokenAccountAddress = tokenAccountPubkey.toBase58()
    const parsedInfo = tokenAccountInfo.account.data.parsed.info
    if (parsedInfo.tokenAmount.amount === 0) {
      return;
    }
    const mintAddress = parsedInfo.mint
    const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals).fixed(4)

    tokenAccounts[mintAddress] = {
      tokenAccountAddress,
      balance,
      platform: ''
    }
  })

  Object.keys(tokenAccounts).forEach((mintAddress) => {
    const token = KnownTokens.get(mintAddress)
    if (token) {
      tokenAccounts[mintAddress].symbol = token.symbol
      tokenAccounts[mintAddress].logoURI = token.logoURI
      tokenAccounts[mintAddress].tags = token.tags
      tokenAccounts[mintAddress].name = token.name
      if (token.tags && token.tags.indexOf('lp-token') >= 0) {
        tokenAccounts[mintAddress].platform = tokenAccounts[mintAddress].name.split(' ')[0]
      }
      else {
        tokenAccounts[mintAddress].platform = ''
      }
    }
  })
  return Object.values(tokenAccounts).sort((a: any, b: any) => a.platform.localeCompare(b.platform));
}

const SOLANA_CLUSTER_NAME: Cluster = 'mainnet-beta';

export const getBalance: any = async (
  connection: Connection,
  token: any
) => {
  const pythConnection = new PythConnection(connection, getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME))

  let curPrice = 0;

  pythConnection.onPriceChange((product, price) => {
    const tokenName = product.description.substr(0, product.description.indexOf('/'));

    if (token.symbol === tokenName && price.price) {
      curPrice = price.price;
      pythConnection.stop();
    }
  });

  await pythConnection.start()
  console.log(curPrice);
  return curPrice;
};