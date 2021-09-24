import { AccountInfo, Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import {programIds} from "./ids"
import { TokenAmount } from "./safe-math";
import {NATIVE_SOL, TOKENSBASE, LP_TOKENSBASE} from "./token_list"
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import { parseMappingData, parsePriceData, parseProductData } from '@pythnetwork/client'

const MainNetChainId = 101

const getKnownTokens = async()=>{
  let tokens = await (new TokenListProvider()).resolve()
  const tokenList = tokens.filterByChainId(MainNetChainId).getList();//

  let tokenMap = tokenList.reduce((map:Map<string, TokenInfo>, item:TokenInfo) => {
    map.set(item.address, item);
    return map;
  },new Map());
  
  // tokenMap.forEach((value)=>{
  //   if(value.tags?.indexOf('lp-token')== -1){
  //     console.log(value.name, "-->", value.symbol)
  //   }
  // })
  // console.log(tokenMap)
  return tokenMap
}
var KnownTokens:Map<string, TokenInfo>  ;

getKnownTokens().then((tokens)=>{
  KnownTokens = tokens;
})

export const getTokenList:any = async(
    conn:Connection, 
    wallet:any
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
  
  const solBalance = await conn.getBalance(wallet.publicKey, /*'confirmed'*/ )
  tokenAccounts[NATIVE_SOL.mintAddress] = {
    tokenAccountAddress: wallet.publicKey.toBase58(),
    balance: new TokenAmount(solBalance, NATIVE_SOL.decimals).fixed(4),
    symbol: 'SOL',
    logoURI: KnownTokens.get('So11111111111111111111111111111111111111112')?.logoURI,
    tags:[]
  }

  parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {
    const tokenAccountPubkey = tokenAccountInfo.pubkey
    const tokenAccountAddress = tokenAccountPubkey.toBase58()
    const parsedInfo = tokenAccountInfo.account.data.parsed.info
    const mintAddress = parsedInfo.mint
    const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals).fixed(4)

    tokenAccounts[mintAddress] = {
        tokenAccountAddress,
        balance
      }
  })

  Object.keys(tokenAccounts).forEach((mintAddress) =>{
    // const token = KnownTokens.find((item) => item.mintAddress == mintAddress)
    const token = KnownTokens.get(mintAddress)
    if(token)
    {
      tokenAccounts[mintAddress].symbol = token.symbol
      tokenAccounts[mintAddress].logoURI = token.logoURI
      tokenAccounts[mintAddress].tags = token.tags
      tokenAccounts[mintAddress].name = token.name
    }
  })

  return Object.values(tokenAccounts)
}