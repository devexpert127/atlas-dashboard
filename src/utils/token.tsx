import { Connection } from "@solana/web3.js";
import { programIds } from "./ids"
import { TokenAmount } from "./safe-math";
import { NATIVE_SOL } from "./token_list"
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';

const MainNetChainId = 101

const getKnownTokens = async () => {
  let tokens = await (new TokenListProvider()).resolve();
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
    tokenAccountAddress: NATIVE_SOL.mintAddress,
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
