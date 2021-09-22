import { AccountInfo, Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import {programIds} from "./ids"
import { TokenAmount } from "./safe-math";
import {NATIVE_SOL, TOKENSBASE, LP_TOKENSBASE} from "./token_list"
const KnownTokens = Object.values(TOKENSBASE)
export const getTokenList:any = async(
    conn:Connection, 
    wallet:any
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
    
    const solBalance = await conn.getBalance(wallet.publicKey, /*'confirmed'*/ )
    tokenAccounts[NATIVE_SOL.mintAddress] = {
      tokenAccountAddress: wallet.publicKey.toBase58(),
      balance: new TokenAmount(solBalance, NATIVE_SOL.decimals).fixed(),
      symbol: 'SOL'
    }

    parsedTokenAccounts.value.forEach(async (tokenAccountInfo) => {
      const tokenAccountPubkey = tokenAccountInfo.pubkey
      const tokenAccountAddress = tokenAccountPubkey.toBase58()
      const parsedInfo = tokenAccountInfo.account.data.parsed.info
      const mintAddress = parsedInfo.mint
      const balance = new TokenAmount(parsedInfo.tokenAmount.amount, parsedInfo.tokenAmount.decimals).fixed()

      tokenAccounts[mintAddress] = {
          tokenAccountAddress,
          balance
        }
    })

    Object.keys(tokenAccounts).forEach((mintAddress) =>{
      const token = KnownTokens.find((item) => item.mintAddress == mintAddress)
      if(token)
      {
        tokenAccounts[mintAddress].symbol = token.symbol
      }
    })

    return Object.values(tokenAccounts)
}