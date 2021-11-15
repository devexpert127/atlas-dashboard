import { cloneDeep } from 'lodash'

// @ts-ignore
import SERUM_MARKETS from '@project-serum/serum/lib/markets.json'

import {
  LIQUIDITY_POOL_PROGRAM_ID_V2,
  LIQUIDITY_POOL_PROGRAM_ID_V3,
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V2,
  SERUM_PROGRAM_ID_V3
} from './ids'

import { LP_TOKENSBASE, NATIVE_SOL, TokenInfo, TOKENSBASE } from './token_list'

export interface LiquidityPoolInfo {
  name: string
  coin: TokenInfo
  pc: TokenInfo
  lp: TokenInfo

  version: number
  programId: string

  ammId: string
  ammAuthority: string
  ammOpenOrders: string
  ammTargetOrders: string
  ammQuantities: string

  poolCoinTokenAccount: string
  poolPcTokenAccount: string
  poolWithdrawQueue: string
  poolTempLpTokenAccount: string

  serumProgramId: string
  serumMarket: string
  serumBids?: string
  serumAsks?: string
  serumEventQueue?: string
  serumCoinVaultAccount: string
  serumPcVaultAccount: string
  serumVaultSigner: string

  official: boolean

  status?: number
  currentK?: number
}

/**
 * Get pool use two mint addresses

 * @param {string} coinMintAddress
 * @param {string} pcMintAddress

 * @returns {LiquidityPoolInfo | undefined} poolInfo
 */
export function getPoolByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string
): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      (pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
      (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)
  )

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getPoolListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
        [4, 5].includes(pool.version) &&
        pool.official
      ) {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
    } else {
      return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
    }
    return false
  })
  if (pool.length > 0) {
    return cloneDeep(pool)
  } else {
    return cloneDeep(
      LIQUIDITY_POOLS.filter((pool) => {
        if (coinMintAddress && pcMintAddress) {
          if (
            ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
              (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
            [4, 5].includes(pool.version)
          ) {
            return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
          }
        } else {
          return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
        }
        return false
      })
    )
  }
}

export function getLpMintByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  version = [3, 4, 5]
): string | null {
  const pool = LIQUIDITY_POOLS.find(
    (pool) =>
      ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
        (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
      version.includes(pool.version)
  )

  if (pool) {
    return pool.lp.mintAddress
  }

  return null
}

export function getLpListByTokenMintAddresses(
  coinMintAddress: string,
  pcMintAddress: string,
  ammIdOrMarket: string | undefined,
  version = [4, 5]
): LiquidityPoolInfo[] {
  const pool = LIQUIDITY_POOLS.filter((pool) => {
    if (coinMintAddress && pcMintAddress) {
      if (
        ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
          (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
        version.includes(pool.version) &&
        pool.official
      ) {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
    } else {
      return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
    }
    return false
  })
  if (pool.length > 0) {
    return pool
  } else {
    return LIQUIDITY_POOLS.filter((pool) => {
      if (coinMintAddress && pcMintAddress) {
        if (
          ((pool.coin.mintAddress === coinMintAddress && pool.pc.mintAddress === pcMintAddress) ||
            (pool.coin.mintAddress === pcMintAddress && pool.pc.mintAddress === coinMintAddress)) &&
          version.includes(pool.version)
        ) {
          return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
        }
      } else {
        return !(ammIdOrMarket !== undefined && pool.ammId !== ammIdOrMarket && pool.serumMarket !== ammIdOrMarket)
      }
      return false
    })
  }
}

export function getPoolByLpMintAddress(lpMintAddress: string): LiquidityPoolInfo | undefined {
  const pool = LIQUIDITY_POOLS.find((pool) => pool.lp.mintAddress === lpMintAddress)

  if (pool) {
    return cloneDeep(pool)
  }

  return pool
}

export function getAddressForWhat(address: string) {
  for (const pool of LIQUIDITY_POOLS) {
    for (const [key, value] of Object.entries(pool)) {
      if (key === 'lp') {
        if (value.mintAddress === address) {
          return { key: 'lpMintAddress', lpMintAddress: pool.lp.mintAddress, version: pool.version }
        }
      } else if (value === address) {
        return { key, lpMintAddress: pool.lp.mintAddress, version: pool.version }
      }
    }
  }

  return {}
}

export function isOfficalMarket(marketAddress: string) {
  for (const market of SERUM_MARKETS) {
    if (market.address === marketAddress && !market.deprecated) {
      return true
    }
  }

  for (const pool of LIQUIDITY_POOLS) {
    if (pool.serumMarket === marketAddress && pool.official === true) {
      return true
    }
  }

  return false
}

export const LIQUIDITY_POOLS: LiquidityPoolInfo[] = [
  {
    name: 'RAY-WUSDT',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.WUSDT },
    lp: { ...LP_TOKENSBASE['RAY-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '4GygMmZgSoyfM3DEBpA8HvB8pooKWnTp232bKA17ptMG',
    ammAuthority: 'E8ddPSxjVUdW8wa5rs3gbscqoXQF1o7sJrkUMFU18zMS',
    ammOpenOrders: 'Ht7CkowEPZ5yHQpQQhzhgnN8W7Dq3Gw96Z3Ph8f3tVpY',
    ammTargetOrders: '3FGv6AuhfsxPBsPz4dXRA629W7UF2rW3NjHaihxUNcrB',
    ammQuantities: 'EwL1kwav5Z9dGrppUvusjPA4iJ4gVFsD3kGc5gCyAmMt',
    poolCoinTokenAccount: 'G2zmxUhRGn12fuePJy9QsmJKem6XCRnmAEkf8G6xcRTj',
    poolPcTokenAccount: 'H617sH2JNjMqPhRxsu43C8vDYfjZrFuoMEKdJyMu7V3t',
    poolWithdrawQueue: '2QiXRE5yAfTbTUT9BCfmkahmPPhsmWRox1V88iaJppEX',
    poolTempLpTokenAccount: '5ujWtJVhwzy8P3DJBYwLo4StxiFhJy5q6xHnMx7yrPPb',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HZyhLoyAnfQ72irTdqPdWo2oFL9zzXaBmAqN72iF3sdX',
    serumCoinVaultAccount: '56KzKfd9LvsY4QuMZcGxcGCd78ZBFQ7JcyMFwgqpXH12',
    serumPcVaultAccount: 'GLntTfM7RHeg5RuAuXcudT4NV7d4BGPrEFq7mmMxn29E',
    serumVaultSigner: '6FYUBnwRVxxYCv1kpad4FaFLJAzLYuevFWmpVp7hViTn',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['RAY-SOL'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '5Ytcen7ZQRWA8Dt4EGyVJngyqDL36ZKAGSTVKxbDGZPN',
    ammAuthority: '6LUFae1Ap44GVT9Dhw7NEqibFGSFxijdx4kzKVARsSuL',
    ammOpenOrders: '4JGNm7gSaZguaNJExYsFsL91x4GPtPyHpU7nrb5Jjygh',
    ammTargetOrders: '3rqYVkU3HkSj8XB9c2Y9e1LLPL6BjtNKr187qma6peCc',
    ammQuantities: 'BMTLKbmwzsKRxzL45eKgb5or8spaStLZxvycrTGGAhdK',
    poolCoinTokenAccount: 'CJukFFmH9FZ98uzFkUNgqRn8xUmSBTUETEDUMxZXk6p8',
    poolPcTokenAccount: 'DoZyq9uo3W4WWBZJvPCvfB5cCBFvjU9oq3DdYjNgJNRX',
    poolWithdrawQueue: '9FY699Gpyq4CcL8KFS4rEP76dAR3GQchQnUw7Xg1yaew',
    poolTempLpTokenAccount: 'A1BMmYPBXudTXzQExpqy1LrqEkKuoasfwCLjwigiSfRh',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HTSoy7NCK98pYAkVV6M6n9CTziqVL6z7caS3iWFjfM4G',
    serumCoinVaultAccount: '6dDDqzNsLx8u2Prk384Rs1jUxFPFQsKHne5oQxnf4kog',
    serumPcVaultAccount: 'AzxRBcig9mGTfdbUgEdKq48eiNZ2M4ynwQQH4Pvxbcy2',
    serumVaultSigner: 'FhTczYTxkXMyofPMDQFJGHxjcnPrjrEGQMexob4BVwXD',
    official: true
  },
  {
    name: 'LINK-WUSDT',
    coin: { ...TOKENSBASE.LINK },
    pc: { ...TOKENSBASE.WUSDT },
    lp: { ...LP_TOKENSBASE['LINK-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: 'Avkh3hMrjRRdGbm7EAmeXaJ1wWrbcwGWDGEroKq5wHJ8',
    ammAuthority: 'v1uTXS1hrW2DJkKPcQ3Dm7WwhYbGm7LhHoRE29QrHsJ',
    ammOpenOrders: 'HD7VPeJL2Sgict6oBPhb2s3DXvS9uieQmuw7KzhrfD3j',
    ammTargetOrders: 'DQ7un7pYeWWcBrt1mpucasb2CaepJQJ3Z3axM3PJ4pJ4',
    ammQuantities: '5KDL4Mtufuhe6Yof9nSPVjXgXgMFMHCXqKETzzbrsGzY',
    poolCoinTokenAccount: '7r5YjMLMnmoYkD1bkyYq374yiTBG9XwBHMwi5ZVDptre',
    poolPcTokenAccount: '6vMeQvJcC3VEGvtZ2TDXcShZerevxkqfW43yjX14vmSz',
    poolWithdrawQueue: '3tgn1n9wMGfryZu37skcMhUuwbNYFWTT5hurWGijikXZ',
    poolTempLpTokenAccount: 'EL8G5U28xw9djiEb9AZiEtBUtUdA5YtvaAHJu5hxipCK',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'hBswhpNyz4m5nt4KwtCA7jYXvh7VmyZ4TuuPmpaKQb1',
    serumCoinVaultAccount: '8ZP84HpFb5k4paAgDGgXaMtne537LDFaxEWP89WKBPD1',
    serumPcVaultAccount: 'E3X7J1vyogGKZSySEo3WTS9GzipyTGVd5KKiXeFy1YHu',
    serumVaultSigner: '7bwfaV98FDNtWvgPMo7wY3nE7cE8tKfXkFAVzCxtkw6w',
    official: true
  },
  {
    name: 'ETH-WUSDT',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...TOKENSBASE.WUSDT },
    lp: { ...LP_TOKENSBASE['ETH-WUSDT'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '7PGNXqdhrpQoVS5uQs9gjT1zfY6MUzEeYHopRnryj7rm',
    ammAuthority: 'BFCEvcoD1xY1HK4psbC5wYXVXEvmgwg4wKggk89u1NWw',
    ammOpenOrders: '3QaSNxMuA9zEXazLdD2oJq7jUCfShgtvdaepuq1uJFnS',
    ammTargetOrders: '2exvd2T7yFYhBpi67XSrCVChVwMu23g653ELEnjvv8uu',
    ammQuantities: 'BtwQvRXNudUrazbJNhazajSZXEXbrf51ddBrmnje27Li',
    poolCoinTokenAccount: 'Gej1jXVRMdDKWSxmEZ78KJp5jruGJfR9dV3beedXe3BG',
    poolPcTokenAccount: 'FUDEbQKfMTfAaKS3dGdPEacfcC9bRpa5gmmDW8KNoUKp',
    poolWithdrawQueue: '4q3qXQsQSvzNE1fSyEh249vHGttKfQPJWM7A3AtffEX5',
    poolTempLpTokenAccount: '8i2cZ1UCAjVac6Z76GvQeRqZMKgMyuoZQeNSsjdtEgHG',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: '5abZGhrELnUnfM9ZUnvK6XJPoBU5eShZwfFPkdhAC7o',
    serumCoinVaultAccount: 'Gwna45N1JGLmUMGhFVP1ELz8szVSajp12RgPqCbk46n7',
    serumPcVaultAccount: '8uqjWjNQiZvoieaGSoCRkGZExrqMpaYJL5huknCEHBcP',
    serumVaultSigner: '4fgnxw343cfYgcNgWvan8H6j6pNBskBmGX4XMbhxtFbi',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['RAY-USDC'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: 'G2PVNAKAp17xtruKiMwT1S2GWNxptWZfqK6oYrFWCXWX',
    ammAuthority: '2XTg6m9wpuUyPNhHbi8DCGfyo58bpqmAmbujEEpUykSo',
    ammOpenOrders: 'HuGmmcqH6ULntUdfaCVrx4uzuhHME55Dczt793EweoTZ',
    ammTargetOrders: 'B3UeQ7SK9U9a5vP8fDtZ5gfDv6KRFSsNtawpoH7fziNW',
    ammQuantities: 'LEgCPaQhYv9YSnKXvHtc6HixwxdXe9mmvLCuTTxW2Yn',
    poolCoinTokenAccount: 'CvcqJtGdS9C1jKKFzgCi5p8qsnR5BZCohWvYMBJXcnJ8',
    poolPcTokenAccount: 'AiYm8jzb2WB4HTTFTHX1XCS7uVSQM5XWnMsure5sMeQY',
    poolWithdrawQueue: 'rYqeTgbeQvrDxeCg4kjqHA1X6rfjjLQvQTJeYLAgXq7',
    poolTempLpTokenAccount: '4om345FvSd9dqwFpy1SVmPFY9KzeUk8WmKiMzTbQxCQf',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'Bgz8EEMBjejAGSn6FdtKJkSGtvg4cuJUuRwaCBp28S3U',
    serumCoinVaultAccount: 'BuMsEd7Ub6MtCCh1eT8pvL6zcBPbiifa1idVWa1BeE2R',
    serumPcVaultAccount: 'G7i7ZKx7rfMXGreLYzvR3ZZERgaGK7646nAgi8yjE8iN',
    serumVaultSigner: 'Aj6H2siiKsnAdAS5YVwuJPdXrHaLodsSyKs7ZiEtEZQN',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['RAY-SRM'] },

    version: 2,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V2,

    ammId: '3Y5dpV9DtwkhewxXpiVRscFeQR2dvsHovXQonkKbuDwB',
    ammAuthority: '7iND8ysb6fGUy8tx4C8AS51wbjvRjBxxSoaaL7t1yWXX',
    ammOpenOrders: '4QXs3bK3nyauMYutJjD8qGunFphAw944SsRdSD7n8oUj',
    ammTargetOrders: '5oaHFj1aqz9xLxYwByddXiUfbSwRZ3gmSJsgBF4no7Xx',
    ammQuantities: 'His9VQDWu55QdDUFu7tp5CpiCB1fMs6EDk5oC4uTaS4G',
    poolCoinTokenAccount: '5fHS778vozoDDYzzJz2xYG39whTzGGW6bF71GVxRyMXi',
    poolPcTokenAccount: 'CzVe191iLM2E31DBW7isXpZBPtcufRRsaxNRc8uShcEs',
    poolWithdrawQueue: 'BGmJSiCR7uuahrajWv1RgBJrbUjcQHREFfewqZPhf346',
    poolTempLpTokenAccount: '5aMZAZdab2iS62rfqPYd15AkQ7Y5zSSfz7WxHjV9ZRPw',
    serumProgramId: SERUM_PROGRAM_ID_V2,
    serumMarket: 'HSGuveQDXtvYR432xjpKPgHfzWQxnb3T8FNuAAvaBbsU',
    serumCoinVaultAccount: '6wXCSGvFvWLVoiRaXJheHoXec4LiJhiCWnxmQbYc9kv5',
    serumPcVaultAccount: 'G8KH5rE5EqeTpnLjTTNgKhVp47yRHCN28wH27vYFkWCR',
    serumVaultSigner: 'EXZnYg9QCzujDwm621N286d4KLAZiMwpUv64GdECcxbm',
    official: true
  },
  // v3
  {
    name: 'RAY-WUSDT',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.WUSDT },
    lp: { ...LP_TOKENSBASE['RAY-WUSDT-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'FEAkBF4GhYKrYbxMa7tFcujvzxKrueC7xHT2NdyC9vxm',
    ammAuthority: 'CgvoNxNc93c91zYkPTAkBsYxjcAn8bRsnLM5ZxNKUpDj',
    ammOpenOrders: '2nzyzD5sdDKkP5pN5V5HGDmacpQJPEkMHqA1vopuRupY',
    ammTargetOrders: 'BYCxxFuPB6MjLmpBoA7XMXHKk87LP1V62HPFh5BaobBd',
    ammQuantities: 'H8P2YR1MTFgcRKnGHYWk6Aitqf72aXCN3ZKM29mRQqqe',
    poolCoinTokenAccount: 'DTQTBTSy3tiy7kZZWgaczWxs9snnTVTi8DBYBzjaVwbj',
    poolPcTokenAccount: 'Bk2G4zhjB7VmRsaBwh2ijPwq6tavMHALEq4guogxsosT',
    poolWithdrawQueue: '9JnsD9Pm8YQhMMAKBV7RgPcdVnRTuwJW5PXdWx7T2K8C',
    poolTempLpTokenAccount: 'FfNM2Szi8xKWj3SUAjYpsHKuyQsd9NuW8ARkMqyNYPiJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C4z32zw9WKaGPhNuU54ohzrV4CE1Uau3cFx6T8RLjxYC',
    serumCoinVaultAccount: '6hCHQufQsxsHDkHYNmw79WvfsAGXvomdZnkzWN7MYz8f',
    serumPcVaultAccount: '7qM644QyBzMvqLLiEYhJksyPzwUpuQj44EodLb1va8aG',
    serumVaultSigner: '2hzqYES4AcwVkuMdNsNNqi1jqjfKSyL2BNus4kimVXNk',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['RAY-USDC-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: '5NMFfbccSpLdre6anA8P8vVy35n2a52AJiNPpQn8tJnE',
    ammAuthority: 'Bjhs6Mrvxr34WAKLog2tiU77VMvwNZcrJ1g8UyGoic3e',
    ammOpenOrders: '3Xq4vBd5EWs45v9YwG1Mpfr8Xjng23pDovVUbnAaPce9',
    ammTargetOrders: '7ccgnj4dTuVTaQCwbECDc3GrKrQpuGNA4cETiSNo2cCN',
    ammQuantities: '6ifgXdNx8zKd4bseuya6FEKb49VWx1dDvVTC8f7kc361',
    poolCoinTokenAccount: 'DujWhSxnwqFd3TrLfScyUhJ3FdoaHrmoiVE6kU4ETQyL',
    poolPcTokenAccount: 'D6F5CDaLDCHHWfE8kMLbMNAFULXLfM572AGDx2a6KeXc',
    poolWithdrawQueue: '76QQPxNT422AL8w5RhssRFQ3gUGy7Y23YxV9BRWqs44Q',
    poolTempLpTokenAccount: '2Q9PevhtVioNFyFFrbkzcGxn1QmzFph5Cpdy1FKe3nYJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep',
    serumCoinVaultAccount: 'GGcdamvNDYFhAXr93DWyJ8QmwawUHLCyRqWL3KngtLRa',
    serumPcVaultAccount: '22jHt5WmosAykp3LPGSAKgY45p7VGh4DFWSwp21SWBVe',
    serumVaultSigner: 'FmhXe9uG6zun49p222xt3nG1rBAkWvzVz7dxERQ6ouGw',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['RAY-SRM-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'EGhB6FdyHtJPbPMRoBC8eeUVnVh2iRgnQ9HZBKAw46Uy',
    ammAuthority: '3gSVizZA2BFsWAfW4j1wBSQiQE9Xn3Ds518jPGve31se',
    ammOpenOrders: '6CVRtzecMaPZ1pdfT2ZzJ1qf89yuFsD7MKYGwvjYsy6w',
    ammTargetOrders: 'CZYbET8zweaWtWLnFJnt5nouCE9snQxFi7zrTCGYycL1',
    ammQuantities: '3NGwJe5bueAgLp6fMrY5HV2rpHF9xh3HhH97S6LrMLPo',
    poolCoinTokenAccount: 'Eg6sR9H28cFaek5DVdgxxDcRKKbS85XvCFEzzkdmYNhq',
    poolPcTokenAccount: '8g2nHtayS2JnRxaAY5ugsYC8CwiZutQrNWA9j2oH8UVM',
    poolWithdrawQueue: '7Yc1P9nyev1uoLtLJu15o5vQugvfXoHcde6x2mm1HeED',
    poolTempLpTokenAccount: '5WHmdyH7CgiezSGcD9PVMYth9hMEWETV1M64zmZ9UT5o',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Cm4MmknScg7qbKqytb1mM92xgDxv3TNXos4tKbBqTDy7',
    serumCoinVaultAccount: '5QDTh4Bpz4wruWMfayMSjUxRgDvMzvS2ifkarhYtjS1B',
    serumPcVaultAccount: '76CofnHCvo5wEKtxNWfLa2jLDz4quwwSHFMne6BWWqx',
    serumVaultSigner: 'AorjCaSV1L6NGcaFZXEyUrmbSqY3GdB3YXbQnrh85v6F',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['RAY-SOL-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'HeRUVkQyPuJAPFXUkTaJaWzimBopWbJ54q5DCMuPpBY4',
    ammAuthority: '63Cw8omVwSQGDPP5nff3a9DakvL8ruaqqEpbQ4uDwPYf',
    ammOpenOrders: 'JQEY8R9frhxuvcsewGfgkCVdGWztpHLx4P9zmTAsZFM',
    ammTargetOrders: '7mdd7oqHqULV1Yxaaf5GW52FKFbJz78sZj9ePcfmL5Fi',
    ammQuantities: 'HHU2THd3tocaYagZh826KCvLDv7QNWLGKjaJKmtdtTQM',
    poolCoinTokenAccount: 'Fy6SnHwAkxoGMhUH2cLu2biqAnHmaAwFDDww9k6gq5ws',
    poolPcTokenAccount: 'GoRindEPofTJ3axsonTnbyf7cFwdFdG1A3MG9ENyBZsn',
    poolWithdrawQueue: '3bUwc23vXP9L6XBjVCvG9Mruuu7GRkcfmyXuaH6HdmW2',
    poolTempLpTokenAccount: '9dALTRnKoLmfMn3hPyQoizmSJ5CZSLMLdJy1XMocwXMU',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C6tp2RVZnxBPFbnAsfTjis8BN9tycESAT4SgDQgbbrsA',
    serumCoinVaultAccount: '6U6U59zmFWrPSzm9sLX7kVkaK78Kz7XJYkrhP1DjF3uF',
    serumPcVaultAccount: '4YEx21yeUAZxUL9Fs7YU9Gm3u45GWoPFs8vcJiHga2eQ',
    serumVaultSigner: '7SdieGqwPJo5rMmSQM9JmntSEMoimM4dQn7NkGbNFcrd',
    official: true
  },
  {
    name: 'RAY-ETH',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.ETH },
    lp: { ...LP_TOKENSBASE['RAY-ETH-V3'] },

    version: 3,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V3,

    ammId: 'FrDSSYXGcrJc7ZwY5KMfTmzDfrzjvqdxmSinJFwxLr14',
    ammAuthority: '5Wbe7MYpw8y9iroZKVN8b3fLZNeBUbRKetQwULicDpw2',
    ammOpenOrders: 'ugyjEMZLumc1M5c7MNXayMYmxpnuMRYiT4aPwfNb6bq',
    ammTargetOrders: '2M6cT1GvGTiovTj7bRsZBeLMeJzjYoDTHNiTRVJqRFeM',
    ammQuantities: '5YcH7AwHNLdDJd2K6YmZAxqqvGYjgE59NaYAh3pkgVd7',
    poolCoinTokenAccount: 'ENjXaFNDiLTh44Gs89ZtfUH2i5MGLLkfYbSY7TmP4Du3',
    poolPcTokenAccount: '9uzWJD2WqJYSmB6UHSyPMskFGoP5L6hB7FxqUdYP4Esm',
    poolWithdrawQueue: 'BkrxkmYs1JViXbiBJfnwgns75CJd9yHcqUkFXB8Bz7oB',
    poolTempLpTokenAccount: 'CKZ7NMunTef18yKHuizRoNZedzTdDEFwYRUgB3dFDcrd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6jx6aoNFbmorwyncVP5V5ESKfuFc9oUYebob1iF6tgN4',
    serumCoinVaultAccount: 'EVVtYo4AeCbmn2dYS1UnhtfjpzCXCcN26G1HmuHwMo7w',
    serumPcVaultAccount: '6ZT6KwvjLnJLpFdVfiRD9ifVUo4gv4MUie7VvPTuk69v',
    serumVaultSigner: 'HXbRDLcX2FyqWJY95apnsTgBoRHyp7SWYXcMYod6EBrQ',
    official: true
  },
  // v4
  {
    name: 'FIDA-RAY',
    coin: { ...TOKENSBASE.FIDA },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['FIDA-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '2dRNngAm729NzLbb1pzgHtfHvPqR4XHFmFyYK78EfEeX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DUVSNpoCNyGDP9ef9gJC5Dg53khxTyM1pQrKVetmaW8R',
    ammTargetOrders: '89HcsFvCQaUdorVF712EhNhecvVM7Dk6XAdPbaykB3q2',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6YeEo7ZTRHotXd89JTBJKRXERBjv3N3ofgsgJ4FoAa39',
    poolPcTokenAccount: 'DDNURcWy3CU3CpkCnDoGXwQAeCg1mp2CC8WqvwHp5Fdt',
    poolWithdrawQueue: 'H8gZ2f4hp6LfaszDN5uHAeDwZ1qJ4M4s2A59i7nMFFkN',
    poolTempLpTokenAccount: 'Bp7LNZH44vecbv69kY35bjmsTjboGbEKy62p7iRT8az',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '9wH4Krv8Vim3op3JAu5NGZQdGxU8HLGAHZh3K77CemxC',
    serumBids: 'E2FEkqPVcQZgRaE7KabcHGbpNkpycnvVZMan2MPNGKeM',
    serumAsks: '5TXqn1N2kpCWWV4AcXtFYJw8WqLrXP62qenxiSfhxJiD',
    serumEventQueue: '58qMcacA2Qk4Tc4Rut3Lnao91JvvWJJ26f5kojKnMRen',
    serumCoinVaultAccount: 'A2SMhqA1kMTudVeAeWdzCaYYeG6Dts19iEZd4ZQQAcUm',
    serumPcVaultAccount: 'GhpccNwfein8qP6uhWnP4vuRva1iLivuQQHUTM7tW58r',
    serumVaultSigner: 'F7VdEoWQGmdFK35SD21wAbDWtnkVpcrxM3DPVnmG8Q3i',
    official: true
  },
  {
    name: 'OXY-RAY',
    coin: { ...TOKENSBASE.OXY },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['OXY-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'B5ZguAWAGC3GXVtJZVfoMtzvEvDnDKBPCevsUKMy4DTZ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FVb13WU1W1vFouhRXZWVZWGkQdK5jo35EnaCrMzFqzyd',
    ammTargetOrders: 'FYPP5v8SLHPPcivgBJPE9FgrN6o2QVMB627n3XcZ8rCS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6ttf7G7FR9GWqxiyCLFNaBTvwYzTLPdbbrNcRvShaqtS',
    poolPcTokenAccount: '8orrvb6rHB776KbQmszcxPH44cZHdCTYC1fr2a3oHufC',
    poolWithdrawQueue: '4Q9bNJsWreAGhkwhKYL7ApyhEBuwNxiPkcEQNmUjQGHZ',
    poolTempLpTokenAccount: 'E12sRQvEHArCULaJu8xppoJKQgJsuDuwPVJZJRrUKYFu',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HcVjkXmvA1815Es3pSiibsRaFw8r9Gy7BhyzZX83Zhjx',
    serumBids: 'DaGRz2TAdcVcPwPmYF5JJ7d7kPWvLN68vuBTTMwnoM3T',
    serumAsks: '3ZRtPBQVcjCpVmCt4xPPeJJiUnDDbrc5jommVHGsDLnT',
    serumEventQueue: 'C5SGEXUCmN1LxmxapPn2XaHX1FF7fAuQG5Wu4yuu8VK6',
    serumCoinVaultAccount: 'FcDWM8eKUEny2wxopDMrZqgmPr3Tmoen9Dckh3MoVX9N',
    serumPcVaultAccount: '9ya4Hv4XdzntjiLwxpgqnX8eP4MtFf8YWEssF6C5Pqhq',
    serumVaultSigner: 'Bf9MhS6hwAGSWVJ4uLWKSU6fqPAEroRsHX6ithEjGXiG',
    official: true
  },
  {
    name: 'MAPS-RAY',
    coin: { ...TOKENSBASE.MAPS },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['MAPS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5VyLSjUvaRxsubirbvbfJMbrKZRx1b7JZzuCAfyqgimf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HViBtwESRNKLZY7qLQxP68b5vLdUQa1XMAKz19LbSHjx',
    ammTargetOrders: '8Cwm1Z75hQdUpFUxCuoWmWBLcAaZvKMAn2xKeuotC4eC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6rYv6kLfhAVKZw1xN2S9NWNgp8EfUVvYKi1Hgzd5x9XE',
    poolPcTokenAccount: '8HfvN4VyAQjX6MhziRxMg5LjbMh9Fw889yf3sDgrXakw',
    poolWithdrawQueue: 'HnzkiYgZg22ZaQGdeTHiCgJaoW138CLqCb8tr6QJFkU4',
    poolTempLpTokenAccount: 'DnTQwA9PdwLSibsiQFZ35yJJDNJfG9fNbHspPmb8v8TQ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7Q4hee42y8ZGguqKmwLhpFNqVTjeVNNBqhx8nt32VF85',
    serumBids: 'J9ZmfF71eMMzisvaYW12EK87UaopZ4hgND2nr61YwmKw',
    serumAsks: '9ah4Mewrh841gmfaX1v1wCByHU3rbCuUmWUgt2TBAfnb',
    serumEventQueue: 'EtimVRtnRUAfv9tXVAHpGCGvtYezcpmzbkwZLuwWAYqe',
    serumCoinVaultAccount: '2zriJ5sVApLD9TC9PxbXK41AkVCQBaRreeXtGx7AGE41',
    serumPcVaultAccount: '2qAKnjzokKR4sL6Xtp1nZYKXTmsraXW9CL3HuBZx3qpA',
    serumVaultSigner: 'CH76NgZMpUJ8QQqVNpjyCSpQmZBNZLXW6a5vDHj3aUUC',
    official: true
  },
  {
    name: 'KIN-RAY',
    coin: { ...TOKENSBASE.KIN },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['KIN-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6kmMMacvoCKBkBrqssLEdFuEZu2wqtLdNQxh9VjtzfwT',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DiP4F6FTR5jiTar8fwuwRVuYop5wYRqy2EjbiKTXPrHw',
    ammTargetOrders: '2ak4VVyS19sVESvvBuPZRMAhvY4vVCZCxeELYAybA7wk',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 's7LP6qptF1wufA9neYhekmVPqhav8Ak85AV5ip5h8wK',
    poolPcTokenAccount: '9Q1Xs1s8tCirX3Ky3qo9UjvSqSoGinZvWaUMFXY5r2HF',
    poolWithdrawQueue: 'DeHaCJ8KL5uwBGenkUwa39JyhacxPDqDqHAp5HLqgd1i',
    poolTempLpTokenAccount: 'T2acWsGDQ4ZRXs4WXVi7vCeH4TxzgjcL6s14xFNuT26',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Fcxy8qYgs8MZqiLx2pijjay6LHsSUqXW47pwMGysa3i9',
    serumBids: 'HKWdSptDBeXTURKpQQ2AGPmT2B9LGNBVteq44UzDxKBh',
    serumAsks: '2ceQrRfuNWL8kR2fockPo7C31uDeTyXTs4EyA28FD2kg',
    serumEventQueue: 'GwnDyxFnHSnzDdu8dom3vydtTpSu443oZPKepXww5zNB',
    serumCoinVaultAccount: '2sCJ5YZtwEbpXiw7HSXVx8Qot8hwyCpXNEkswZCssi2J',
    serumPcVaultAccount: 'H6B59E77WZt4JLfaXdZQBKdATRcWaKy5N6Ki1ZRo1Mcv',
    serumVaultSigner: '5V7FCcvmGtqkMJXHiTSeo61MS5LSMUFK1Esr5kn46cEv',
    official: true
  },
  {
    name: 'RAY-USDT',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['RAY-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7UF3m8hDGZ6bNnHzaT2YHrhp7A7n9qFfBj6QEpHPv5S8',
    ammTargetOrders: '3K2uLkKwVVPvZuMhcQAPLF8hw95somMeNwJS7vgWYrsJ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3wqhzSB9avepM9xMteiZnbJw75zmTBDVmPFLTQAGcSMN',
    poolPcTokenAccount: '5GtSbKJEPaoumrDzNj4kGkgZtfDyUceKaHrPziazALC1',
    poolWithdrawQueue: '8VuvrSWfQP8vdbuMAP9AkfgLxU9hbRR6BmTJ8Gfas9aK',
    poolTempLpTokenAccount: 'FBzqDD1cBgkZ1h6tiZNFpkh4sZyg6AG8K5P9DSuJoS5F',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'teE55QrL4a4QSfydR9dnHF97jgCfptpuigbb53Lo95g',
    serumBids: 'AvKStCiY8LTp3oDFrMkiHHxxhxk4sQUWnGVcetm4kRpy',
    serumAsks: 'Hj9kckvMX96mQokfMBzNCYEYMLEBYKQ9WwSc1GxasW11',
    serumEventQueue: '58KcficuUqPDcMittSddhT8LzsPJoH46YP4uURoMo5EB',
    serumCoinVaultAccount: '2kVNVEgHicvfwiyhT2T51YiQGMPFWLMSp8qXc1hHzkpU',
    serumPcVaultAccount: '5AXZV7XfR7Ctr6yjQ9m9dbgycKeUXWnWqHwBTZT6mqC7',
    serumVaultSigner: 'HzWpBN6ucpsA9wcfmhLAFYqEUmHjE9n2cGHwunG5avpL',
    official: true
  },
  {
    name: 'SOL-USDC',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SOL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HRk9CMrpq7Jn9sh7mzxE8CChHG8dneX9p475QKz4Fsfc',
    ammTargetOrders: 'CZza3Ej4Mc58MnxWA385itCC9jCo3L1D7zc3LKy1bZMR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DQyrAcCrDXQ7NeoqGgDCZwBvWDcYmFCjSb9JtteuvPpz',
    poolPcTokenAccount: 'HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz',
    poolWithdrawQueue: 'G7xeGGLevkRwB5f44QNgQtrPKBdMfkT6ZZwpS9xcC97n',
    poolTempLpTokenAccount: 'Awpt6N7ZYPBa4vG4BQNFhFxDj4sxExAA9rpBAoBw2uok',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    serumBids: '14ivtgssEBoBjuZJtSAPKYgpUK7DmnSwuPMqJoVTSgKJ',
    serumAsks: 'CEQdAFKdycHugujQg9k2wbmxjcpdYZyVLfV9WerTnafJ',
    serumEventQueue: '5KKsLVU6TcbVDK4BS6K1DGDxnh4Q9xjYJ8XaDCG5t8ht',
    serumCoinVaultAccount: '36c6YqAwyGKQG66XEp2dJc5JqjaBNv7sVghEtJv4c7u6',
    serumPcVaultAccount: '8CFo8bL8mZQK8abbFyypFMwEDd8tVJjHTTojMLgQTUSZ',
    serumVaultSigner: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
    official: true
  },
  {
    name: 'YFI-USDC',
    coin: { ...TOKENSBASE.YFI },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['YFI-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '83xxjVczDseaCzd7D61BRo7LcP7cMXut5n7thhB4rL4d',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DdBAps8e64hpjdWqAAHTThcVFz8mQ6WU2h6s1Kjgb9vk',
    ammTargetOrders: '8BFicQN1AKaVbf1KNoUieULun1bvpdMxsyjrgC15acM6',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HhhqmQvx2GMQ6SRQh6nZ1A4C5KjCFLQ6yga1ZXDzRJ92',
    poolPcTokenAccount: '4J4Y6qkF9yzxz1EsZYTSqviMz3Lo1VHx9ViCUoJph167',
    poolWithdrawQueue: 'FPkMHzDo46vzy1eW9FuQFz7TdAp1MNCkZFgKxrHiuh3W',
    poolTempLpTokenAccount: 'DuTzisr6Z2D37yTyY9E4jPMCxhQk3HCNxaL1zKqvwRjR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7qcCo8jqepnjjvB5swP4Afsr3keVBs6gNpBTNubd1Kr2',
    serumBids: '8L8kU4H9Ah3fgbczYKFU9WUR1HgAghso1kKwWAPrmLfS',
    serumAsks: '4M9kDzMGsNHT3k31i54wf2ceeApvx3224pLbhDvnoj2s',
    serumEventQueue: '6wKPYgydqNrmcXwbfPeNwkzXmjKMgkUhQcGoGYrm9fS4',
    serumCoinVaultAccount: '2N59Aig7wqhfffAUjMit7T9tk4FmSRzmByMD7mncTesq',
    serumPcVaultAccount: 'FcDTYePeh2KJts4nroCghgceiJmSBRgq2Xd3PfpernZm',
    serumVaultSigner: 'HDdQQNNf9EoCGWhWUgkQHRJVbG3huDXs2z6Fcow3grCr',
    official: true
  },
  {
    name: 'SRM-USDC',
    coin: { ...TOKENSBASE.SRM },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SRM-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8tzS7SkUZyHPQY7gLqsMCXZ5EDCgjESUHcB17tiR1h3Z',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GJwrRrNeeQKY2eGzuXGc3KBrBftYbidCYhmA6AZj2Zur',
    ammTargetOrders: '26LLpo8rscCpMxyAnJsqhqESPnzjMGiFdmXA4eF2Jrk5',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'zuLDJ5SEe76L3bpFp2Sm9qTTe5vpJL3gdQFT5At5xXG',
    poolPcTokenAccount: '4usvfgPDwXBX2ySX11ubTvJ3pvJHbGEW2ytpDGCSv5cw',
    poolWithdrawQueue: '7c1VbXTB7Xqx5eQQeUxAu5o6GHPq3P1ByhDsnRRUWYxB',
    poolTempLpTokenAccount: '2sozAi6zXDUCCkpgG3usphzeCDm4e2jTFngbm5atSdC9',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'ByRys5tuUWDgL73G8JBAEfkdFf8JWBzPBDHsBVQ5vbQA',
    serumBids: 'AuL9JzRJ55MdqzubK4EutJgAumtkuFcRVuPUvTX39pN8',
    serumAsks: '8Lx9U9wdE3afdqih1mCAXy3unJDfzSaXFqAvoLMjhwoD',
    serumEventQueue: '6o44a9xdzKKDNY7Ff2Qb129mktWbsCT4vKJcg2uk41uy',
    serumCoinVaultAccount: 'Ecfy8et9Mft9Dkavnuh4mzHMa2KWYUbBTA5oDZNoWu84',
    serumPcVaultAccount: 'hUgoKy5wjeFbZrXDW4ecr42T4F5Z1Tos31g68s5EHbP',
    serumVaultSigner: 'GVV4ZT9pccwy9d17STafFDuiSqFbXuRTdvKQ1zJX6ttX',
    official: true
  },
  {
    name: 'FTT-USDC',
    coin: { ...TOKENSBASE.FTT },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['FTT-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4C2Mz1bVqe42QDDTyJ4HFCFFGsH5YDzo91Cen5w5NGun',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '23WS5XY3srvBtnP6hXK64HAsXTuj1kT7dd7srjrJUNTR',
    ammTargetOrders: 'CYbPm6BCkMyX8NnnS7AoCUkpxHVwYyxvjQWwZLsrFcLR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4TaBaR1ZgHNuQM3QNHnjJdAT4Sws9cz46MtVWVebg7Ax',
    poolPcTokenAccount: '7eDiHvsfcZf1VFC2sUDJwr5EMMr66TpQ2nmAreUjoASV',
    poolWithdrawQueue: '36Aa83kffwBuEP7AqNU1w5c9oB9kLxmR4FMfadXfjNbJ',
    poolTempLpTokenAccount: '8hdJm5bvgXVtb5LA18QgGeKxnXBcp3cYKwRz8vb3fV44',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Pbh1CvRVku1TgewMfycemghf6sU9EyuFDcNXqvRmSxc',
    serumBids: '9HTDV2r7cQBUKL3fgcJZCUfmJsKA9qCP7nZAXyoyaQou',
    serumAsks: 'EpnUJCMCQNZi45nCBoNs6Bugy67Kj3bCSTLYPfz6jkYH',
    serumEventQueue: '2XHxua6ZaPKpCGUNvSvTwc9teJBmexp8iMWCLu4mtzGb',
    serumCoinVaultAccount: '4LXjM6rptNvhBZTcWk4AL49oF4oA8AH7D4CV6z7tmpX3',
    serumPcVaultAccount: '2ycZAqQ3YNPfBZnKTbz2FqPiV7fmTQpzF95vjMUekP5z',
    serumVaultSigner: 'B5b9ddFHrjndUieLAKkyzB1xmq8sNqGGZPmbyYWPzCyu',
    official: true
  },
  {
    name: 'BTC-USDC',
    coin: { ...TOKENSBASE.BTC },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['BTC-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6kbC5epG18DF2DwPEW34tBy5pGFS7pEGALR3v5MGxgc5',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'L6A7qW935i2HgaiaRx6xNGCGQfFr4myFU51dUSnCshd',
    ammTargetOrders: '6DGjaczWfFthTYW7oBk3MXP2mMwrYq86PA3ki5YF6hLg',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HWTaEDR6BpWjmyeUyfGZjeppLnH7s8o225Saar7FYDt5',
    poolPcTokenAccount: '7iGcnvoLAxthsXY3AFSgkTDoqnLiuti5fyPNm2VwZ3Wz',
    poolWithdrawQueue: '8g6jrVU7E7eghT3FQa7uPbwHUHwHHLVCEjBh94pA1NVk',
    poolTempLpTokenAccount: '2Nhg2RBqHBx7R74VSEAbfSF8Kmi1x3HxyzCu3oFgpRJJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw',
    serumBids: '6wLt7CX1zZdFpa6uGJJpZfzWvG6W9rxXjquJDYiFwf9K',
    serumAsks: '6EyVXMMA58Nf6MScqeLpw1jS12RCpry23u9VMfy8b65Y',
    serumEventQueue: '6NQqaa48SnBBJZt9HyVPngcZFW81JfDv9EjRX2M4WkbP',
    serumCoinVaultAccount: 'GZ1YSupuUq9kB28kX9t1j9qCpN67AMMwn4Q72BzeSpfR',
    serumPcVaultAccount: '7sP9fug8rqZFLbXoEj8DETF81KasaRA1fr6jQb6ScKc5',
    serumVaultSigner: 'GBWgHXLf1fX4J1p5fAkQoEbnjpgjxUtr4mrVgtj9wW8a',
    official: true
  },
  {
    name: 'SUSHI-USDC',
    coin: { ...TOKENSBASE.SUSHI },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SUSHI-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5dHEPTgvscKkAc54R77xUeGdgShdG9Mf6gJ9bwBqyb3V',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7a8WXaxsvDV9CjSxgSpJG8LZgdxmSps1ehvtgQj2qt4j',
    ammTargetOrders: '9f5b3uy3hQutS6pka2GxcSoKjvKaTcB1ivkj1GK43UAV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'B8vMKgzKHkapzdDu1jW76ALFvVYzHGGKhR5Afz3A4mZd',
    poolPcTokenAccount: 'Hsxi4jvmszcMaWfU3tk98fQa9pVXtRktfKvKJ7rKBQYi',
    poolWithdrawQueue: 'AgEspvUPUuaTqyJTjZMCAW3zTuxQBSaU17GhLJoc6Jad',
    poolTempLpTokenAccount: 'BHLDqVcYUrAwv8RvDUQ76BQDQzvb2yftFN8UccpA2stx',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'A1Q9iJDVVS8Wsswr9ajeZugmj64bQVCYLZQLra2TMBMo',
    serumBids: 'J8JVRuBojWcHFRGosQKRdDtzxwux8fy2dwfk42Z3dCaf',
    serumAsks: '6DScSyKZKBi9cXhD3mRkTkpsxrhw6HABFxebsteCP1zU',
    serumEventQueue: 'Hvpz2Cv2LgWUfTtdfjpnefYrjQuaw8gGjKoDAeGxzrwE',
    serumCoinVaultAccount: 'BJfPQ2iKTJknyWo2wtCVEpRGWVt8sgpvmSQVNwLioQrk',
    serumPcVaultAccount: '2UN8qfXzoUDAxZMX1KqKut93frkt5hFREL8xcw6Hgtsg',
    serumVaultSigner: 'uWhVkK44yR6V5XywVom4oWzDQACSPYHhNjkwXprtUij',
    official: true
  },
  {
    name: 'TOMO-USDC',
    coin: { ...TOKENSBASE.TOMO },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['TOMO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8mBJC9qdPNDyrpAbrdwGbBpEAjPqwtvZQVmbnKFXXY2P',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'H11WJQWj51KyYU5gdrnsXvpaYZM6ZLGULV93VbTmvaBL',
    ammTargetOrders: '5E9x2QRpTM2oTtwb62C4rDYR8nJZxN8NFhAtnr2uYFKt',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5swtuQhJQFid8uMd3DsegoxFKXVS8WoiiB3t9Pos9UHj',
    poolPcTokenAccount: 'Eqbux46eaW4aZiuy6VUX6z7MJ2TsszeSA7TPnpdw3jVf',
    poolWithdrawQueue: 'Hwtv6M9iTJc8SH49WjQx5rbRwzAryGm8f1NSQDmnY2iq',
    poolTempLpTokenAccount: '7YXJQ4rM59A69ow3M21MKbWEEKHbNeZQ1XFESVnbwEPx',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8BdpjpSD5n3nk8DQLqPUyTZvVqFu6kcff5bzUX5dqDpy',
    serumBids: 'DriSFYDLxWCEHcnFVaxKu2NrsWGB2htWhD1wkp39qxwU',
    serumAsks: 'jd3YYp9WqjzyPxhBvj4ixa4DY3bCG1b74VquM4oCUbH',
    serumEventQueue: 'J82jqHzNAzVYs9ZV3zuRgzRKuu1nGDFMrzJwdxvipjXk',
    serumCoinVaultAccount: '9tQtmWT3LCbVEoHFK5WK93wmDXv4us5s7NRYhficg9ih',
    serumPcVaultAccount: 'HRFqUnxuegNbAf2auxqRwECyDijkVGDw25BCJkf5ohM5',
    serumVaultSigner: '7i7rf8LANeECyi8TAwwLTyvfiVUo4x12iJtKeeA6eG53',
    official: true
  },
  {
    name: 'LINK-USDC',
    coin: { ...TOKENSBASE.LINK },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['LINK-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Hr8i6MAm4W5Lwb2fB2CD44A2t3Ag3gGc1rmd6amrWsWC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G4WdXwbczwDSs6iQmYt1F3sHDhfL6aD2uBkbAoMaaTt4',
    ammTargetOrders: 'Hf3g2Q63UPSLFSCKZBPJvjVVZxVr83rXm1xWR7yC6spn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2ueuL35kQShG1ebZz3Cov4ug9Ex6xVXx4Fc4ZKvxFqMz',
    poolPcTokenAccount: '66JxeTwodpafkYLPYYAFoVoTh6ukNYoHvtwMMSzSPBCb',
    poolWithdrawQueue: 'AgVo29AiDosdiXysfwMj8bF2AyD1Nvmn971x8PLwaNAA',
    poolTempLpTokenAccount: '58EPUPaefpjDxUppc4oyDeDGc9n7sUo7vapinKXigbd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3hwH1txjJVS8qv588tWrjHfRxdqNjBykM1kMcit484up',
    serumBids: 'GhmGNpJhGDz6zhmJ2kskmETbX9SGxhstRsmUejMXC24t',
    serumAsks: '83KiGivH1w4SiSK9YoN9WZrTSmtwveuCUd1nuZ9AFd2V',
    serumEventQueue: '9ZZ8eGhTEYK3uBNaFWSYo6ugLD6UVvudxpFXff7XSrmx',
    serumCoinVaultAccount: '9BswoEnX3SN7YUnRujZa5ygiL8AXVHXE4xqp8USX4QSY',
    serumPcVaultAccount: '9TibPFxakkdogUYizRhj9Av92fxuY2HxS3nrmme81Sma',
    serumVaultSigner: '8zqs77myZg6wkPjbh9YdSKtNmfPh4FJTzeo9R39mbjCm',
    official: true
  },
  {
    name: 'ETH-USDC',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['ETH-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AoPebtuJC4f2RweZSxcVCcdeTgaEXY64Uho8b5HdPxAR',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7PwhFjfFaYp7w9N8k2do5Yz7c1G5ebp3YyJRhV4pkUJW',
    ammTargetOrders: 'BV2ucC7miDqsmABSkXGzsibCVWBp7gGPcvkhevDSTyZ1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'EHT99uYfAnVxWHPLUMJRTyhD4AyQZDDknKMEssHDtor5',
    poolPcTokenAccount: '58tgdkogRoMsrXZJubnFPsFmNp5mpByEmE1fF6FTNvDL',
    poolWithdrawQueue: '9qPsKm82ZFacGn4ipV1DH85k7efP21Zbxrxbxm5v3GPb',
    poolTempLpTokenAccount: '2WtX2ow4h5FK1vb8VjwpJ3hmwmYKfJfa1hy1rcDBohBT',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4tSvZvnbyzHXLMTiFonMyxZoHmFqau1XArcRCVHLZ5gX',
    serumBids: '8tFaNpFPWJ8i7inhKSfAcSestudiFqJ2wHyvtTfsBZZU',
    serumAsks: '2po4TC8qiTgPsqcnbf6uMZRMVnPBzVwqqYfHP15QqREU',
    serumEventQueue: 'Eac7hqpaZxiBtG4MdyKpsgzcoVN6eMe9tAbsdZRYH4us',
    serumCoinVaultAccount: '7Nw66LmJB6YzHsgEGQ8oDSSsJ4YzUkEVAvysQuQw7tC4',
    serumPcVaultAccount: 'EsDTx47jjFACkBhy48Go2W7AQPk4UxtT4765f3tpK21a',
    serumVaultSigner: 'C5v68qSzDdGeRcs556YoEMJNsp8JiYEiEhw2hVUR8Z8y',
    official: true
  },
  {
    name: 'xCOPE-USDC',
    coin: { ...TOKENSBASE.xCOPE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['xCOPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '3mYsmBQLB8EZSjRwtWjPbbE8LiM1oCCtNZZKiVBKsePa',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4tN7g8KbPt5bU9YDpeAsUNs2FY4G6GRvajTwCCHXt9Lk',
    ammTargetOrders: 'Fe5ZjyEhnB7mCgFhRkSLWNgvtkrut4iRzk1ydfJxwA9b',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Guw4ErphtZQRC1foic6WweDSvA9AfuqJHKDXDcbrWH4f',
    poolPcTokenAccount: '86WgydpDUFRWa9aHzd9JgcKBELPJZVrkZ3uwxiiC3w2V',
    poolWithdrawQueue: 'Gvmc1zR72pdgoWSzNBqMyNoVHe78nxKgd7FSCE422Lcp',
    poolTempLpTokenAccount: '6FpDRYsKds3WkiCLjqpDzNBHWZP2Bz6CK9dZryBLKB9D',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7MpMwArporUHEGW7quUpkPZp5L5cHPs9eKUfKCdaPHq2',
    serumBids: '5SZ6xDgLzp3QbzkqT68BBAB7orCezSsV5Gb9eAk84zdY',
    serumAsks: 'Gwt93Xzp8aFrP8YFV8YSuHmYbkrGURBVVHnE6AqDT4Hp',
    serumEventQueue: 'Ea4bQ4wBJ5MXAwTG1hKzEv1zry5WnGY2G58YR8hcZTk3',
    serumCoinVaultAccount: '6LtcYXZVb7zfQG33F5dCDKZ29hyQaUh6BBhWjdHp8moy',
    serumPcVaultAccount: 'FCqm5xfy8ZvMxifVFfSz9Gxv1CTRABVMyLXuJrWvzAq7',
    serumVaultSigner: 'XoGZnpfyqj539wneBe8xUQyD282mwy5AMUaChz12JCH',
    official: true
  },
  {
    name: 'SOL-USDT',
    coin: { ...NATIVE_SOL },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['SOL-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '7XawhbbxtsRcQA8KTkHT9f9nc6d69UwqCDh6U5EEbEmX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4NJVwEAoudfSvU5kdxKm5DsQe4AAqG6XxpZcNdQVinS4',
    ammTargetOrders: '9x4knb3nuNAzxsV7YFuGLgnYqKArGemY54r2vFExM1dp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '876Z9waBygfzUrwwKFfnRcc7cfY4EQf6Kz1w7GRgbVYW',
    poolPcTokenAccount: 'CB86HtaqpXbNWbq67L18y5x2RhqoJ6smb7xHUcyWdQAQ',
    poolWithdrawQueue: '52AfgxYPTGruUA9XyE8eF46hdR6gMQiA6ShVoMMsC6jQ',
    poolTempLpTokenAccount: '2JKZRQc92TaH3fgTcUZyxfD7k7V7BMqhF24eussPtkwh',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
    serumBids: '2juozaawVqhQHfYZ9HNcs66sPatFHSHeKG5LsTbrS2Dn',
    serumAsks: 'ANXcuziKhxusxtthGxPxywY7FLRtmmCwFWDmU5eBDLdH',
    serumEventQueue: 'GR363LDmwe25NZQMGtD2uvsiX66FzYByeQLcNFr596FK',
    serumCoinVaultAccount: '29cTsXahEoEBwbHwVc59jToybFpagbBMV6Lh45pWEmiK',
    serumPcVaultAccount: 'EJwyNJJPbHH4pboWQf1NxegoypuY48umbfkhyfPew4E',
    serumVaultSigner: 'CzZAjoEqA6sjqtaiZiPqDkmxG6UuZWxwRWCenbBMc8Xz',
    official: true
  },
  {
    name: 'YFI-USDT',
    coin: { ...TOKENSBASE.YFI },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['YFI-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '81PmLJ8j2P8CC5EJAAhWGYA4HgJvoKs4Y94ALZF2uKKG',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'pxedkTHh23HBYoarBPKML3xWh96EaNzKLW3oXvHHCw5',
    ammTargetOrders: 'GUMQZC9SAqynDvoV12sRUzACF8GzLpC5fUtRuzwCbU9S',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GwY3weBBK4dQFwC96tHAoAQq4pSfMYmMZ4m6Njqq7Wbk',
    poolPcTokenAccount: 'Bs3DatsVrDujvjpV1JUVmVgNrPkaVwvp6WtuHz4z1QE6',
    poolWithdrawQueue: '2JJPww9oCvBxTdZaiB2H69Jx4dKWctCEuvbLtFfNCqHd',
    poolTempLpTokenAccount: 'B46wMQncJ2Ugp2NwWDxK6Qd4Q9T24NK3naNVdyVYxbug',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3Xg9Q4VtZhD4bVYJbTfgGWFV5zjE3U7ztSHa938zizte',
    serumBids: '7FN1TgMmjQ8iwTdmJZAiwdTM3MddvxmgiF2J4GVHUtQ1',
    serumAsks: '5nudyjGUfjwVYCk1MzzuBeXcj9k59g9mruAUXrsQfcrR',
    serumEventQueue: '4AMp4qKTwE7RwExstg7Pk4JZwJGeRMnjkFmf52tqCHJN',
    serumCoinVaultAccount: '5KgKdCWVyWi9YJ6GipzozhWxAvnbQPpUtaxuMXXEn3Zs',
    serumPcVaultAccount: '29CnTKiFKwGPFfLBXDXGRX6ywGz3ToZfqZuLkoa33dbE',
    serumVaultSigner: '6LRcCMsRoGsye95Ck5oSyNqHJW8kk2iXt9z9YQyi9JkV',
    official: true
  },
  {
    name: 'SRM-USDT',
    coin: { ...TOKENSBASE.SRM },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['SRM-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'af8HJg2ffWoKJ6vKvkWJUJ9iWbRR83WgXs8HPs26WGr',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8E2GLzSgLmzWdpdXjjEaHbPXRXsA5CFehg6FP6N39q2e',
    ammTargetOrders: '8R5TVxXvRfCaYvT493FWAJyLt8rVssUHYVGbGupAbYaQ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'D6b4Loa4LoidUor2ffouE5BTMt6tLP6MtkNrsfBWG2C3',
    poolPcTokenAccount: '4gNeJniq6yqEygFmbAJa82TQjH1j3Fczm4bdeBHhwGJ1',
    poolWithdrawQueue: 'D3JQytXAydpHKUPChDe8JXdmvYRRV4EpnrxsqzMHNjFp',
    poolTempLpTokenAccount: '2dYW9SoJb51YNneQG7AywSB75jmzZa2R8rzzW7gT61h1',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AtNnsY1AyRERWJ8xCskfz38YdvruWVJQUVXgScC1iPb',
    serumBids: 'EE2CYFBSoMvcUR9mkEF6tt8kBFhW9zcuFmYqRM9GmqYb',
    serumAsks: 'nkNzrV3ZtkWCft6ykeNGXXCbNSemqcauYKiZdf5JcKQ',
    serumEventQueue: '2i34Kriz23ZaQaJK6FVhzkfLhQj8DSqdQTmMwz4FF9Cf',
    serumCoinVaultAccount: 'GxPFMyeb7BUnu2mtGV2Zvorjwt8gxHqwL3r2kVDe6rZ8',
    serumPcVaultAccount: '149gvUQZeip4u8bGra5yyN11btUDahDVHrixzknfKFrL',
    serumVaultSigner: '4yWr7H2p8rt11QnXb2yxQF3zxSdcToReu5qSndWFEJw',
    official: true
  },
  {
    name: 'FTT-USDT',
    coin: { ...TOKENSBASE.FTT },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['FTT-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4fgubfZVL6L8tc5x1j65S14P2Tnxr1YayKtKavQV5MBo',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BSDKUy73wuGskKDVgzNGLL2k7hzDEwj237nZZ3Ch3bwz',
    ammTargetOrders: '4j1JaKap2s4XrkJeMDaMabfEDsQm9ykeUgJ9CWa9w4JU',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HHTXo4Q8HFWMSDKnPJWCe1Y5UmYPFNZ6hU4mc8km7Zf4',
    poolPcTokenAccount: '5rbAHV9ufT11XRR5LcvMVsuA5FcpBozLKj91z372wpZR',
    poolWithdrawQueue: 'AMU4FFUUahWfaUA6WWzTWNNuiXoNDEgNNsZjFLWhvB8f',
    poolTempLpTokenAccount: 'FUVUCrKB6c7x9uVn1zK8qxbVwb6rNLqA2W17TM9Bhvta',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Hr3wzG8mZXNHV7TuL6YqtgfVUesCqMxGYCEyP3otywZE',
    serumBids: '3k5bWdYn9thQmqrye2gSobzFBYTyYosx3bKvMJRcfTTN',
    serumAsks: 'DPW1r1p2uyfQxVC7vx3xVQcVvyUeiS2vhAnveQiXs9AT',
    serumEventQueue: '9zMcCfjdHH2Z7iCBtVdkmf9qXUN6y7AhbuWhRMu2DmcV',
    serumCoinVaultAccount: 'H1VJqo3piiadyVAUQW6yfZq4an8pgDFvAdqHJkRXMDbq',
    serumPcVaultAccount: '9SQ4Sjsszt59X3aLwRrTqa5SLxonEdXk5jF7KUfAxc8Z',
    serumVaultSigner: 'CgV9LcnAukrgDZmqhUwcNQ31z4KEjZEz4DHUSE4bRaVg',
    official: true
  },
  {
    name: 'BTC-USDT',
    coin: { ...TOKENSBASE.BTC },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['BTC-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AMMwkf57c7ZsbbDCXvBit9zFehMr1xRn8ZzaT1iDF18o',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G5rZ4Qfv5SxpJegVng5FuZftDrJkzLkxQUNjEXuoczX5',
    ammTargetOrders: 'DMEasFJLDw27MLkTBFqSX2duvV5GV6LzwtoVqVfBqeGR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7KwCHoQ9nqTnGea4XrcfLUr1pwEWp2maGBHWFqBTeoKW',
    poolPcTokenAccount: 'HwbXe9YJVez3BKK22jBH1i64YeX2fSKaYny5jrcPDxAk',
    poolWithdrawQueue: '3XUXNx72jcaXB3N56UjrtWwxv99ivqUwLAdkagvop4HF',
    poolTempLpTokenAccount: '8rZSQ23HWfZ1P6qd9ZL4ywTgRYtRZDd3xW3aK1hY7pkR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C1EuT9VokAKLiW7i2ASnZUvxDoKuKkCpDDeNxAptuNe4',
    serumBids: '2e2bd5NtEGs6pb758QHUArNxt6X9TTC5abuE1Tao6fhS',
    serumAsks: 'F1tDtTDNzusig3kJwhKwGWspSu8z2nRwNXFWc6wJowjM',
    serumEventQueue: 'FERWWtsZoSLcHVpfDnEBnUqHv4757kTUUZhLKBCbNfpS',
    serumCoinVaultAccount: 'DSf7hGudcxhhegMpZA1UtSiW4RqKgyEex9mqQECWwRgZ',
    serumPcVaultAccount: 'BD8QnhY2T96h6KwyJoCT9abMcPBkiaFuBNK9h6FUNX2M',
    serumVaultSigner: 'EPzuCsSzHwhYWn2j69HQPKWuWz6wuv4ANZiVigLGMBoD',
    official: true
  },
  {
    name: 'SUSHI-USDT',
    coin: { ...TOKENSBASE.SUSHI },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['SUSHI-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DWvhPYVogsEKEsehHApUtjhP1UFtApkAPFJqFh2HPmWz',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ARZWhFKLtqubNWdotvqeiTTpmBw4XfrySNtY4485Zmq',
    ammTargetOrders: 'J8f8p2x3wPTbpaqJydxTY5CvxtiB8HrMdW1DouaEVvRx',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'C77d7jRkxu3WyzL7K2UZZPdWXPzsFrmzLG4uHrsZhGTz',
    poolPcTokenAccount: 'BtweN6cYHBntMJiRY2gGB2u4oZFsbapjLz7QJeV3KWF1',
    poolWithdrawQueue: '6WsofMBNdHWacgButviYgn8CCTGyjW19H13vYntkzBzp',
    poolTempLpTokenAccount: 'CgaVy8TjkUdxFhi4h3RdszmPtf6MPUyfquqAWUwAnim7',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6DgQRTpJTnAYBSShngAVZZDq7j9ogRN1GfSQ3cq9tubW',
    serumBids: '7U3FPNGvcDkmfnD4u5jKVd2AKwc66RFBZ8GnyjzeNfML',
    serumAsks: '3Zx74FxHwttDuYxeqHzMijitrf25FhSzeoWBT9VeCrVj',
    serumEventQueue: '9PqaWBQ6gSZDZsztbWTnXp6LfrS2TUfVfPTSnf8tbgkE',
    serumCoinVaultAccount: '5LmHe3x8VwGzWZ6rooARZJNMo6AaN1P73478AuhBUjUr',
    serumPcVaultAccount: 'iLCNUheHbq3bE1868XwWXs8enoTvjFnwpnmLFmBQGi3',
    serumVaultSigner: '9GN4139oezNfddWhcAc3c8Ke5aU4cwzcxL8cLkqE37Yy',
    official: true
  },
  {
    name: 'TOMO-USDT',
    coin: { ...TOKENSBASE.TOMO },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['TOMO-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GjrXcSvwzGrz1RwKYGVWdbZyXzyotgichSHB95moDmf8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6As7AcwxnvawiY4mKnVTYqjTSRe9Uu2yW5hhJB97Ur6y',
    ammTargetOrders: 'BPU6CpQ9RVrftpofrXD3Gui5iNXpbiNiCm9ecQUahgH6',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8Ev8a9a8ZQi2xHYa7fwkYqzrmMrwbnUf6D9z762zAWcF',
    poolPcTokenAccount: 'DriE8fPjPcTf7jzzyMqnQYqBPAVQPNS6bjZ4EABEJPUd',
    poolWithdrawQueue: 'CR4AmK8geX2e1VLdFKgC2raxMwB4JsVUKXd3mBGkv4YW',
    poolTempLpTokenAccount: 'GLXgb5oGNHQAVr2t68sET3NGPBtDitE5cQaMG3zgc7D8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GnKPri4thaGipzTbp8hhSGSrHgG4F8MFiZVrbRn16iG2',
    serumBids: '7C1XnffUgQVnfRTUPBPxQQT1QKsHwnQ7ogAWmmJqbW9L',
    serumAsks: 'Hbd8HWXcZDPUUHYXJLH4vn9t1SfQZ83fqf4jQN65QpYL',
    serumEventQueue: '5AB3QbR7Ck5qsn21fM5zBzxVUnyougXroWHeR33bscwH',
    serumCoinVaultAccount: 'P6qAvA6s7DHzzH4i74CUFAzx5bM4Yj3xk5TKmF7eWdb',
    serumPcVaultAccount: '8zFodcf4pKcRBq7Zhdg4tQeB76op7kSjPC2haPjPkDEm',
    serumVaultSigner: 'ECTnLdZEaxUiCwyjKcts3CoMfT4kj3CNfVCd9B18hRim',
    official: true
  },
  {
    name: 'LINK-USDT',
    coin: { ...TOKENSBASE.LINK },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['LINK-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'E9EvurfzdSQaqCFBUaD4MgV93htuRQ93sghm922Pik88',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'CQ9roBWWPV5efTeZHoqgzJJvTSeVNMca6rteaenNwqF6',
    ammTargetOrders: 'DVXgN8m2f8Ggs8zddLZyQdsh49jeUGnLq66s4Lhfd1uj',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BKNf6HxSz9tCmeZts4ABHpYuXwP2wfKf4uRycwdTm3Jh',
    poolPcTokenAccount: '5Uzq3c6rnedxMF7t7s7PJVQkxxZE7YXGFPJUToyhdebY',
    poolWithdrawQueue: 'Hj5vcVZCm6JXtkmCa1MPjteoxzkWQCmHQutXxofj2sy6',
    poolTempLpTokenAccount: '7WhsN9LGSeGxhZPT4E4rczauDvhmfquAKHQUESAXYS3k',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3yEZ9ZpXSQapmKjLAGKZEzUNA1rcupJtsDp5mPBWmGZR',
    serumBids: '9fkA2oJQ7BKP5n2WxdLkY7mDA1mzBrGZ9osqVhvdBkH7',
    serumAsks: 'G8c3xQURJk1oukLqJd3W4SJykmRq4wq3GrSWJwWipECH',
    serumEventQueue: '4MDEwZYKXuvEdQ58yMsE2zwXLG973aYp4EFvoaUSDMP2',
    serumCoinVaultAccount: 'EmS34LncbTGs4yU4GM9bESRYMCFL3JBW6mnAeKB4UtEb',
    serumPcVaultAccount: 'AseZZ8ZRqyvkZMMGAAG8dAqM9XFf2xGX2tWWbko7a4hC',
    serumVaultSigner: 'FezSC2d6sXEcJ9ah8nYxHC18nh4FZzc4u7ZTtRSrk6Nd',
    official: true
  },
  {
    name: 'ETH-USDT',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['ETH-USDT-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'He3iAEV5rYjv6Xf7PxKro19eVrC3QAcdic5CF2D2obPt',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8x4uasC632WSrk3wgwoCWHy7MK7Xo2WKAe9vV93tj5se',
    ammTargetOrders: 'G1eji3rrfRFfvHUbPEEbvnjmJ4eEyXeiJBVbMTUPfKL1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DZZwxvJakqbraXTbjRW3QoGbW5GK4R5nmyrrGrFMKWgh',
    poolPcTokenAccount: 'HoGPb5Rp44TyR1EpM5pjQQyFUdgteeuzuMHtimGkAVHo',
    poolWithdrawQueue: 'EispXkJcfh2PZA2fSXWsAanEGq1GHXzRRtu1DuqADQsL',
    poolTempLpTokenAccount: '9SrcJk8TB4JvutZcA4tMvvkdnxCXda8Gtepre7jcCaQr',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7dLVkUfBVfCGkFhSXDCq1ukM9usathSgS716t643iFGF',
    serumBids: 'J8a3dcUkMwrE5kxN86gsL1Mwrg63RnGdvWsPbgdFqC6X',
    serumAsks: 'F6oqP13HNZho3bhwuxTmic4w5iNgTdn89HdihMUNR24i',
    serumEventQueue: 'CRjXyfAxboMfCAmsvBw7pdvkfBY7XyGxB7CBTuDkm67v',
    serumCoinVaultAccount: '2CZ9JbDYPux5obFXb9sefwKyG6cyteNBSzbstYQ3iZxE',
    serumPcVaultAccount: 'D2f4NG1NC1yeBM2SgRe5YUF91w3M4naumGQMWjGtxiiE',
    serumVaultSigner: 'CVVGPFejAj3A75qPy2116iJFma7zGEuL8DgnxhwUaFBF',
    official: true
  },
  {
    name: 'YFI-SRM',
    coin: { ...TOKENSBASE.YFI },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['YFI-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GDVhJmDTdSExwHeMT5RvUBUNKLwwXNKhH8ndm1tpTv6B',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '5k2VpDkhbvypWvg9erQTZu4KsKjVLe1VAo3K71THrNM8',
    ammTargetOrders: '4dhnWeEq5aeqDFkEa5CKwS2TYrUmTZs7drFBAS656f6e',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8FufHk1xV2j9RpVztnt9vuw9KJ89rpR7FMT1HTfsqyPH',
    poolPcTokenAccount: 'FTuzfUyp6fhLMQ5kUdAkBWd9BjY114DfjkrVocAFKwkQ',
    poolWithdrawQueue: 'A266ybcveVZYraGgEKWb9JqVWVp9Tsxa9hTudzvTQJgY',
    poolTempLpTokenAccount: 'BXHfb8E4KNVnAVvz1eyVS12QqpvBUimtCnnNiBuoMrRa',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6xC1ia74NbGZdBkySTw93wdxN4Sh2VfULtXh1utPaJDJ',
    serumBids: 'EmfyNgr2t1mz6QJoGfs7ytLPpnT3A4kmZj2huGBFHtpr',
    serumAsks: 'HQhD6ZoNfCjvUTfsE8KS46PLC8rpeyBYy1tY4FPgEbpQ',
    serumEventQueue: '4QGAwMgfi5PrMUoHvoSbGQV168kuRMURBK4pwGfSV7nC',
    serumCoinVaultAccount: 'GzZCBp3Z3fYHZW9b4WusfQhp7p4rZXeSNahCpn8HBD9',
    serumPcVaultAccount: 'ANK9Lpi4pUe9SxPvcKvd82jkG6AoKvvgo5kN8BCXukfA',
    serumVaultSigner: '9VAdxQgKNLkHgtQ4fkDetwwTKZG8xVaKeUFQwBVG7c7a',
    official: true
  },
  {
    name: 'FTT-SRM',
    coin: { ...TOKENSBASE.FTT },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['FTT-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '21r2zeCacmm5YvbGoPZh9ZoGREuodhcbQHaP5tZmzY14',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'CimwwQH1h2MKbFbodHHByMq8MreFuJznMGVXxYKMpyiB',
    ammTargetOrders: 'Fewh6hVTfeduAnbqwNuUx2Cu7uTyJTALP76hjpWCvRoV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Atc9Prscs9RLmDEpsCQzFgCqzkscAtTck5ZSZGV9s7hE',
    poolPcTokenAccount: '31ZJVJMap4WpPbzaScPwg5MGRUDjatP2kXVsSgf12yVZ',
    poolWithdrawQueue: 'yAZD46BC1Bti2X5FEjveobueuyevi7jFV5ew6DH8Thz',
    poolTempLpTokenAccount: '7Ro1o6Vbh3Ech2zeozNDicRP1gZfHAWcRnxvrzdnLfYi',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'CDvQqnMrt9rmjAxGGE6GTPUdzLpEhgNuNZ1tWAvPsF3W',
    serumBids: '9NfJWy5QNqRDGmNARphS9kJyYtR6nkkWcFyJRLbgECtd',
    serumAsks: '9VEVBJZHVv6N2MzAzNLiCwN2MAdt5GDScCtpE4zkzDFW',
    serumEventQueue: 'CbnLQT9Jwo3RHpWBnsPisAybSN4CBuwj4fcF1S9qJchV',
    serumCoinVaultAccount: '8qTUSDRxJ65sGKEUu746xJdCquoP38AqKsQo6ZruSSBk',
    serumPcVaultAccount: 'ALe3hiZR35cCjcrzbJi1vKEhNftdVQjwkt4S8rbPZogq',
    serumVaultSigner: 'CAAeuJAgnP368num8bCv6VMWCqMZ4pTANCcGTAMAJtm2',
    official: true
  },
  {
    name: 'BTC-SRM',
    coin: { ...TOKENSBASE.BTC },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['BTC-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DvxLb4NnQUYq1gErk35HVt9g8kxjNbviJfiZX1wqraMv',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3CGxjymeKv5wvpVg9unUgbrGUESmeqfJUJkPjVeRuMvT',
    ammTargetOrders: 'C8YiDYrk4rfC6sgK93zM3YpGj7SDpGuRbos7DHStSssT',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5jV7XQ1JnfUg7RvEShyAdV7Gzn1xS54j163x8ZBSzxuh',
    poolPcTokenAccount: 'HSKY5r6iqCpC4nWzCGP2oWMQdGEQsx69eBm33PrmZqhg',
    poolWithdrawQueue: '5faTQUz7gmasinkinA7BkC6HsG8hUrD9iukaohF2fuHZ',
    poolTempLpTokenAccount: '9QutovnPtwN9pPxsTdaEWBSCT7iTKc3hwMfF4QJHDXRz',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HfsedaWauvDaLPm6rwgMc6D5QRmhr8siqGtS6tf2wthU',
    serumBids: 'GMM36fgidwYvXCAxQhpT1XkGoZ46g1wMc44hY8ds3P8u',
    serumAsks: 'BFDQ4WGcEftURk6nrwtQ1GzYdPYj8fx3iBjeJVt6S3jQ',
    serumEventQueue: '94ER3KZeDrYSG8TytGJ56rZK9zM8oz1H8dJ2LP1gHn2s',
    serumCoinVaultAccount: '3ABvHYBeWrpgP82jvHh5TVwid1AjDj9rei7zfY8xh2wz',
    serumPcVaultAccount: 'CSpdPdzzbaNWgwhPRTZ4TNoYS6Vco2w1s7jvqUsYQBzf',
    serumVaultSigner: '9o8LaPeTMJBoYyoUVNm6ju6c5rwfphhYReQsp1vTTyRg',
    official: true
  },
  {
    name: 'SUSHI-SRM',
    coin: { ...TOKENSBASE.SUSHI },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['SUSHI-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BLVjPTgzyfiKSgDujTNKKNzW2GXx7HhdMxgr2LQ2g83s',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Efpi6e4ckqtfaED9gRmadN3RtiTXDtGPrp1szsh7sj7C',
    ammTargetOrders: 'BZUFGpRWEsYzpVfLrFpdE7E9fzGhrySQE1TrsX92qWAC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BjWKHZxVMQykmGGmkhA1m9QQycJTeQFs51kyfP1zQvzv',
    poolPcTokenAccount: 'EnWaAD7WAyznuRjg9PqRr2vVaXqQpTje2fBWyFFEvr37',
    poolWithdrawQueue: 'GbEc9D11VhEHCDsqcSZ5vPVfnzV7BCS6eTquoVvhSaNz',
    poolTempLpTokenAccount: 'AQ4YUkqPSbP8JpnCWEAkYNUWm6AjUSnPucKhVN8ypuiB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FGYAizUhNEC9GBmj3UyxdiRWmGjR3TfzMq2dznwYnjtH',
    serumBids: 'J9weS4eF3DcSMLttazndEwVtjsqfRf6vBg1FNhdYrKiW',
    serumAsks: '4TCPXw9UBcPfSVtaArzydHvgAXfDbq28iZVjHidbM9rp',
    serumEventQueue: '2eJU3EygyV4SWGAH1g5F57CxtaTj4nL36apaRtnEZ9zH',
    serumCoinVaultAccount: 'BSoAoNFKzK65TjcUpY5JZHBvZVMiYnkdo9upy3mLSTpq',
    serumPcVaultAccount: '8U9azb65o1dJuMs7je987i7hKxJfPZnbNRNeH5beJfo7',
    serumVaultSigner: 'HZtDGZsz2fdXF75H8tyB8skp5a4rvoawgxwXqHTGEdvU',
    official: true
  },
  {
    name: 'TOMO-SRM',
    coin: { ...TOKENSBASE.TOMO },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['TOMO-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DkMAuUCQHC6BNgVnjtM5ZTKm1T8MsriQ6bL3Umi6NBtG',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '34eRiATmb9Ktv1QTDzzckyaFhj4KpC2y94TJXXd34erL',
    ammTargetOrders: 'CK2vFsmS2CEZ2Hi6Vf9px8p5DSpoyXST9rkFHwbbHirU',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8BjTHZccnRNZKZpAxsdXx5BEQ4Kpxd9pQLNgeMqMiTZL',
    poolPcTokenAccount: 'DxcJXkGo8BUmsky51LuKi4Vs1zW48fHrCXEY6BKuY3TY',
    poolWithdrawQueue: 'AoP3EXWypUheq9ZURDBpf8Jd1ijRuhUCQg1uiM5zFpB5',
    poolTempLpTokenAccount: '9go7YtJ6QdG3mWgVhwRcQAfmwPruJk5MmsjyTn2HJisK',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7jBrpiq3w2ywzzb54K9SoosZKy7nhuSQK9XrsgSMogFH',
    serumBids: 'ECdZLJGwcN6fXY9BjiSVNrWssKdWejW9uv8Zs6GkkxBG',
    serumAsks: 'J5NN79kpFzGdxj8MGvis3NsGYcrvcdYHNXLtGGn9au5E',
    serumEventQueue: '7FrdprBxpDyM7P1AkeMtEJ75Q6UK6ZE92zgqGg5F4Gxb',
    serumCoinVaultAccount: '8W65Bwb83MYKHf82phS9xPUDsR6RpZbAXnSELxsBb3HH',
    serumPcVaultAccount: '5rjDHBsjFv3Z3Dxr5RMj98vj6LA5DNEwZGDM8wyUF1Hy',
    serumVaultSigner: 'EJfMPPTvTKtgj7PUaM17bp2Gbye9CdKjZ5yqonPyY4rB',
    official: true
  },
  {
    name: 'LINK-SRM',
    coin: { ...TOKENSBASE.LINK },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['LINK-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '796pvggjoDCPUtUSVFSCLqPRyes5YPvRiu4zFWX582wf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3bZB7mZ5hRNZfrJx6BL5C4GhP4nT14rEAGVPXL34hrZg',
    ammTargetOrders: 'Ha4yLJU1UrZi8MqCMu2pLK3xXREG1GW1bjjqTsjQnC3c',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5eTUmVN3kXqBeKHUA2kWU19jB7kFN3wpejWvWYcw6dBa',
    poolPcTokenAccount: '4BsmBxNQtuKgBTNjci8tWd2NqPxXBs2JY38X26epSHYy',
    poolWithdrawQueue: '2jn4FQ2CtYwXDgCcLbNrGUzKFeB5PpPbnMr2x2z2wz3V',
    poolTempLpTokenAccount: '7SxKHHATjgEgfxnLrtKaSU77s2ABqD8BoEr6W6dFMS3a',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FafaYTnhDbLAFsr5qkD2ZwapRxaPrEn99z59UG4zqRmZ',
    serumBids: 'HyKmFiuoWZo7STLjvJJ66YR4V1wauAorCPUaxnnB6umk',
    serumAsks: '8qjKdvjmBPZWjxP3nWjwFCcsrAspCN5EyTD3WfgKbFj4',
    serumEventQueue: 'FWZB7PJLwg7WdgoVBRrkvz2A4S7ZctKnoGj1yCSxqs9G',
    serumCoinVaultAccount: '8J7iJ4uidHscVnNGsEgiEPJsUqrfteN7ifMscB9h4dAq',
    serumPcVaultAccount: 'Bw7SrqDqvAXHi2yphAniH3uBw9N7J6vVi7jMH9B2KYWM',
    serumVaultSigner: 'CvP4Jk6AYBV6Kch6w6FjwuMqHAugQqVrqCNp1eZmGihB',
    official: true
  },
  {
    name: 'ETH-SRM',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['ETH-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '3XwxHcbyqcd1xkdczaPv3TNCZsevELD4Zux3pu4sF2D8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FBfaqV1RRacEi27E3dm8yLcxpbWYx4BzMXG4zMNx7ZdS',
    ammTargetOrders: 'B1gQ6FHLxmBzznDKn8Rj1ZokcJtdSWjkCoXdQLRhz8NS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CsFFjzC1hmpqimExTj8g4kregUxGnGrEWX9Jhne172uU',
    poolPcTokenAccount: 'ACg55oVWt1a4ZVxnFVCRDEMz1JAeGY13snXufdQAp4pX',
    poolWithdrawQueue: 'C6MRGfZ13tstxjcWuLqUseUikidsAjgk7zBEYqM6cFb4',
    poolTempLpTokenAccount: 'EVRzNkPU9UAzBf8XhJYD84U7petDZnSMVaaa9mtBQaM6',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3Dpu2kXk87mF9Ls9caWCHqyBiv9gK3PwQkSvnrHZDrmi',
    serumBids: 'HBVsrbKLEf1aaUy9oKFkQZVDtgTf54T9H8FQdcGbF7EH',
    serumAsks: '5T3zDaT1XvfEb9jKcgpFyQRze9qWKNTE1iSE5aboxYZy',
    serumEventQueue: '3w11TRux1gX7nqaGUMGpPH9ocDBPudeLTw6k1uhsLo2k',
    serumCoinVaultAccount: '58jqhCZ11r6ZvATqdGfDXPk7LmiR9HS3jQt7kuoBx5CH',
    serumPcVaultAccount: '9NLpT5aZtbbauvEVVFsHqigv2ekTEPK1kojoMMCw6Hhx',
    serumVaultSigner: 'EC5JsbaQVp8tM59TqkQBk4Yv7bzLQq3TrzpepjGr9Ecg',
    official: true
  },
  {
    name: 'SRM-SOL',
    coin: { ...TOKENSBASE.SRM },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['SRM-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EvWJC2mnmu9C9aQrsJLXw8FhUcwBzFEUQsP1E5Y6a5N7',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '9ot4bg8aT2FRKfiRrM2fSPHEr7M1ihBqm1iT4771McqR',
    ammTargetOrders: 'AfzGtG3XnMixxJTx2rwoWLXKVaWoFMhsMeYo929BrUBY',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BCNYwsnz3yXvi4mY5e9w2RmZvwUW3pefzYQ4tsoNdDhp',
    poolPcTokenAccount: '7BXPSUXeBVqJGyxW3yvkNxnJjYHuC8mnhyFCDp2abAs6',
    poolWithdrawQueue: 'HYo9FfBpm8NCpR8qYMGYFZNqzKkXDRFACLxu8PXCCDc4',
    poolTempLpTokenAccount: 'AskrcNfMDKT5c65AYeuEBW6mfMXfT3SG4nDCDRAyEnad',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'jyei9Fpj2GtHLDDGgcuhDacxYLLiSyxU4TY7KxB2xai',
    serumBids: '4ZTJfhgKPizbkFXNvTRNLEncqg85yJ6pyT7NVHBAgvGw',
    serumAsks: '7hLgwZhHD1MRNyiF1qfAjfkMzwvP3VxQMLLTJmKSp4Y3',
    serumEventQueue: 'nyZdeD16L5GxJq7Pso8R6KFfLA8R9v7c5A2qNaGWR44',
    serumCoinVaultAccount: 'EhAJTsW745jiWjViB7Q4xXcgKf6tMF7RcMX9cbTuXVBk',
    serumPcVaultAccount: 'HFSNnAxfhDt4DnmY9yVs2HNFnEMaDJ7RxMVNB9Y5Hgjr',
    serumVaultSigner: '6vBhv2L33KVJvAQeiaW3JEZLrJU7TtGaqcwPdrhytYWG',
    official: true
  },
  {
    name: 'STEP-USDC',
    coin: { ...TOKENSBASE.STEP },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['STEP-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EXgME2sUuzBxEc2wuyoSZ8FZNZMC3ChhZgFZRAW3nCQG',
    ammTargetOrders: '78bwAGKJjaiPQqmwKmbj4fhrRTLAdzwqNwpFdpTzrhk1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8Gf8Cc6yrxtfUZqM2vf2kg5uR9bGPfCHfzdYRVBAJSJj',
    poolPcTokenAccount: 'ApLc86fHjVbGbU9QFzNPNuWM5VYckZM92q6sgJN1SGYn',
    poolWithdrawQueue: '5bzBcB7cnJYGYvGPFxKcZETn6sGAyBbXgFhUbefbagYh',
    poolTempLpTokenAccount: 'CpfWKDYNYfvgk42tqR8HEHUWohGSJjASXfRBm3yaKJre',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S',
    serumBids: '5Xdpf7CMGFDkJj1smcVQAAZG6GY9gqAns18QLKbPZKsw',
    serumAsks: '6Tqwg8nrKJrcqsr4zR9wJuPv3iXsHAMN65FxwJ3RMH8S',
    serumEventQueue: '5frw4m8pEZHorTKVzmMzvf8xLUrj65vN7wA57KzaZFK3',
    serumCoinVaultAccount: 'CVNye3Xr9Jv26c8TVqZZHq4F43BhoWWfmrzyp1M9YA67',
    serumPcVaultAccount: 'AnGbReAhCDFkR83nB8mXTDX5dQJFB8Pwicu6pGMfCLjt',
    serumVaultSigner: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
    official: true
  },
  {
    name: 'MEDIA-USDC',
    coin: { ...TOKENSBASE.MEDIA },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['MEDIA-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '94CQopiGxxUXf2avyMZhAFaBdNatd62ttYGoTVQBRGdi',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EdS5vqjihxRbRujPkqqzHYwBqcTP9QPbrBc9CDtnBDwo',
    ammTargetOrders: '6Rfew8qvNp97PVN14C9Wg8ybqRdF9HUEUhuqqZBWcAUW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7zfTWDFmMi3Tzbbd3FZ2vZDdBm1w7whiZq1DrCxAHwMj',
    poolPcTokenAccount: 'FWUnfg1hHuanU8LxJv31TAfEWSvuWWffeMmHpcZ9BYVr',
    poolWithdrawQueue: 'F7MUnGrShtQqSvi9DoWyBNRo7FUpRiYPsS9aw77auhiS',
    poolTempLpTokenAccount: '7oX2VcPYwEV6EUUyMUoTKVVxAPAvGQZcGiGzotX43wNM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FfiqqvJcVL7oCCu8WQUMHLUC2dnHQPAPjTdSzsERFWjb',
    serumBids: 'GmqbTDL5QSAhWL7UsE8MriTHSnodWM1HyGR8Cn8GzZV5',
    serumAsks: 'CrTBp7ThkRRYJBL4tprke2VbKYj2wSxJp3Q1LDoHcQwP',
    serumEventQueue: 'HomZxFZNGmH2XedBavMsrXgLnWFpMLT95QV8nCYtKszd',
    serumCoinVaultAccount: 'D8ToFvpVWmNnfJzjHuumRJ4eoJc39hsWWcLtFZQpzQTt',
    serumPcVaultAccount: '6RSpnBYaegSKisXaJxeP36mkdVPe9SP3p2kDERz8Ahhi',
    serumVaultSigner: 'Cz2m3hW2Vcb8oEFz12uoWcdq8mKb9D1N7RTyXpigoFXU',
    official: true
  },
  {
    name: 'ROPE-USDC',
    coin: { ...TOKENSBASE.ROPE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['ROPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BuS4ScFcZjEBixF1ceCTiXs4rqt4WDfXLoth7VcM2Eoj',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ASkE1yKPBei2aUxKHrLRptB2gpC3a6oTSxafMikoHYTG',
    ammTargetOrders: '5isDwR41fBJocfmcrcfwRtTnmSf7CdssdpsmBy2N2Eym',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3mS8mb1vDrD45v4zoxbSdrvbyVM1pBLM31cYLT2RfS2U',
    poolPcTokenAccount: 'BWfzmvvXhQ5V8ZWDMC4u82sEWgc6HyRLnq6nauwrtz5x',
    poolWithdrawQueue: '9T1cwwE5zZr3D2Rim8e5xnJoPJ9yKbTXvaRoxeVoqffo',
    poolTempLpTokenAccount: 'FTFx4Vg6hgKLZMLBUvazvPbM7AzDe5GpfeBZexe2S6WJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4Sg1g8U2ZuGnGYxAhc6MmX9MX7yZbrrraPkCQ9MdCPtF',
    serumBids: 'BDYAnAUSoBTtX7c8TKHeqmSy7U91V2pDg8ojvLs2fnCb',
    serumAsks: 'Bdm3R8X7Vt1FpTruE9SQVESSd3BjAyFhcobPwAoK2LSw',
    serumEventQueue: 'HVzqLTfcZKVC2PanNpyt8jVRJfDW8M5LgDs5NVVDa4G3',
    serumCoinVaultAccount: 'F8PdvS5QFhSqgVdUFo6ivXdXC4nDEiKGc4XU97ZhCKgH',
    serumPcVaultAccount: '61zxdnLpgnFgdk9Jom5f6d6cZ6cTbwnC6QqmJag1N9jB',
    serumVaultSigner: 'rCFXUwdmQvRK9jtnCip3SdDm1cLn8nB6HHgEHngzfjQ',
    official: true
  },
  {
    name: 'MER-USDC',
    coin: { ...TOKENSBASE.MER },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['MER-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BkfGDk676QFtTiGxn7TtEpHayJZRr6LgNk9uTV2MH4bR',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FNwXaqyYNKNwJ8Qc39VGzuGnPcNTCVKExrgUKTLCcSzU',
    ammTargetOrders: 'DKgXbNmsm1uCJ2eyh6xcnTe1G6YUav8RgzaxrbkG4xxe',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6XZ1hoJQZARtyA17mXkfnKSHWK2RvocC3UDNsY7f4Lf6',
    poolPcTokenAccount: 'F4opwQUoVhVRaf3CpMuCPpWNcB9k3AXvMMsfQh52pa66',
    poolWithdrawQueue: '8mqpqWGL7W2xh8B1s6XDZJsmPuo5zRedcM5sF55hhEKo',
    poolTempLpTokenAccount: '9ex6kCZsLR4ZbMCN4TcCuFzkw8YhiC9sdsJPavsrqCws',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'G4LcexdCzzJUKZfqyVDQFzpkjhB1JoCNL8Kooxi9nJz5',
    serumBids: 'DVjhW8nLFWrpRwzaEi1fgJHJ5heMKddssrqE3AsGMCHp',
    serumAsks: 'CY2gjuWxUFGcgeCy3UiureS3kmjgDSRF59AQH6TENtfC',
    serumEventQueue: '8w4n3fcajhgN8TF74j42ehWvbVJnck5cewpjwhRQpyyc',
    serumCoinVaultAccount: '4ctYuY4ZvCVRvF22QDw8LzUis9yrnupoLQNXxmZy1BGm',
    serumPcVaultAccount: 'DovDds7NEzFn493DJ2yKBRgqsYgDXg6z38pUGXe1AAWQ',
    serumVaultSigner: 'BUDJ4F1ZknbZiwHb6xHEsH6o1LuW394DE8wKT8CoAYNF',
    official: true
  },
  {
    name: 'COPE-USDC',
    coin: { ...TOKENSBASE.COPE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['COPE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DiWxV1SPXPNJRCt5Ao1mJRAxjw97hJVyj8qGzZwFbAFb',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'jg8ayFZLH2cEUJULUirWy7wNggN1eyRnTMt6EjbJUun',
    ammTargetOrders: '8pE4fzFzRT6aje7B3hYHXrZakeEqNF2kFmJtxkrxUK9b',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FhjBg8vpVgsiW9oCUxujqoWWSPSRvnWNXucEF1G1F39Z',
    poolPcTokenAccount: 'Dv95skm7AUr33x1p2Bu5EgvE3usB1TxgZoxjBe2rpfm6',
    poolWithdrawQueue: '4An6jy1JocXGUjayXqVTx1jvs79o8LgsRk3VvmRgXxaq',
    poolTempLpTokenAccount: '57hiWKd47VHVD7y8BenqnakSdgQNBvyUrkSpf9BDP6UQ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6fc7v3PmjZG9Lk2XTot6BywGyYLkBQuzuFKd4FpCsPxk',
    serumBids: 'FLjCjU5wLUsqF6FeYJaH5JtTTFSTZzTCingxN1uyr9zn',
    serumAsks: '7TcstD7AdWqjuFoRVK24zFv66v1qyMYDNDT1V5RNWKRz',
    serumEventQueue: '2dQ1Spgc7rGSuE1t3Fb9RL7zvGc7F7pH9XwJ46u3QiJr',
    serumCoinVaultAccount: '2ShBow4Bof4dkLjx8VTRjLXXvUydiBNF7bHzDaxPjpKq',
    serumPcVaultAccount: 'EFdqJhawpCReiK2DcrbbUUWWc6cd8mqgZm5MSbQ3TR33',
    serumVaultSigner: 'A6q5h5Wx9iqeoVsvYWA7xofUcKx6XUPPab8BTVrW91Bs',
    official: true
  },
  {
    name: 'ALEPH-USDC',
    coin: { ...TOKENSBASE.ALEPH },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['ALEPH-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GDHXjn9wF2zxW35DBkCegWQdoTfFBC9LXt7D5ovJxQ5B',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'AtUeUK7MZayoDktjrRSJAFsyPiPwPsbAeTsunM5pSnnK',
    ammTargetOrders: 'FMYSGYEL1CPYz8cpgAor5jV2HqeEQRDLMEggoz6wAiFV',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BT3QMKHrha4fhqpisnYKaPDsv42XeHU2Aovhdu5Bazru',
    poolPcTokenAccount: '9L4tXPyuwuLhmtmX4yaRTK6TB7tYFNHupeENoCdPceq',
    poolWithdrawQueue: '4nRbmEUp7DQroG71jXv6cJjrhnh91ePdPhzmBSjinwB8',
    poolTempLpTokenAccount: '9JdpGvmo6aPZYf4hkiZNUjceXgd2RtR1fJgvjuoAuhsM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GcoKtAmTy5QyuijXSmJKBtFdt99e6Buza18Js7j9AJ6e',
    serumBids: 'HmpcmzzajDvhFSXb4pmJo5mb23zW8Cj9FEeB3hVT78jV',
    serumAsks: '8sfGm6jsFTAcb4oLuqMKr1xNEBd5CXuNPAKZEdbeezA',
    serumEventQueue: '99Cd6D9QnFfTdKpcwtoF3zAZdQAuZQi5NsPMERresj1r',
    serumCoinVaultAccount: 'EBRqW7DaUGFBHRbfgRagpSf9jTSS3yp9MAi3RvabdBGz',
    serumPcVaultAccount: '9QTMfdkgPWqLriB9J7FcYvroUEqfw6zW2VCi1dAabdUt',
    serumVaultSigner: 'HKt6xFufxTBBs719WQPbro9t1DfDxffurxFhTPntMgoe',
    official: true
  },
  {
    name: 'TULIP-USDC',
    coin: { ...TOKENSBASE.TULIP },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['TULIP-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '96hPvuJ3SRT82m7BAc7G1AUVPVcoj8DABAa5gT7wjgzX',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6GtSWZfdUFtT47RPk2oSxoB6RbNkp9aM6yP77jB4XmZB',
    ammTargetOrders: '9mB928abAihkhqM6AKLMW4cZkHBXFn2TmcxEKhTqs6Yr',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 's9Xp7GV1jGvixdSfY6wPgivsTd3c4TzjW1eJGyojwV4',
    poolPcTokenAccount: 'wcyW58QFNfppgm4Wi7cKhSftdVNfpLdn67YvvCNMWrt',
    poolWithdrawQueue: '59NA3khShyZk4dhDjFN564nScNdEi3UR4wrCnLN6rRgX',
    poolTempLpTokenAccount: '71oLQgsHknJVHGJDCaBVUnb6udGepK7kwkHXGy47u2i4',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8GufnKq7YnXKhnB3WNhgy5PzU9uvHbaaRrZWQK6ixPxW',
    serumBids: '69W6zLetZ7FgXPXgHRp4i4wNd422tXeZzDuBzdkjgoBW',
    serumAsks: '42RcphsKYsVWDhaqJRETmx74RHXtHJDjZLFeeDrEL2F9',
    serumEventQueue: 'ExbLY71YpFaAGKuHjJKXSsWLA8hf1hGLoUYHNtzvbpGJ',
    serumCoinVaultAccount: '6qH3FNTSGKw34SEEj7GXbQ6kMQXHwuyGsAAeV5hLPhJc',
    serumPcVaultAccount: '6AdJbeH76BBSJ34DeQ6LLdauF6W8fZRrMKEfLt3YcMcT',
    serumVaultSigner: '5uJEd4wfVH84HyFEBf5chfJMTTPHBddXi1S7GmBE6x14',
    official: true
  },
  {
    name: 'WOO-USDC',
    coin: { ...TOKENSBASE.WOO },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['WOO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DSkXJYPZqJ3yHQECyVyh3xiE3HBrt7ARmepwNDA9rREn',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6WHHLn8ia2eHZnPFPDwBKaW2nt7vTRNsvrbgzS55gVwi',
    ammTargetOrders: 'HuSyM774u2zhjbG8rQYCrALBHhK7yVWgUP36rNEtfTs2',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HeMxCh5SozqLth4QPpU1cbEw29ueqFUKSYP6369GX1HV',
    poolPcTokenAccount: 'J3jwx9wsRAq1sBu5tSsKpA4ixQVzLiLyRKdxkjMcRenv',
    poolWithdrawQueue: 'FRSDrhT8Q28yZ3dGhVwNoAbzWawsE3qgmAAEwxTNtE6y',
    poolTempLpTokenAccount: 'GP8hM7HRSjcsQfTbvHKNAWnwhqdn2Nxthb4UJiKXkfJC',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Ux1EYeWsxywPKouRCNiALCZ1y3m563Tc4hq1kQganiq',
    serumBids: '34oLSEmDGyH4NyP84mUXCHbpW9JvG5anNd3iPaCF55zE',
    serumAsks: 'Lp7h84DcAmWqhDbJ6LpvVX9m45GJQfpvMbWPTg4qtkF',
    serumEventQueue: '8Y7MaACCFcTdjcUSLsGkxqxMLDaJDPSZtT5R1kuUL1Hk',
    serumCoinVaultAccount: '54vv5QSZkmHpQzpvUmpS5ZreDwmbuXPdbGp9ybzgcsTM',
    serumPcVaultAccount: '7PL69dV89XXJg9V6wzzdu9p2ymhVwBWqp82sUzWvjnp2',
    serumVaultSigner: 'CTcvsPoWroF2e2iiZWe6ztBwNQHiDyAVCs8EbQ5Annig',
    official: true
  },
  {
    name: 'SNY-USDC',
    coin: { ...TOKENSBASE.SNY },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SNY-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5TgJXpv6H3KJhHCuP7KoDLSCmi8sM8nABizP7CmYAKm1',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2Nr82a2ZxqsQYwBbpeLWQedy1s9kAi2U2AbeuMKjgFzw',
    ammTargetOrders: 'Cts3uDVAgUSaXAHMEfLPnQWF4W5TpGdiB7WhYDAaQbSy',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FaUYbopmMVdNRe3rLnqGPBA2KB96nLHudKaEgAUcvHXn',
    poolPcTokenAccount: '9YiW8N9QdEsAdTQN8asjebwwEmDXAHRnb1E3nvz64vjg',
    poolWithdrawQueue: 'HpWzYHXNeQkmW9oxFjHFozyy6sVxetqJBZdhNSTwcNid',
    poolTempLpTokenAccount: '7QAVG74PVZntmFqvnGYwYySRBjB13HSeSNABwMPtfAPR',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DPfj2jYwPaezkCmUNm5SSYfkrkz8WFqwGLcxDDUsN3gA',
    serumBids: 'CFFoYkeUJaAEh6kQyVEbAgkWfABnH7c8Lynr2hk8ycJT',
    serumAsks: 'AVQEVeftGzTV6Yj2jEPFGgWHyTYs5uyT3ZFFyTaLgTAP',
    serumEventQueue: 'H6UE5r8zMsaHW9fha6Xm7bsWrYbyaL8WbBjhbqbZYPQM',
    serumCoinVaultAccount: 'CddTJJj2tDWUk6Kteh3KSBJJh4HvkoWMXcQjZuXaaAzP',
    serumPcVaultAccount: 'BGr1LWgHKaekkmScogSU1SYSRUaJBBPFeBAEBvuwf7CE',
    serumVaultSigner: '3APrMUDUQ16iEsL4vTaovTf5fPXAEwtXmWXvD9xQVPaB',
    official: true
  },
  {
    name: 'BOP-RAY',
    coin: { ...TOKENSBASE.BOP },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['BOP-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'SJmR8rJgzzCi4sPjGnrNsqY4akQb3jn5nsxZBhyEifC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8pt8zWa9hsRSsiCJtVWnApXGBkmzSubjqf9sbgkbj9LS',
    ammTargetOrders: 'Gg6gGVaokrVMJWtgDbamPwVG8PBN3VbgHLFghfSn3JxY',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'B345z8QcC2WvCwKjeTveLHAuEghumw2qH2xPxAbW7Awd',
    poolPcTokenAccount: 'EPFPMhTRNA6f7J1NzEZ1rkWyhfexZBr9VX3MAn3C6Ce4',
    poolWithdrawQueue: 'E8PcDA6vn9WHRsrMYZvKy2D2CxTB28Bp2cKAYcu16JH9',
    poolTempLpTokenAccount: '47GcR2477mHukyTte1LpDShs4RUmkcF2rejJvisRFALB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6Fcw8aEs7oP7YeuMrM2JgAQUotYxa4WHKHWdLLXssA3R',
    serumBids: '3CNgQ6KpTQYKX9s1CSy5y16ZtnXqYfcTHikmHjEjXKJm',
    serumAsks: '7VxSfKDL7i3FmpJLnK4v7YgidNa1t7SCo84FY7YinQyA',
    serumEventQueue: '9ote3YanmgQgL6vPBUGJVZyFsp6HDJNviTw7ghxzMDLT',
    serumCoinVaultAccount: 'CTv9hnW3nbANzJ2yyzmyMCoUxv5s95ndxcBbLzV39z3w',
    serumPcVaultAccount: 'GXFttVfXbH7rU6GJnBVs3LyyuiPU8a6sW2tv5K5ZGEAQ',
    serumVaultSigner: '5JEwQ7hM1qFCBwJkZ2JyjkoJ99ojJXRx2bFjLcFobDvC',
    official: true
  },
  {
    name: 'SLRS-USDC',
    coin: { ...TOKENSBASE.SLRS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SLRS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '7XXKU8oGDbeGrkPyK5yHKzdsrMJtB7J2TMugjbrXEhB5',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3wNRVMaot3R2piZkzmKsAqewcZ5ABktqrJZrc4Vz3uWs',
    ammTargetOrders: 'BwSmQF7nxRqzzVdfaynxM98dNbXFi94cemDDtxMfV3SB',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6vjnbp6vhw4RxNqN3e2tfE3VnkbCx8RCLt8RBmHZvuoC',
    poolPcTokenAccount: '2anKifuiizorX69zWQddupMqawGfk3TMPGZs4t7ZZk43',
    poolWithdrawQueue: 'Fh5WTfP9jCbkLPzsspCs4WCSPGqE5GYE8v7kqFXijMSA',
    poolTempLpTokenAccount: '9oiniKrJ7r1cHw97gv4XPxTFS9i61vSa7PkpRcm8qGeK',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2Gx3UfV831BAh8uQv1FKSPKS9yajfeeD8GJ4ZNb2o2YP',
    serumBids: '6kMW5vafM4mWZJdBNpH4EsVjFSuSTUokx5meYoVY8GTw',
    serumAsks: 'D5asu2BVatxtgGFugwmNubdknAsLSJDZcqRHvkaS8UBd',
    serumEventQueue: '66Go3JcjNJaDHHvJyaFaV8rh8GAciLzvM8WzN7fRE3HM',
    serumCoinVaultAccount: '6B527pfkvbvbLRDgjASLGygdaQ1fFLwmmqyFCgTacsKH',
    serumPcVaultAccount: 'Bsa11vdveUhSouxAXSYCE4yXToUP58N9EEeM1P8qbtp3',
    serumVaultSigner: 'CjiJdQ9a7dnjTKfVPZ2fwn31NtgJA1kRU55pwDE8HHrM',
    official: true
  },
  {
    name: 'SAMO-RAY',
    coin: { ...TOKENSBASE.SAMO },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['SAMO-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EyDgEU9BdG7m6ZK4bYERxbN4NCJ129WzPtv23dBkfsLg',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '45TD9SmkGoq4hBxBnsQQD2V7pyWK53HkEXz7uNNHpezG',
    ammTargetOrders: 'Ave8ozwW9iBGL4SpK1tM1RfrQi8CsLUFj4UGdFkWRPRp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '9RFqA8EbTTqH3ct1fTGiGgqFAg2hziUdtyGgg1w69LJP',
    poolPcTokenAccount: 'ArAyYYib2X8BTcURYNXKhfoUww2DWkzk67PRPGVpFAuJ',
    poolWithdrawQueue: 'ASeXk7dri8jz466wCtkCVUYheHFEznX55EMuGivL5WPL',
    poolTempLpTokenAccount: '2pu8zUYpwa9UEPvKkQvZHQUbbTdMg6N2mXi2Vv4DaEJV',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AAfgwhNU5LMjHojes1SFmENNjihQBDKdDDT1jog4NV8w',
    serumBids: 'AYEeLrFWhGDRgX9L428SqBU56iVzDSyP3A6Db4VekcjE',
    serumAsks: 'CctHQdpAtxugQNFU7PA4ebb2T5K1ZkwDTvoFrsYrxifY',
    serumEventQueue: 'CFtHmFydRBtw1qsoPZ4LufbdX39LKT9Aw5HzUib9JpiL',
    serumCoinVaultAccount: 'BpHuL7HNTJDDGiw4ELpnYQdhTNNgZ53ennhtkQjGawGS',
    serumPcVaultAccount: 'BzsbZPiwLMJHhSFNVdtGqi9MWKhYijgq34Z6YjYkQJUr',
    serumVaultSigner: 'F2f14Nw7kqBeGwgFymm7sEPcZrKWWN56hvN5yx2vc6sE',
    official: true
  },
  {
    name: 'renBTC-USDC',
    coin: { ...TOKENSBASE.renBTC },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['renBTC-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '61JtCkTQKSeBU8ztEScByZiBhS6KAHSXfQduVyA4s1h7',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'AtFR9ub2dbNJJod7gPL81F7gRxVtpcR1n4GczqgasqX2',
    ammTargetOrders: 'ZVmcXezubm6FXvS8Wtvah66vqZRW6NKD17tea7FcGsB',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2cA595zqm12sRtsiNvV6AqD8WDYYiJoLwEYNQ1FZG2ep',
    poolPcTokenAccount: 'Fxn92YfcVsd9diz32YtKixqmuezgLeSWqd1gypFL5qe',
    poolWithdrawQueue: 'ioR3UfTLnz6t9Bzbcu7TPmw1xYQRwXCgGqcpvzRmCQx',
    poolTempLpTokenAccount: '8VEBvPwhBwu9D4e4Zei6X31ZBs5udL5epJHp935LVMv1',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
    serumBids: 'B1xjpD5EEVtLWnWioHc7pCJLj1WVGyKdyMV1NzY4q5pa',
    serumAsks: '6NZf4f6dxxv83Bdfiyf1R1vMFo5QP8BLB862qrVkmhuS',
    serumEventQueue: '7RbmehbSunJLpg7N6kaCX5SenR1N79xHN8jKnuvXoEHC',
    serumCoinVaultAccount: 'EqnX836tGG4PYSBPgzzQecbTP47AZQRVfcy4RqQW8F3D',
    serumPcVaultAccount: '7yiA6p6BXxZwcm38St3vTzyGNEmZjw8x7Ko2nyTfvVx3',
    serumVaultSigner: '9aZNHmGZrNnB3fKmBj5B9oD7moA1nFviZqNUSkx2tctg',
    official: true
  },
  {
    name: 'renDOGE-USDC',
    coin: { ...TOKENSBASE.renDOGE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['renDOGE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '34oD4akb2DeNcCw1smKHPsD3iqQQQWmNy3cY81nz7HP8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '92QStSTSQHYFg2ZxJjxWETwiS3zYsKnJm9BznJ8JDvrh',
    ammTargetOrders: 'EHjwgEneTm6DZWGbictuSxf7NfcirEjyYdzYaSyNkhT1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'EgNtpEoLCiSJx8TtVLWUBpXhUWmqzBrymgweihtmnd83',
    poolPcTokenAccount: 'HZHCa82ezeYegyQWtsWW3vznpoiRaa3ewtxYvm5X6tTz',
    poolWithdrawQueue: 'FbWCd9uQfAD5M62Pyceff5S2WFeN9Z5rL6azysGdhais',
    poolTempLpTokenAccount: 'H12qWVeehVN6CQGfwCnSH2LxcHJ9we33U6gPmiViueu5',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5FpKCWYXgHWZ9CdDMHjwxAfqxJLdw2PRXuAmtECkzADk',
    serumBids: 'EdXd7dZLfkjz4k38VoP8d8ij7UJdrnZ3EoR9RHr5ThqX',
    serumAsks: 'DuGkNca9NtZByzAxQsbt5yPFNF8pyv2PqB2sjSbBGEWi',
    serumEventQueue: 'AeRsgcjxerNiMK1wpPyt7TSkH9Ps1mTr9Ac1bbWvYhdp',
    serumCoinVaultAccount: '5UbUbaVLXnZq1eibQSUxdsk6Lp38bgdTjbjQPssXGgwW',
    serumPcVaultAccount: '4KMsmK7gPdKMAKmEcHqtBB5EhNnWVRd71v3a5uBwhQ2T',
    serumVaultSigner: 'Gwe1pE3rV4LLviNZqrEFPAeLchwvHrftBUQsnJtEkpSa',
    official: true
  },
  {
    name: 'RAY-USDC',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['RAY-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'J8u8nTHYtvudyqwLrXZboziN95LpaHFHpd97Jm5vtbkW',
    ammTargetOrders: '3cji8XW5uhtsA757vELVFAeJpskyHwbnTSceMFY5GjVT',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FdmKUE4UMiJYFK5ogCngHzShuVKrFXBamPWcewDr31th',
    poolPcTokenAccount: 'Eqrhxd7bDUCH3MepKmdVkgwazXRzY6iHhEoBpY7yAohk',
    poolWithdrawQueue: 'ERiPLHrxvjsoMuaWDWSTLdCMzRkQSo8SkLBLYEmSokyr',
    poolTempLpTokenAccount: 'D1V5GMf3N26owUFcbz2qR5N4G81qPKQvS2Vc4SM73XGB',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep',
    serumBids: 'Hf84mYadE1VqSvVWAvCWc9wqLXak4RwXiPb4A91EAUn5',
    serumAsks: 'DC1HsWWRCXVg3wk2NndS5LTbce3axwUwUZH1RgnV4oDN',
    serumEventQueue: 'H9dZt8kvz1Fe5FyRisb77KcYTaN8LEbuVAfJSnAaEABz',
    serumCoinVaultAccount: 'GGcdamvNDYFhAXr93DWyJ8QmwawUHLCyRqWL3KngtLRa',
    serumPcVaultAccount: '22jHt5WmosAykp3LPGSAKgY45p7VGh4DFWSwp21SWBVe',
    serumVaultSigner: 'FmhXe9uG6zun49p222xt3nG1rBAkWvzVz7dxERQ6ouGw',
    official: true
  },
  {
    name: 'RAY-SRM',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.SRM },
    lp: { ...LP_TOKENSBASE['RAY-SRM-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GaqgfieVmnmY4ZsZHHA6L5RSVzCGL3sKx4UgHBaYNy8m',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7XWbMpdyGM5Aesaedh6V653wPYpEswA864sBvodGgWDp',
    ammTargetOrders: '9u8bbHv7DnEbVRXmptz3LxrJsryY1xHqGvXLpgm9s5Ng',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3FqQ8p72N85USJStyttaohu1EBsTsEZQ9tVqwcPWcuSz',
    poolPcTokenAccount: '384kWWf2Km56EReGvmtCKVo1BBmmt2SwiEizjhwpCmrN',
    poolWithdrawQueue: '58z15NsT3JJyfywFbdYzn2GVeDDC444WHyUrssZ5tCm7',
    poolTempLpTokenAccount: '8jqpuijsM2ne5dkwLyjQxa9oCbYEjM6bE1uBaFXmC3TE',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Cm4MmknScg7qbKqytb1mM92xgDxv3TNXos4tKbBqTDy7',
    serumBids: 'G65a5G6xHpc9zV8tGhVSKJtz7AcAJ8Q3hbMqnDJQgMkz',
    serumAsks: '7bKEjcZEqVAWsiRGDnxXvTnNwhZLt2SH6cHi5hpcg5de',
    serumEventQueue: '4afBYfMNsNpLQxFFt72atZsSF4erfU28XvugpX6ugvr1',
    serumCoinVaultAccount: '5QDTh4Bpz4wruWMfayMSjUxRgDvMzvS2ifkarhYtjS1B',
    serumPcVaultAccount: '76CofnHCvo5wEKtxNWfLa2jLDz4quwwSHFMne6BWWqx',
    serumVaultSigner: 'AorjCaSV1L6NGcaFZXEyUrmbSqY3GdB3YXbQnrh85v6F',
    official: true
  },
  {
    name: 'RAY-ETH',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...TOKENSBASE.ETH },
    lp: { ...LP_TOKENSBASE['RAY-ETH-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8iQFhWyceGREsWnLM8NkG9GC8DvZunGZyMzuyUScgkMK',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7iztHknuo7FAXVrrpAjsHBEEjRTaNH4b3hecVApQnSwN',
    ammTargetOrders: 'JChSqhn6yyEWqD95t8UR5DaZZtEZ1RGGjdwgMc8S6UUt',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'G3Szi8fUqxfZjZoNx17kQbxeMTyXt2ieRvju4f3eJt9j',
    poolPcTokenAccount: '7MgaPPNa7ySdu5XV7ik29Xoav4qcDk4wznXZ2Muq9MnT',
    poolWithdrawQueue: 'C9aijsE3tLbVyYaXXHi45qneDL5jfyN8befuJh8zzpou',
    poolTempLpTokenAccount: '3CDnyBsNnexdvfvo6ASde5Q4e72jzMQFHRRkSQr49vEG',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6jx6aoNFbmorwyncVP5V5ESKfuFc9oUYebob1iF6tgN4',
    serumBids: 'Hdvh4ZGL9MkiQApNqfZtdmd4jM6Sz8e9akCUuxxkYhb8',
    serumAsks: '7vWmTv9Mh8XbAxcduEqed2dLtro4N7hFroqch6mMxYKM',
    serumEventQueue: 'EgcugBBSwM2FxqLQx5S6zAiU9x9qRS8qMVRMDFFU4Zty',
    serumCoinVaultAccount: 'EVVtYo4AeCbmn2dYS1UnhtfjpzCXCcN26G1HmuHwMo7w',
    serumPcVaultAccount: '6ZT6KwvjLnJLpFdVfiRD9ifVUo4gv4MUie7VvPTuk69v',
    serumVaultSigner: 'HXbRDLcX2FyqWJY95apnsTgBoRHyp7SWYXcMYod6EBrQ',
    official: true
  },
  {
    name: 'RAY-SOL',
    coin: { ...TOKENSBASE.RAY },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['RAY-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6Su6Ea97dBxecd5W92KcVvv6SzCurE2BXGgFe9LNGMpE',
    ammTargetOrders: '5hATcCfvhVwAjNExvrg8rRkXmYyksHhVajWLa46iRsmE',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Em6rHi68trYgBFyJ5261A2nhwuQWfLcirgzZZYoRcrkX',
    poolPcTokenAccount: '3mEFzHsJyu2Cpjrz6zPmTzP7uoLFj9SbbecGVzzkL1mJ',
    poolWithdrawQueue: 'FSHqX232PHE4ev9Dpdzrg9h2Tn1byChnX4tuoPUyjjdV',
    poolTempLpTokenAccount: '87CCkBfthmyqwPuCDwFmyqKWJfjYqPFhm5btkNyoALYZ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'C6tp2RVZnxBPFbnAsfTjis8BN9tycESAT4SgDQgbbrsA',
    serumBids: 'C1nEbACFaHMUiKAUsXVYPWZsuxunJeBkqXHPFr8QgSj9',
    serumAsks: '4DNBdnTw6wmrK4NmdSTTxs1kEz47yjqLGuoqsMeHvkMF',
    serumEventQueue: '4HGvdannxvmAhszVVig9auH6HsqVH17qoavDiNcnm9nj',
    serumCoinVaultAccount: '6U6U59zmFWrPSzm9sLX7kVkaK78Kz7XJYkrhP1DjF3uF',
    serumPcVaultAccount: '4YEx21yeUAZxUL9Fs7YU9Gm3u45GWoPFs8vcJiHga2eQ',
    serumVaultSigner: '7SdieGqwPJo5rMmSQM9JmntSEMoimM4dQn7NkGbNFcrd',
    official: true
  },
  {
    name: 'DXL-USDC',
    coin: { ...TOKENSBASE.DXL },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['DXL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'asdEJnE7osjgnSyQkSZJ3e5YezbmXuDQPiyeyiBxoUm',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4zuyAKT81y9mSSrjq8sN872zwgcD5ncQGyCXwRJDn6tC',
    ammTargetOrders: 'H2GMj87upPeBQT3ywzqudJodwyTFpPmwuwtiZ7DQB8Md',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FHAqAqqdyZFaxUTCg19hH9pRfKKChwNekFrY428NVPtT',
    poolPcTokenAccount: '7jzwUCSq1R1QX72PKRDjZ4xgUm6Q6iiLW9BY8tnj8wkc',
    poolWithdrawQueue: '3WBnh4HbddG6sMvv6s1GALVLPq6xfwVat3WqufZKKFXa',
    poolTempLpTokenAccount: '9DRSmvcrXC7AtNrhf9tgfBuwT4q5hXyWaAybe5yfRU7q',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DYfigimKWc5VhavR4moPBibx9sMcWYVSjVdWvPztBPTa',
    serumBids: '2Z6Do29oGtze6dnVMXAVw8mkRxFpLGc8uS2RjfrWoCyy',
    serumAsks: 'FosLnuNKUKqfqYviAPdp1doC3dKpXQXvAeRGM5xAoUCJ',
    serumEventQueue: 'EW5QgqGUZ7dSmXLXiuWB8AAsjSjpb8kaaoxAUqK1DWyg',
    serumCoinVaultAccount: '9ZaKDVrjCaPRZTqnuteGc8iBmJhdaGVf8JV2HBT67wbX',
    serumPcVaultAccount: '5Y65XyuJemmRU7G1AQQTvWKSge8WDVYhb2knd7htJHoh',
    serumVaultSigner: 'y6FHXgMwWvvpoiox6Ut6mUAUHgbJMXNJnXQm7MQkEdE',
    official: true
  },
  {
    name: 'LIKE-USDC',
    coin: { ...TOKENSBASE.LIKE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['LIKE-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'GmaDNMWsTYWjaXVBjJTHNmCWAKU6cn5hhtWWYEZt4odo',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Crn5beRFeyj4Xw13E2wdJ9YkkLLEZzKYmtTV4LFDx3MN',
    ammTargetOrders: '7XjS6MrvBRi9JeFWBMAYPaKhKgR3b7xnVdYDBkFb4CXR',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8LoHX6f6bMdQVs4mThoH2KwX2dQDSkqVFADi4ZjDQv9T',
    poolPcTokenAccount: '2Fwm8M8vuPXEXxvKz98VdawDxsK9W8uRuJyJhvtRdhid',
    poolWithdrawQueue: 'CW9zJ2JbBekkdd5SdvPapPcbziR8d1UHBzW7nNn1W3ga',
    poolTempLpTokenAccount: 'FVHsnC1nhwMcrAzFwcK4dgUtDdYFM1VrTJ8Rp8Mb1LkY',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3WptgZZu34aiDrLMUiPntTYZGNZ72yT1yxHYxSdbTArX',
    serumBids: 'GzHpnQSfS7KdqLKgiEEP7pkYnwEBz9zaE7De2CjmCrNV',
    serumAsks: 'FpEBAT9qP1so4ASUTiEWxyXH2SJvgoBYUiZ1AbPimcS7',
    serumEventQueue: 'CUMDMV9KtE22RUZECUNHxiq7FmUiRusyKa1rHUJfRptq',
    serumCoinVaultAccount: 'Dd9F1fugQj2xtduyNvFS5TtxP9vKnuxVMcrPsHFnLyqp',
    serumPcVaultAccount: 'BnXXu8kLUXrwg3MpcVRVPLZw9bpX2mLd95qtCMnSUtu7',
    serumVaultSigner: 'MKCHeoqNGWU8TJBkdF1M76nMUteJCwuBRUJfCtR3iV7',
    official: true
  },
  {
    name: 'mSOL-USDC',
    coin: { ...TOKENSBASE.mSOL },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['mSOL-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'ZfvDXXUhZDzDVsapffUyXHj9ByCoPjP4thL6YXcZ9ix',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4zoatXFjMSirW2niUNhekxqeEZujjC1oioKCEJQMLeWF',
    ammTargetOrders: 'Kq9Vgb8ntBzZy5doEER2p4Zpt8SqW2GqJgY5BgWRjDn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8JUjWjAyXTMB4ZXcV7nk3p6Gg1fWAAoSck7xekuyADKL',
    poolPcTokenAccount: 'DaXyxj42ZDrp3mjrL9pYjPNyBp5P8A2f37am4Kd4EyrK',
    poolWithdrawQueue: 'CfjpUvQAoU4hadb9nReTCAqBFFP7MpJyBW97ezbiWgsQ',
    poolTempLpTokenAccount: '3EdqPYv3hLJFXC3U9LH7yA7HX6Z7gRxT7vGQQJrxScDH',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy',
    serumBids: '8qyWhEcpuvEsdCmY1kvEnkTfgGeWHmi73Mta5jgWDTuT',
    serumAsks: 'PPnJy6No31U45SVSjWTr45R8Q73X6bNHfxdFqr2vMq3',
    serumEventQueue: 'BC8Tdzz7rwvuYkJWKnPnyguva27PQP5DTxosHVQrEzg9',
    serumCoinVaultAccount: '2y3BtF5oRBpLwdoaGjLkfmT3FY3YbZCKPbA9zvvx8Pz7',
    serumPcVaultAccount: '6w5hF2hceQRZbaxjPJutiWSPAFWDkp3YbY2Aq3RpCSKe',
    serumVaultSigner: '9dEVMESKXcMQNndoPc5ji9iTeDJ9GfToboy8prkZeT96',
    official: true
  },
  {
    name: 'mSOL-SOL',
    coin: { ...TOKENSBASE.mSOL },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['mSOL-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'EGyhb2uLAsRUbRx9dNFBjMVYnFaASWMvD6RE1aEf2LxL',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6c1u1cNEELKPmuH352WPNNEPdfTyVPHsei39DUPemC42',
    ammTargetOrders: 'CLuMpSesLPqdxewQTxfiLdifQfDfRsxkFhPgiChmdGfk',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '85SxT7AdDQvJg6pZLoDf7vPiuXLj5UYZLVVNWD1NjnFK',
    poolPcTokenAccount: 'BtGUR6y7uwJ6UGXNMcY3gCLm7dM3WaBdmgtKVgGnE1TJ',
    poolWithdrawQueue: '7vvoHxA6di9EvzJKL6bmojbZnH3YaRXu2LitufrQhM21',
    poolTempLpTokenAccount: 'ACn8TZ27fQ85kgdPKUfkETB4dS5JPFoq53z7uCgtHDai',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5cLrMai1DsLRYc1Nio9qMTicsWtvzjzZfJPXyAoF4t1Z',
    serumBids: 'JAABQk3n6S8W85LC6RpqTvGgP9wJFb8kfqir6kUhBXkQ',
    serumAsks: 'psFs3Dm7quZZn3BhvrT1LdWCVtbMqxXanU7ZYdHULj6',
    serumEventQueue: '4bmSJJCrx3dehFQ8kXAE1c4L9kfP8DyHow4tFw6aRJZe',
    serumCoinVaultAccount: '2qmHPJn3URkrboLiJkQ5tBB4bmYWdb6MyhQzZ6ms7wf9',
    serumPcVaultAccount: 'A6eEM36Vpyti2PoHK8h8Dqk5zu7YTaSRTQb7XXL8tcrV',
    serumVaultSigner: 'EHMK3DdPiPBd9aBjeRU4aZjD7z568rmwHCSAAxRooPq6',
    official: true
  },
  {
    name: 'MER-PAI',
    coin: { ...TOKENSBASE.MER },
    pc: { ...TOKENSBASE.PAI },
    lp: { ...LP_TOKENSBASE['MER-PAI-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6GUF8Qb5FWmifzYpRdKomFNbSQAsLShhT45GbTGg34VJ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Gh3w9pfjwbZX2FVrMy6PzUQG5rhihKduGCB7UaPGUTZw',
    ammTargetOrders: '37k5Xe8Sej1TrjrGsR2HyRR1EjYECV1HcS3Xh6Jnxggi',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'ApnMY7ahxTMssU1dzxYEfMcag1aSa5s4Axje3nqnnrXH',
    poolPcTokenAccount: 'BuQxGhmS82ZhczEGbUyi9R7TjxczXTMRoD4nQ4GvqxCf',
    poolWithdrawQueue: 'CrvN8Zi4c6BHVFc3mAB8CZSZRftY73WtpBH2Zade9MKZ',
    poolTempLpTokenAccount: '5W9V96yUqk95zUYawoCfEittj4VT4Nbv8NVjevJ4kN78',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FtxAV7xEo6DLtTszffjZrqXknAE4wpTSfN6fBHW4iZpE',
    serumBids: 'Hi6bo1sodi7X2GrpeVpk5mKKG42Ga8n4Gi3Fxr2WK6rg',
    serumAsks: '75a4ASjShTXZPdxNzm4RoSEVydLBFfDa1V81Wcf7Xw59',
    serumEventQueue: '7WDqc3MAApvgDskQBDKVVPmya3Src228sAk8Lag8ovph',
    serumCoinVaultAccount: '2Duueu4HUnv6e4qUqdM4DKECM9X3XggBsXp5eLYuSLXe',
    serumPcVaultAccount: '3GEqHH6VAnyqrgG9jRB4Qy9PMTYJmSBvg7u3LtBWHEWD',
    serumVaultSigner: '7cBPvLMQvf1X5rzLMNKrx7TY5M186rTR49yJNHNSp81s',
    official: true
  },
  {
    name: 'PORT-USDC',
    coin: { ...TOKENSBASE.PORT },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['PORT-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6nJes56KF999Q8VtQTrgWEHJGAfGMuJktGb8x2uWff2u',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ENfqr7WFKJy9VRwfDkgL4HvMM6GU7pHyowzZsZwx8P39',
    ammTargetOrders: '9wjp6tFY1XNH6KhdCHeDgeUsNLVjTwxA3iC9k5aun2NW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GGurDvQctUDgcegSYZetkNGytcWEfLes6yXzYruhLuLP',
    poolPcTokenAccount: '3FmHEQRHaKMS4vA41eYTVmfxX9ErxdAScS2tvgWvNHSz',
    poolWithdrawQueue: 'ETie1oDMcoTD8jzrseAcvTqZYyyoWxR92LH15nA6Lfub',
    poolTempLpTokenAccount: 'GEJfHTwURq89KcM1RgvFZRweb4f7H8NAsmyMg2kTPBEs',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8x8jf7ikJwgP9UthadtiGFgfFuyyyYPHL3obJAuxFWko',
    serumBids: '9Y24T3co7Cc7cGbG2mFc9n3LQonAWgtayqfLz3p28JPa',
    serumAsks: '8uQcJBapCnxy3tNEB8tfmssUvqYWvuCsSHYtdNFbFFjm',
    serumEventQueue: '8ptDxtRLWXAKYQYRoRXpKmrJje31p8dsDsxeZHEksqtV',
    serumCoinVaultAccount: '8rNKJFsd9yuGx7xTTm9sb23JLJuWJ29zTSTznGFpUBZB',
    serumPcVaultAccount: '5Vs1UWLxZHHRW6yRYEEK3vpzE5HbQ8BFm27PnAaDjqgb',
    serumVaultSigner: '63ZaXnSj7SxWLFEcjmK79fyGokJxhR3UEXomN7q7Po25',
    official: true
  },
  {
    name: 'MNGO-USDC',
    coin: { ...TOKENSBASE.MNGO },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['MNGO-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '34tFULRrRwh4bMcBLPtJaNqqe5pVgGZACi5sR8Xz95KC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '58G7RrYRntVvVj9rVgDwGhAJoWhMWHNyDCoMydYUwSR6',
    ammTargetOrders: '2qBcjDqDywhB7Kgb1VYq8K5svJh37BB8oC5kBE4VqA7q',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '91fMidHL8Yr8KRcu4Zu2RPRRg1FbXxZ7DV43rAyKRLjn',
    poolPcTokenAccount: '93oFfbcayY2WkcR6d9AyqPcRC121dXmWarFJkwPErRRE',
    poolWithdrawQueue: 'FhnSdMoRPj75bLs6yzaDPFfiuucUZhVDiyM78WEhaKJo',
    poolTempLpTokenAccount: 'FZAwAb6UxNiwDTbQZ3bPKYA4PkbYpurh8YpAH8G424Lv',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3d4rzwpy9iGdCZvgxcu7B1YocYffVLsQXPXkBZKt2zLc',
    serumBids: '3nAdH9wTEhPoW4e2s8K2cXfn4jZH8FBCkUqtzWpsZaGb',
    serumAsks: 'HxbWm3iabHEFeHG9LVGYycTwn7aJVYYHbpQyhZhAYnfn',
    serumEventQueue: 'H1VVmwbM96BiBJq46zubSBm6VBhfM2FUhLVUqKGh1ee9',
    serumCoinVaultAccount: '7Ex7id4G37HynuiCAv5hTYM4BnPB9y4NU85QcaNWZy3G',
    serumPcVaultAccount: '9UB1NhGeDuV1apHdtK5LeAEjP7kZFH8vVYGdh2yGFRi8',
    serumVaultSigner: 'BFkxdUwW17eANhfs1xNmBqEcegb4EStQxVb5VaMS2dq6',
    official: true
  },
  {
    name: 'ATLAS-USDC',
    coin: { ...TOKENSBASE.ATLAS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['ATLAS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '2bnZ1edbvK3CK3LTNZ5jH9anvXYCmzPR4W2HQ6Ngsv5K',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'EzYB1U93e8E1KGJdUzmnwgNBFMP9E1XAuyosmiPGLAvD',
    ammTargetOrders: 'DVxJDo3E9zfGgvSkC2DYS5fsv5AyXA7gXpcs1fHFrP3y',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FpFV46UVvRtcrRvYtKYgJpJtP1tZkvssjhrLUfoj8Cvo',
    poolPcTokenAccount: 'GzwX68f1ZF4dKnAJ58RdET8sPvvnYktbDEHmjoGw7Umk',
    poolWithdrawQueue: '26SuCukyzbYo5kzeufaSoMjRPStAwqfVzTXb4QGynTit',
    poolTempLpTokenAccount: 'HcoA8ucDBjEUVMjvURaS9CZgdEUbq8jRieGabq48mCL8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Di66GTLsV64JgCCYGVcY21RZ173BHkjJVgPyezNN7P1K',
    serumBids: '2UabAccF1AFPcNqv9D46JgyGnErnaYAJuCwyaT5dCkHc',
    serumAsks: '9umNLTbks7S51TEB8XF4jeCxwyq3qmdHrFDMFB8cT1gv',
    serumEventQueue: 'EYU32k5waRUxF521k2KFSuhEj11HQvg4MbQ9tFXuixLi',
    serumCoinVaultAccount: '22a8dDQwHmmnW4M4WuSXHC9NdQAufZ2V8at3EtPzBqFj',
    serumPcVaultAccount: '5Wu76Qx7EoiR79zVVV49cZDYZ5csZaKFiHKYtCjF9FNU',
    serumVaultSigner: 'FiyZW6n5VE64Yubn2PUFAxbmB2FZXhYce74LzJUhqSZg',
    official: true
  },
  {
    name: 'POLIS-USDC',
    coin: { ...TOKENSBASE.POLIS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['POLIS-USDC-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '9xyCzsHi1wUWva7t5Z8eAvZDRmUCVhRrbaFfm3VbU4Mf',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '12A4SGay36i2cSwA4JSdvg7rWSmCz8JzhsoDqMM8Yns7',
    ammTargetOrders: '6bszsB6zxw2YowrEm26XYhh57HKQEVMRx5YMvPSSVQNh',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7HgvC7GdmUt7kMivdLMovLStW25avFsW9GDXgNr525Uy',
    poolPcTokenAccount: '9FknRLGpWBqYg7fXQaBDyWWdu1v2RwUM6zRV6CiPjWBD',
    poolWithdrawQueue: '6uN62R1i31QVoy9cmQAeDrfLccMZDjQ2gmwv2D4iBTJT',
    poolTempLpTokenAccount: 'FJV66MrqZW8VYGmTuAupstwYtqfF6ULLPP9voYtnc8DS',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HxFLKUAmAMLz1jtT3hbvCMELwH5H9tpM2QugP8sKyfhW',
    serumBids: 'Bc5wovapX1tRjZfyZVpsGH73Gq5LGN4ANsj8kaEhfY7c',
    serumAsks: '4EHg2ANFFEKLFkpLxgiyinJ1UDWsG2p8rVoAjFfjMDKc',
    serumEventQueue: 'qeQC4u5vpo5QMC17V5UMkQfK67vu3DHtBYVT1hFSGCK',
    serumCoinVaultAccount: '5XQ7xYE3ujVA21HGbvFGVG4pLgqVHSfR9anz2EfmZ3nA',
    serumPcVaultAccount: 'ArUDWPwzGQFfa7t7nSdkp1Dj6tYA3icXEq8K7goz9WoG',
    serumVaultSigner: 'FHX9fPAUVA1MxPme28f4eeVH81QVRHDWofa2V6FUJaiR',
    official: true
  },
  {
    name: 'ATLAS-RAY',
    coin: { ...TOKENSBASE.ATLAS },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['ATLAS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'F73euqPynBwrgcZn3fNSEneSnYasDQohPM5aZazW9hp2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2CbuxnkjsBvaQoAubc5MAmbeZSMn36z8sZnfMvZWH1vb',
    ammTargetOrders: '6GZrucFa9hAQW7yHiPt3oZj9GkL6oBipngyY1Hw3zMx',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '33UaaUmmySzxK7q3yhmQiXMrW1tQrwqojyD6ZEFgM6FZ',
    poolPcTokenAccount: '9SYRTwYE5UV2cxEuRz8iiJcV8gMbMnJUYFC8zgDAsUwB',
    poolWithdrawQueue: '6bznLHPLPA3axnRfjh3sFzkxeMUQDLWhDuaHzjGL1EE6',
    poolTempLpTokenAccount: 'FnmoaJqFYHotLTG2Ur84jSUmVUACVWrBvBvRHdPzhqvb',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Bn7n597jMxU4KjBPUo3QwJhbqr5145cHy31p6EPwPHwL',
    serumBids: '9zAgdk4Na8fBKLiTWzsqZwgYQETuHBDjPe2GYqHy17L',
    serumAsks: 'Fv6MY3w7PP7A54cuPQHevQNuwekGy8yksXWioBsyVd42',
    serumEventQueue: '75iVJf9QKovBdsvgxcCFfwn2N4QyxEXyKxQdBvZTdzjr',
    serumCoinVaultAccount: '9tBagdm862GCoxZNFvXv7HFjLUFmypxPYxfiT3j9S3h3',
    serumPcVaultAccount: '4oc1kGhKByyxRnh3oXupjTn5P6JwWPnoxwvLxjZzi2vE',
    serumVaultSigner: 'EK2TjcyoXzUweNJnJupQf6sZK8756mvBJeGBvi6y18Cq',
    official: true
  },
  {
    name: 'POLIS-RAY',
    coin: { ...TOKENSBASE.POLIS },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['POLIS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5tho4By9RsqTF1rbm9Akiepik3kZBT7ffUzGg8bL1mD',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'UBa61sKev8gr19nqVyN3BZbW2jG7eAGjbjeZvpU4wu8',
    ammTargetOrders: 'FgMtC8pDrSQJUovmnrDiRWgLGVrVSq9kui98re6uRz5i',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Ah9T12tzwnTXWrWVWzLmCrwCEmVHS7HMdWKG4qLUDzJP',
    poolPcTokenAccount: 'J7kjQkrpafcLjL7cCpmMamxLAFnCkGApLTC2QrbHe2NQ',
    poolWithdrawQueue: 'EgZgi8skDug7YecbFuCFxXx3SPFPhbGSVrGiNzLHErkj',
    poolTempLpTokenAccount: 'TYw7qQDt6sqpwUFSRfNBaLHEA1SUxbEWtmZxtZQhojk',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3UP5PuGN6db7NhWf4Q76FLnR4AguVFN14GvgDbDj1u7h',
    serumBids: '4tAuffNhWeF2MDWjMDgrRoR8X8Jg3BLvUAaerXzLsFpG',
    serumAsks: '9W133475h1LZ2ZzY7aJtbJajLDSCn5hNnKcsu6gXgE2G',
    serumEventQueue: '5DX4tJ8jZt91XzM7JUUPhu6CL4o6UDGnfjLJZtkmEfVT',
    serumCoinVaultAccount: 'pLD9GMk4LACBXDJAWJSgbT1batbHgunBVyy8BaVBazG',
    serumPcVaultAccount: 'Ah3JVyTAGLbH63XPWDDnJUwV1xYwHhFX2J81CDHomkLk',
    serumVaultSigner: '5RqVkFy8hUbYDR81ucZhF6rAwpgYJngLJLSynMTeC4vM',
    official: true
  },
  {
    name: 'ALEPH-RAY',
    coin: { ...TOKENSBASE.ALEPH },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['ALEPH-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8Fr3wxZXLtiSozqms5nF4XXGHNSNqcMC6K6MvRqEfk4a',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GrTQQTca8U7QpNiThwHfiQuFVihvSkkNPchhkKr7PMy',
    ammTargetOrders: '7WCvFBFN3fjU5hKJjPF2rHLAyXfzGCEqJ8qbqKLBaGTv',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4WzdFwdKaXLQdFn9i84asMxdr6Fmhmh3qd6uC2xjBXwd',
    poolPcTokenAccount: 'yFWn8ji7zq24UDg1mMqP1mA3vWyUdkjARQUPZCS5iCf',
    poolWithdrawQueue: 'J9QSrJtasvLydL5dgbfv55eqBoADM9z91kVi5hpxk36Y',
    poolTempLpTokenAccount: 'fGohyeWwAGqGdjQsHrE4c6GoTC1xHmyiAxJsgz2uZZ9',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4qATPNrEGqE4yFJhXXWtppzJj5evmUaZ5LJspjL6TRoU',
    serumBids: '84wPUTporXrCAceD753fXdiysry7WNkpiJH5HwhV5PwC',
    serumAsks: 'BDcmopZQkPoxkk1BLAeh4zR3oWeDFUXTkrD2fJgh8xYu',
    serumEventQueue: '4PiUj2EFVq8YNjMd8zWCUe7dV2prLEJCucapjzTeiShv',
    serumCoinVaultAccount: '7dCAQbfwtDFtLwNgoB2WahCubPhFjZRGjfVYJajcF6qJ',
    serumPcVaultAccount: '2DsQ33R4GqqBkmxPdFyBy7WYAzyWYm6BNPqKtENAKXuY',
    serumVaultSigner: 'DDyP6zj3GTK3hTRyjPuaEL9yyqgfdstRMMKCkn939pkp',
    official: true
  },
  {
    name: 'TULIP-RAY',
    coin: { ...TOKENSBASE.TULIP },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['TULIP-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Dm1Q15216uRARmQTbo6VfnyEGVzRvLTm4TfCWWX4MF3F',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '2x6JvLToztTWoiYAXFvLw9R8Ump3aDcuiRPBY9ZuzoRL',
    ammTargetOrders: 'GZzyFjERxn9CqS5jXq1o2J3zmSNmhPMzn7U4aMJ82wL',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '96VnEN3nhvyb6hLSyP6BGsvSFdTJycQtTr574Kavrje8',
    poolPcTokenAccount: 'FhnZ1j8C8d7aXecxQXEGpRycoH6uJ1Fpncj4Sm33J2iS',
    poolWithdrawQueue: 'ELX79G4JU2YQrykozCvaRnhU2dBFmxNpSrJD3BoRoxfE',
    poolTempLpTokenAccount: 'BagZFcJSYZzQn3iS37sPFDPiaKsfUwo8YD98XsEMKrsd',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GXde1EjpxVV5fzhHJcZqdLmsA3zmaChGFstZMjWsgKW7',
    serumBids: '2ty8Nq6brwkp74n6EtJkD8msgBnc3fRiavNGrE5d7yE3',
    serumAsks: 'GzztpwBixtLW1vqZwtNZH7FvyGJcRmLvCZTffCW2ZoS2',
    serumEventQueue: '4EgxxtAL5zsc1GCR243EU2vpbYpSvsawyfznVuRYbGHm',
    serumCoinVaultAccount: 'JD1MfYD2SXiY1j6p3H6DifpG6RAe8cAtmNNLdRAdB1aT',
    serumPcVaultAccount: 'UtkM2zbygo9tig18DQJDdRjHSKQiMf5uSuDTR2kf7ov',
    serumVaultSigner: '3yRCDVhumspJgYJnNhyJaXTjRn5jiMqdbQ13rTyHHQgQ',
    official: true
  },
  {
    name: 'SLRS-RAY',
    coin: { ...TOKENSBASE.SLRS },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['SLRS-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'J3CoGcJqHquUdSgS7qAwdGbp3so4EpLX8eVDdGuauvi',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FhtXN2pPZ8JMxGcLKSfRJtGsorSCXBKJyw3n7SsEc1aR',
    ammTargetOrders: '2hdnnbsAu7pCf6nX5fDKPAdThLZmmWFQ7Kcq2cdShPGW',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8QWf745UQeyMyM1qAAsCeb73jTvQvpm2diVgjNvHgbVX',
    poolPcTokenAccount: '5TsxBaazJ7Zdx4x4Zd2zC7TY98EVSwGY7hnioS2omkx1',
    poolWithdrawQueue: '6w9z1TGNkMU2qBHj5wzfaoqCLn7cPLKvPa23qeffsn9U',
    poolTempLpTokenAccount: '39VEjufVUfdASteaQstBT25zQuLUha8ZrqYQfcDdJ47A',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'BkJVRQZ7PjfwevMKsyjjpGZ4j6sBu9j5QTUmKuTLZNrq',
    serumBids: '8KouZyh14hmqurZZd1YRpwZ9pMVkWWHPnKTsETSYUuQQ',
    serumAsks: 'NBpY6i9KbWx2V5sS3iP54KYYaHg8aVB6WB43ibVFUPo',
    serumEventQueue: 'BMZfHb6CkiYwdgfVkAiiy4SWf6PHuRPFZyZWQNw1uDZx',
    serumCoinVaultAccount: 'F71huJuAGZ8Q9xVxQueLQ8vDQD6Nq8MkJJsyM2S937sy',
    serumPcVaultAccount: 'AbmAd3LgTowBANXnCNPLctxL7PReirJv5VcizvQ3mfah',
    serumVaultSigner: 'E91Pu1z4q4Nr5mGSVcwyDzzbQC3LdDBzmFyLoXfXfg17',
    official: true
  },
  {
    name: 'MER-RAY',
    coin: { ...TOKENSBASE.MER },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['MER-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'BKLCqnuk4qc5iHWuJuewMxuvsNZXuTBSUyRT5ftnRb6H',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'qDqpetCPbbV2n8bgcy4urhDcKYkUNVoEn7xaCQSDzKv',
    ammTargetOrders: '7KU9VPAZ8BMXA29gadnpssgtcoo4Tm1LYnc6Sn5HefcL',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'rmnAGzEwFnim88JLhqj66B86QLJL6cgm3tPDfGiKqZf',
    poolPcTokenAccount: '4Lm4c4NqNyobLGULtHRtgoG4hbX7ytuGQFFcdip4jvBb',
    poolWithdrawQueue: '9qwtjaEnTCHFf6GuTNxPf85hFzJVNJAAXJnWNFi4DmkX',
    poolTempLpTokenAccount: 'H9uyyChWbaXCmNmQu3g4fqKF5xsa7YVZiMvGcsVrCcNn',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '75yk6hSTuX6n6PoPRxEbXapJbbXj4ynw3gKgub7vRdUf',
    serumBids: '56zkA91Mad1HBJpiq8baMi9XhvvnTRNyd6m8hzeu5arh',
    serumAsks: 'BgovKK4YP6ZgLUHsnXeUym1BH5BSjUxDuinTk6shPuzd',
    serumEventQueue: '5NVyybcVeC8wqjgBj3ZxaX3RauWa2iqvdXkUYPJnistu',
    serumCoinVaultAccount: 'EaFu94rusrGHjJWhuuUbKWW2AJizDGbpWJXJa4cxmLCP',
    serumPcVaultAccount: 'ApZdrWpBu2uLkYAeVLneWnDhVrbR6TjhjbBR78kpg5r2',
    serumVaultSigner: 'FCf82FB2TFAfH4YEDkBJtEeSkTK1EQFc27d1iSnvXMjk',
    official: true
  },
  {
    name: 'MEDIA-RAY',
    coin: { ...TOKENSBASE.MEDIA },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['MEDIA-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '5ZPBHzMr19iQjBaDgFDYGAx2bxaQ3TzWmSS7zAGrHtQJ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HhAqmp3r8gaKo9P1ybaEXpwjq5MfmkfD6sRVD4EYs1tU',
    ammTargetOrders: '3Dwo6BD7H2GQMyxoh5nXdmAK7dWfqPMUj3PcrJVqUuEp',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FGskpuYNgqgHU4kHSibgqDkYCCZhxAtpQxZNqFaKfBDK',
    poolPcTokenAccount: '7AiT1Re8Z8m8eLdy5HWRqWvx6pBZMytdWQ3wL8zCrSNp',
    poolWithdrawQueue: '7reJT6i8tnFjf5vbvmRLw6ikZZxs6ZJ8bsEx4iCU22ot',
    poolTempLpTokenAccount: '6LmFCURzNyEsNpF4fgMDyGPX1xoNAnm2oVcrYJJQGv9Y',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '2STXADodK1iZhGh54g3QNrq2Ap4TMwrAzV3Ja14UXut9',
    serumBids: 'FKgbQ8Sdv9d44SMrtLMy58EmP3V59fvjse2UUQ8mNCxd',
    serumAsks: 'CNcZwNeBA1QVL1Kzq3n166RSvUocLrKNs4nzTGXgVPuE',
    serumEventQueue: 'FwHwAcBc54zm8XjtNxvaZG1t84shzYs68z3BAsKZdoE',
    serumCoinVaultAccount: 'Ea7ECm7a3ECLnvJJMpZS9QrWbYnb8LkqVvWCXtmFVzWX',
    serumPcVaultAccount: '54a18egZToocQ2yeCstCrtYZLAj3z82qfLG4Ed1quThb',
    serumVaultSigner: 'F1XJJ2fkPiiYg1hWnDD6phMfDd8Sr8XwM6GKFeAZpTmr',
    official: true
  },
  {
    name: 'SNY-RAY',
    coin: { ...TOKENSBASE.SNY },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['SNY-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'Am9FpX73ctZ3HzohcRdyCCv84iT7nugevqLjY5yTSUQP',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BFxUhqhrUWqMMazhef1dwDGXDo1LkQYV2YAgMfY81Evo',
    ammTargetOrders: 'AKp1o6Nxe224Z8z4tFzyFKdCRoJDFpCen1xHyGXfyxKu',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BjJMnG8c4zMHHZrvxP6ydKYGPkvXL5fF9gC38rtAu2Sx',
    poolPcTokenAccount: '7dwpWj95qzPoBFCL7qzgoj9zhjmNNoDyncbyJEYiRfv7',
    poolWithdrawQueue: '6g5sTJtMw1r9vx4RP5YkN3ZJpSssh7eH8QdVK986xLS2',
    poolTempLpTokenAccount: '9tHcrwFdxNNzosaTkqrejHNXkr2HasKSwczimjBh2F8Z',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HFAsygpAgFq3f9YQ932ptoEsEdBP2ELJSAK5eYAJrg4K',
    serumBids: '6A6njiM3ByNbopETpEfbqsQci3NZecTzheg2YACVFXjc',
    serumAsks: '8YvHQkUCB7HxCAu3muytUTbEXuDGmroVcnwbkXydzyEH',
    serumEventQueue: '8syFMq2kMQV9beCJ9Y5T9TARgUii6aND5MDgDEAAGF73',
    serumCoinVaultAccount: 'F1LcTLXQhFf9ymAHnxFNovSdZttZiVjRBoqQxyPAEipj',
    serumPcVaultAccount: '64UEnruJCyjKUz8vdgZh3FwWwd53oSMY9Knd5dt5oVuK',
    serumVaultSigner: '3enyrrweGCtkVDvaiAkSo2d2tF7B899tWHGSDfEGKtNs',
    official: true
  },
  {
    name: 'LIKE-RAY',
    coin: { ...TOKENSBASE.LIKE },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['LIKE-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'DGSnfcE1kw4uDC6jgrsZ3s5CMfsWKN7JNjDNasHdvKfq',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4hgUQQevH5BauWE1CGGsfsDZbnCUrjd6YsRHB2gQjRUb',
    ammTargetOrders: 'AD3TRMfAuTJXTdxsvJ3E9p6YK3GyNAGDSk4DX26mtmFC',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HXmwydLeUB7JaLWhoPFkDLazQJwUuWCBi3M28p7WfwL7',
    poolPcTokenAccount: 'BDbjkVrTezpirdkk24MfXprJrAi3WXazr4L6DHT5buXi',
    poolWithdrawQueue: 'FFKXu8Q3kaQjnuZsicVyUQNNBwRRLFAT86WqDN8Yz2UV',
    poolTempLpTokenAccount: 'FJguakQVbJmhjVGrzakNGQo5WCm5HG1Uk23X6x75WtZz',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'E4ohEJNB86RkKoveYtQZuDX1GzbxE2xrbdjJ7EddCc5T',
    serumBids: '7vhuHsR1VxAGN4DD5EywRnW9nb7cX3VHcyrAKL1AAJ4v',
    serumAsks: 'KXrJ3YVBvSGpCRETy3M2ronxM55PU8xBmQ2wCWVzhpY',
    serumEventQueue: 'EMTQJ2v3dn4ndnV7UwZTiGTmSNPsVSCgdSN6w5QvCv2M',
    serumCoinVaultAccount: 'EENxPU4YaXqTLBgd5jHBHigpH74MZNq9WxcLaKVsVSvq',
    serumPcVaultAccount: '5c9DtqqCvj5du96cgUCSt2GZp8sreE7uV1Defmb615na',
    serumVaultSigner: 'GWnLv7RwJhceF3YNqawMyEJqg6WgZc6XtT7Bi6prjkyC',
    official: true
  },
  {
    name: 'COPE-RAY',
    coin: { ...TOKENSBASE.COPE },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['COPE-RAY-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '8hvVAhShYLPThcxrxwMNAWmgRCSjtxygj11EGHp2WHz8',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HMwERnf6t8JTR8qnrQDDGxGL2PeBgpzzmQBJQgvXL3NS',
    ammTargetOrders: '9y7m8jaURWcehBkMt6ebgQ92mqaJzZfxW51wBv6dtGR8',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CVCDGPwGmxHyt1HwfJgCYbskEXPTvKxZfR6nkZexFQi5',
    poolPcTokenAccount: 'DyHnyEW4MQ1J28JrqvY7AdMq6Djr3TjvczgsokQxj6YB',
    poolWithdrawQueue: 'PPCMh17bDnu6sZKhipEfXf4ASK4sTpHkWrEX3SBNKRV',
    poolTempLpTokenAccount: 'HReYRwCxu4qEjzkyjsdf67DyEUsWn1Tqf7eisvM3J7ro',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6y9WTFJRYoqKXQQZftFxzLdnBYStvqrDmLwTFAUarudt',
    serumBids: 'Afj14X2pCvbgVzWFAXRC4XBS3B71hZFXiTpVaFEohdCe',
    serumAsks: 'GmZTkEYABdUej3QXXZSf8aeZ1UxLB2WaQ4dhVihKZPB8',
    serumEventQueue: '3PveQeVGVfaa4LpTjhuRtm1Xe3Y9q7iW7YQeGJZYKtc4',
    serumCoinVaultAccount: '9mQ22KCPTyFkJ4dp16Fhpd1pFrVmonS6SMa9L8nM6nLn',
    serumPcVaultAccount: 'BKGiYU9So4XMYYuYiV2d68kcR2wwLogKbi3rmg8ci4xt',
    serumVaultSigner: 'k5mhBL7yqEtAQs1WtUGdMT9eLLZkjambTd1Y4MyGouf',
    official: true
  },
  {
    name: 'ETH-SOL',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['ETH-SOL-V4'] },

    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '9Hm8QX7ZhE9uB8L2arChmmagZZBtBmnzBbpfxzkQp85D',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GwFM8qoBwusXVbcdfreKV9q86vqdudnVtvhYfJWgtgB',
    ammTargetOrders: 'FQp9HzJKEFfiDSnV6qyQNoz8cEKsWHnV3yFqWrT1ThgN',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '59STNbqDpY1sj6m95jBPRiFwjtigtivHqQeJRUofWY2a',
    poolPcTokenAccount: 'HXz1MFnu9ANWfCBesnrzMZMPoFbUyyqPDKT67sqgT4rk',
    poolWithdrawQueue: 'GrLKNkFVyAdV1wXoBFYxMSSPJ3BNekggiZJERrPSnAE2',
    poolTempLpTokenAccount: 'AtQQZJUBrXs8nBKCHy4L2WovuEEVf7QnVWwgRdVbnKd4',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HkLEttvwk2b4QDAHzNcVtxsvBG35L1gmYY4pecF9LrFe',
    serumBids: 'B38zSRMdSHYxnbsWCgY4GvSy4aRytkhqR5qVjaHsNXdA',
    serumAsks: 'E4hWT9G64hLDMY7VrGXfJ5cuU8jRzJsUYAi8fqep6Sqy',
    serumEventQueue: 'Bdy9encMZ7UpbEbdCgh5qDq8qQn4D31tFR45Bdas3f5y',
    serumCoinVaultAccount: 'HMPki4uRhncFhMHpLAacHCDAU4QazjgFTsB8SQgh6bMY',
    serumPcVaultAccount: 'BeWaZ85mTxmrYfS3J9E1jQQ5tKgDRA6qmTpksKnGeNps',
    serumVaultSigner: 'GPNCigFBsjNhXu3cbmU1uxfbGVuxCA8bJN4bobwDjuTm',
    official: true
  },
  {
    name: 'stSOL-USDC',
    coin: { ...TOKENSBASE.stSOL },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['stSOL-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: '6a1CsrpeZubDjEJE9s1CMVheB6HWM5d7m1cj2jkhyXhj',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '28NQqHxrqMYMQ67aWyn9AzZ1F16PYd4zvLpiiKnEZpsD',
    ammTargetOrders: 'B8nmqinHQjyqAnMWNiqSzs1Jb8VbMpX5k9VUMnDp1gUA',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DD6oh3HRCvMzqHkGeUW3za4pLgWNPJdV6aNYW3gVjXXi',
    poolPcTokenAccount: '6KR4qkJN91LGko2gdizheri8LMtCwsJrhtsQt6QPwCi5',
    poolWithdrawQueue: '5i9pTTk9x7r8fx8mJMBCEN85URVLAnkLzZXKyoutUJhU',
    poolTempLpTokenAccount: 'GiuNbiBirwsBp9GuxGYgNUMMKGM6Qf6wqgnxbJFHTYFa',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5F7LGsP1LPtaRV7vVKgxwNYX4Vf22xvuzyXjyar7jJqp',
    serumBids: 'HjJSzUbis6VhBZLCbSFN1YtvWLLdxutb7WEvymCLrBJt',
    serumAsks: '9e37wf6QUqe2s4J6UUNsuv6REQkwTxd47hXhDanm1adp',
    serumEventQueue: 'CQY7LwdZJrfLRZcmEzUYp34XJbxhnxgF4UXmLKqJPLCk',
    serumCoinVaultAccount: '4gqecEySZu6SEgCNhBJm7cEn2TFqCMsMNoiyski5vMTD',
    serumPcVaultAccount: '6FketuhRzyTpevhgjz4fFgd5GL9fHeBeRsq9uJvu8h9m',
    serumVaultSigner: 'x1vRSsrhXkSn7xzJfu9mYP2i19SPqG1gjyj3vUWhim1',
    official: true
  },
  {
    name: 'GRAPE-USDC',
    coin: { ...TOKENSBASE.GRAPE },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['GRAPE-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,

    ammId: 'vVXfY15WdPsCmLvbiP4hWWECPFeAvPTuPNq3Q4BXfhy',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'A7RFkvmDFN4Qev8XgGAqSr5W75sNhhtCY3ZcGHZiDDo1',
    ammTargetOrders: 'HRiPQyFJfzF7WgC4g2cFbxuKgqn1vKVRjTCuZTNGim36',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BKqBnj1TLpW4UEBbZn6aVoPLLBHDB6NTEL5nFNRqX7e7',
    poolPcTokenAccount: 'AN7XxHrrcFL7629WySWVA2Tq9inczxkbE6YqgZ31rDnG',
    poolWithdrawQueue: '29WgH1suwTnhL4JUwDMUQQpUzypet8PHEh8jQpZtiDBK',
    poolTempLpTokenAccount: '3XCGBJpfHV5VYkz92nqzRtHahTiHXjYzVs4PargSpYwS',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '72aW3Sgp1hMTXUiCq8aJ39DX2Jr7sZgumAvdLrLuCMLe',
    serumBids: 'F3PQsAGiFf8fSySjUGgP3NQdAGSnioAThncyfd26GKZ3',
    serumAsks: '6KyB4XprAw7Mgp1YMMsxRGx8T59Y5Lcu6s1FcwFrXy3i',
    serumEventQueue: 'Due4ZmGX2u7an9DPMvk3uX3sXYgngRatP1XmwzEgk1tT',
    serumCoinVaultAccount: '8FMjC6yopBVYTXcYSGdFgoh6AFpwTdkJAGXxBeoV8xSq',
    serumPcVaultAccount: '5vgxuCqMn7DUt6Le6EGhdMzZjPQrtD1x4TD9zGw3mPte',
    serumVaultSigner: 'FCZkJzztVTx6qKVec25jA3m4XjeGBH1iukGdDqDBHPvG',
    official: true
  },
  {
    name: 'LARIX-USDC',
    coin: { ...TOKENSBASE.LARIX },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['LARIX-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'A21ui9aYTSs3CbkscaY6irEMQx3Z59dLrRuZQTt2hJwQ',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '3eCx9tQqnPUUCgCwoF5pXJBBQSTHKsNtZ46YRzDxkMJf',
    ammTargetOrders: 'rdoSiCqvxNdnzuZNUZnsXGQpwkB1jNPctiS194UtK7z',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'HUW3Nsvjad7jdexKu9PUbrq5G7XYykD9us25JnqxphTA',
    poolPcTokenAccount: '4jBvRQSz5UDRwZH8vE6zqgqm1wpvALdNYAndteSQaSih',
    poolWithdrawQueue: 'Dt8fAfftoVcFicC8uHgKpWtdJHA8e4xCPeoVRCfounDy',
    poolTempLpTokenAccount: 'FQ3XFCQAEjK1U235pgaB9nRPU1fkQaLjKQiWYYNzB5Fr',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DE6EjZoMrC5a3Pbdk8eCMGEY9deeeHECuGFmEuUpXWZm',
    serumBids: '2ngvymBN8J3EmGsVyrPHhESbF8RoBBaLdA4HBAQBTcv9',
    serumAsks: 'BZpcoVeBbBytjY6vRxoufiZYB3Te4iMxrpcZykvvdH6A',
    serumEventQueue: '2sZhugKekfxcfYueUNWNsyHuaYmZ2rXsKACVQHMrgFqw',
    serumCoinVaultAccount: 'JDEsHM4igV84vbH3DhZKvxSTHtswcNQqVHH9RDq1ySzB',
    serumPcVaultAccount: 'GKU4WhnfYXKGeYxZ3bDuBDNrBGupAnnh1Qhn91eyTcu7',
    serumVaultSigner: '4fGoqGi6jR78dU9TRdL5LvBUPjwnoUCBwxNjfFxcLaCw',
    official: true
  },
  {
    name: 'RIN-USDC',
    coin: { ...TOKENSBASE.RIN },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['RIN-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7qZJTK5NatxQJRTxZvHi3gRu4cZZsKr8ZPzs7BA5JMTC',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '21yKxhKmJSvUWpL3doX5QwjXKXuzm3oxCG7k5Kima6hu',
    ammTargetOrders: 'DaN1UZZ1ExraQi1Ghz8YS3pKaZG44PASbNiApysiRSRg',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '7NMCVudgyHKwVXA62Rv2cFrucQiNYE9b5MMvn4cVtCPW',
    poolPcTokenAccount: '4d9Q2ekDzHqX51Nu9EZHZ96PhGjLSpVosa5Nci7BbwLe',
    poolWithdrawQueue: 'DjHe1Sj7fouU5gJEiFz7C4Vd5TtvApEAxWr5EVhTuEps',
    poolTempLpTokenAccount: 'EpKgUgtmTL425M9ENLqbjupm5funsPdhVr37hB8hJiuy',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7gZNLDbWE73ueAoHuAeFoSu7JqmorwCLpNTBXHtYSFTa',
    serumBids: '4mSS9iidPrVmMV9D7CNJia5zza2apmBLe3SmYW8SNPFR',
    serumAsks: '7ovw7s6Ta1EQY4PsMu1MvnHfUNyEDADacmc4Rd5m34UD',
    serumEventQueue: '2h7YS1nRQqc86jGKQLT29xnfBk9xVQrzXx9yiB21P5gK',
    serumCoinVaultAccount: '5JCpfGbNdFhXWxMFR4xefBfLEd2qxYgovEggS6wxtmQe',
    serumPcVaultAccount: 'FQfVJz7STBGMheiAAuZdF8ndyvbJhJZWJvpKhFKqSqYh',
    serumVaultSigner: 'DFoStusQdrMbHms9Sce3tiRwSHAnaPLEtXCaFAnrhSy3',
    official: true
  },
  {
    name: 'APEX-USDC',
    coin: { ...TOKENSBASE.APEX },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['APEX-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '43UHp4TuwQ7BYsaULN1qfpktmg7GWs9GpR8TDb8ovu9c',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '5SrvK4rUdhRAekLxYnDb552x1DzQP4F42mydUcxMMNJD',
    ammTargetOrders: '8W9P9rDx5a8C234jWLaUT7x4RGUGscXx2oCpS3eMfGUo',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3tMBycaDewfj2trk1HP1ZSRb4YEJQs6k7nFAk4jTrRtN',
    poolPcTokenAccount: 'DRDqm7rLuGnkh9RU1H2aaaJihRSU2Yg3WhropTWmcpWW',
    poolWithdrawQueue: 'HA1wfa31ogn6eMY6174gNVf9LGjfjAhBdMaYtCkWBLhx',
    poolTempLpTokenAccount: 'BPJ6HpvGBpQ5TUezSv3NzicANEq8Grma6QmPV1gXKnx8',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GX26tyJyDxiFj5oaKvNB9npAHNgdoV9ZYHs5ijs5yG2U',
    serumBids: '3N3tX1CLNCsnEffqhNBkiQxo34VJBPE7dbYUWsy4M6UD',
    serumAsks: 'BLCo9efr528yH73zJU47FCDKzvsJAYFGdYkPgHb8yWxJ',
    serumEventQueue: '3St3PhenFusFH1Guo7WQhNeNSfwDNpJQScDJ1EhRcLai',
    serumCoinVaultAccount: 'CEGcRVzSbX5hGpsKsPX8zhTMm8N4xJSTH1VFEcWXRUmE',
    serumPcVaultAccount: '7Q1TDhNbhpN9KN3vCRk7WhPi2EaETSCkXpsTdaDppvAx',
    serumVaultSigner: 'GprUwgGyqBiEC5e6ivxgpUf7uhpS17n7WRiU7HDV3VGk',
    official: true
  },
  {
    name: 'mSOL-RAY',
    coin: { ...TOKENSBASE.mSOL },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['mSOL-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '6gpZ9JkLoYvpA5cwdyPZFsDw6tkbPyyXM5FqRqHxMCny',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'HDsF9Mp9w3Pc8ZqQJw3NBvtC795NuWENPmTed1YVz5a3',
    ammTargetOrders: '68g1uhKVVLFG1Aua1BKtCx3uiwPixue1qqbKDJAc32Uo',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'BusJVbHEkJeYRpHkqCrt85d1LALS1EVcKRjqRFZtBSty',
    poolPcTokenAccount: 'GM1CjxKixFkKpakxx5Lg9u3zYjXAK2Gr2pzoy1G88Td5',
    poolWithdrawQueue: 'GDZx8SZSYsRKc1WfWfbqR9JaTdBEwHwAMcJuYk2rBm74',
    poolTempLpTokenAccount: 'EdLjP9p2AA7zKWwRPxKx8SKFCJ9awfSxnsPgURX6HuuJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HVFpsSP4QsC8gFfsFWwYcdmvt3FepDRB6xdFK2pSQtMr',
    serumBids: '7ZCucutxHFwJjfUmxD1Pae8vYg9HB1WQ6DhRkueNyJqF',
    serumAsks: '6cM5rqTHhngGtifjK7pUwved3CdHKZgFj7nnP3LsP325',
    serumEventQueue: 'Gucy2LXDFjWBZEFX4gyrqr6xEb2AWRf4VVgqX33ZXkWu',
    serumCoinVaultAccount: 'GPksxJSxy5pEigdtSLBBZuRQEuGPJRT2ah3J1HwMeKm5',
    serumPcVaultAccount: 'TACxu78UJHz2Vzg2HwGa2w9mvLw2mY5mL7Q3ho9W6J9',
    serumVaultSigner: 'FD6U73ZW2YkD9R8cbDT6KSamVodYqWJBtS3ZcPeU7X29',
    official: true
  },
  {
    name: 'MNDE-mSOL',
    coin: { ...TOKENSBASE.MNDE },
    pc: { ...TOKENSBASE.mSOL },
    lp: { ...LP_TOKENSBASE['MNDE-mSOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '2kPA9XUuHUifcCYTnjSuN7ZrC3ma8EKPrtzUhC86zj3m',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'G3qeShDT2w3Y9XnJbk5TZsx1qbxkBLFmRsnNVLMnkNZb',
    ammTargetOrders: 'DfMpzNeT4XHs2xtN74j5q94QfqPSJbng5BgGyyyChsVm',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'F1zwWuPfYLZfLykDYUqu43A74TUsv8mHuWL6BUrwVhL7',
    poolPcTokenAccount: 'TuT7ftAgCQGsETei4Q4nMBwp2QLcDwKnixAEgFSBuao',
    poolWithdrawQueue: '5FoP78mNninxP5VbSHN3LfsBBbqMNqiucANGQungGJLV',
    poolTempLpTokenAccount: '2UbzfMCHjSERpMo9C3BAq5NUhVF9sx39ruJ1zu8Gf4Lu',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'AVxdeGgihchiKrhWne5xyUJj7bV2ohACkQFXMAtpMetx',
    serumBids: '9YBjtad6ZxR7hxNXyTjRRPnPgS7geiBMHbBp4BqHsgV2',
    serumAsks: '8UZpvreCr8bprUwstHMPb1pe5jQY82N9fJ1XLa3oKMXg',
    serumEventQueue: '3eeXmsg8byQEC6Q18NE7MSgSbnAJkxz8KNPbW2zfKyfY',
    serumCoinVaultAccount: 'aj1igzDQNRg18h9yFGvNqMPBfCGGWLDvKDp2NdYh92C',
    serumPcVaultAccount: '3QjiyDAny7ZrwPohN8TecXL4jBwGWoSUe7hzTiX35Pza',
    serumVaultSigner: '6Ysd8CE6KwC7KQYpPD9Ax8B77z3bWRnHt1SVrBM8AYC9',
    official: true
  },
  {
    name: 'LARIX-RAY',
    coin: { ...TOKENSBASE.LARIX },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['LARIX-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'EBqQdu9rGe6j3WGJQSyTvDjUMWcRd6uLcxSS4TbFT31t',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'MpAAS4U2fQnQRhTc1dAZEzLuQ9G4q6qRSUKwTJbYynJ',
    ammTargetOrders: 'A1w44YMFKvVXFnXYTrz7EVfSgjHdZfE67g59HdhE1Yfh',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6Sq11euWaw2Hpd6bXMZccJLZpPcVgs3nhV7P5396jE7e',
    poolPcTokenAccount: '12iyJhJgr9AeJrL6q6jAN63zU3YgpPV98CR87c6JGoH4',
    poolWithdrawQueue: 'BD3rgKtrnxdi45UpCHEMrtBtSA2NRcpP9zrah1CWN35a',
    poolTempLpTokenAccount: 'Hc3pK8xppE3NxexxjAz4sxs3ZKwGjKfo7Lpth3FdGeQ6',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5GH4F2Z9adqkEP8FtR4sJqvrVgBuUSrWoQAa7bVCdB44',
    serumBids: '8JdtK95nRc3sHkDdFdtMWvJ9fXFY67LMo74RiHTh8f3a',
    serumAsks: '99ScAmHwokD3Zs5assDwQHxunZe1Fz1N9GL9L1YUbvgr',
    serumEventQueue: 'feXvc7XGRDETboXZiCMShmSKvsTnZtxrKoBkjJMCkNf',
    serumCoinVaultAccount: '5uUh8pUvYzEjPtofPbappZBswKieWtLW7d32yuDNC6tw',
    serumPcVaultAccount: '6eRt1RkQokKk5gmVmJ85gY42xirTMXQ1QDLXiDmbXs4b',
    serumVaultSigner: '4pwBSrGHpVn1qXjzDC2Tm8nFG8mxR9y2qudFjAQ8cVQy',
    official: true
  },
  {
    name: 'LIQ-USDC',
    coin: { ...TOKENSBASE.LIQ },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['LIQ-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '33dWwj33J3NUzoTmkMAUq1VdXZL89qezxkdaHdN88vK2',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'H4zMatEWC1cgzpJd4Ckw29M7FD6h6gpVYMs8ATkVYsee',
    ammTargetOrders: 'Gz9e8TUgQg2XwPvJs5CwijFyYgRL43LiB3CeWNTkkcsu',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'GGQU74M6ikrn8Cj7qywpmj6qdx2nKJLXGb34MbtPChoh',
    poolPcTokenAccount: 'DHoRYvCnFfL53zpq6ZbdHj9wdbtYpK4ip9ieFkk1TyLw',
    poolWithdrawQueue: '6gsvjkgSsxWtQRxYQ6J8uZPPhpgyoM6HwBJDpp2DzPon',
    poolTempLpTokenAccount: '7y59c7yGzLJGS8HmERaZgnbkgpKeAaAKSML3Jnsz4r4f',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'D7p7PebNjpkH6VNHJhmiDFNmpz9XE7UaTv9RouxJMrwb',
    serumBids: 'HNrzaujyABxtAcGyAqCJNcbfiJT4SLHGHuwBkVH4Zmiz',
    serumAsks: 'Fm2BPhsTnozBGLhFzd5iKfoBjKRWDEoCGC78xBEJg5P',
    serumEventQueue: 'CXhqNRvzdgrG8TRHjzUiymQFS7NNL8nGMyUvrQT3XPnu',
    serumCoinVaultAccount: 'GuivK7Kd7aiJT9gTnhDskqUpbUD5Yur3f2NyygvwhA9B',
    serumPcVaultAccount: 'ZKoVkBhZ9DJvuCMLvuPvZnhFTCQFAoF1BmVZZ1SqgPg',
    serumVaultSigner: 'GfX8cR4p9BWr47RknXetRvmHdCnbd1qRhi59kyibq6V4',
    official: true
  },
  {
    name: 'WAG-USDC',
    coin: { ...TOKENSBASE.WAG },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['WAG-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'FEFzBbbEK8yDigqyJPgJKMR5X1xZARC25QTCskvudjuK',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8PAAfUWoVsSotWUGrL6CJCT2sApMpE2hn8DGWXq4y9Gs',
    ammTargetOrders: 'BFtdbsu9Tq8mup8osWretDzTbWF71WuzRBHtm7G6PVpS',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'AZPsv6tY1HQjmeps2sMje5ysNtPKsfbtxj5Qw3jcya1a',
    poolPcTokenAccount: '9D6JfNjyi6dXBYGErxmXmezkauPJdHW4KjMr2RGyD86Y',
    poolWithdrawQueue: '6i1US4rvtqxPUTwqq6ax381zVgry44rX3oG7gD7VJAef',
    poolTempLpTokenAccount: 'F6MrQn7qPTbDmp7ZGQkJ3ztB1uzBtVoc7iNcR6CyqCBM',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'BHqcTEDhCoZgvXcsSbwnTuzPdxv1HPs6Kz4AnPpNrGuq',
    serumBids: 'F61FtHm4R4F1gszB3FuwDPvXeSPQwNmHTofoYCnrV4FY',
    serumAsks: '5tYcHCW3ZZK4TMUSYiTi4dEE7iefyQ9dE17XDDAmDf92',
    serumEventQueue: 'C5gcq3kmmXJ6ADWvH3Pc8bpiBQCL5cx4ypRwPg5xxFFx',
    serumCoinVaultAccount: '6sF1TAJjfrNucAqaQFRrMD78z2RinTGeyo4KsXPbwiqh',
    serumPcVaultAccount: '5iXoDYXGnMxEwL65XTJHWdr6Z2UD5qq47ZijW24VSSSQ',
    serumVaultSigner: 'BuRLkxJffwznEsxXEqmXZJdLh4vQ1BRXc41sT6BtPV4X',
    official: true
  },
  {
    name: 'ETH-mSOL',
    coin: { ...TOKENSBASE.ETH },
    pc: { ...TOKENSBASE.mSOL },
    lp: { ...LP_TOKENSBASE['ETH-mSOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'Ghj3v2qYbSp6XqmH4NV4KRu4Rrgqoh2Ra7L9jEdsbNzF',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'ABPcKmxjrGqSCQCvTBtjpRwLD7DJNmfhXsr6ADhjiLDZ',
    ammTargetOrders: '7ATMf6E5StLSAtPYMoLTgZoAzmmXmii5CC6f5HYCjdKn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8jRAjkPkVLeBwA4BgTvS43irS8HPmBKXmqU6WonpdkxT',
    poolPcTokenAccount: 'EiuYikutCLtq1WDsinnZfXREM1vchgH5ruRJTNDYHA7b',
    poolWithdrawQueue: 'GVDZeTpSkseFrsooLNpeZzpzL3WkYo7cSVMLRHCKqbcQ',
    poolTempLpTokenAccount: 'DZxRzxsztb5u3TFQaZd3ce8aNUbAikLAH79x2MMNdH86',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3KLNtqA8H4Em36tifoTHNqTZM6wiwbprYkTDyVJbrBuu',
    serumBids: 'GaGvreFFZ89SKsRMxn1MbDXwEvLKH7nd2EbykAEzvaRn',
    serumAsks: 'CmktYGnATPGCus9rypT2q2GmEtXx6jv14Hz5v59iN9Em',
    serumEventQueue: '12kgGbCNQjcKWnezanmCfPodE2kkoWTojgmGkt47HhCH',
    serumCoinVaultAccount: 'DPdJZDKtTiaaqd52LPCvqyMPPNnJE3dSGAKVnZbsUSNm',
    serumPcVaultAccount: '5fpAmGMAqtkueG5w2doNDeBncFUvh4zgBsYoCwpGBkMA',
    serumVaultSigner: 'H6uYBVPb36jnUUxzGFWadNvuqMnCr12Sx6EbmebqwgfC',
    official: true
  },
  {
    name: 'mSOL-USDT',
    coin: { ...TOKENSBASE.mSOL },
    pc: { ...TOKENSBASE.USDT },
    lp: { ...LP_TOKENSBASE['mSOL-USDT-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'BhuMVCzwFVZMSuc1kBbdcAnXwFg9p4HJp7A9ddwYjsaF',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '67xxC7oyzGFMVX8AaAHqcT3UWpPt4fMsHuoHrHvauhog',
    ammTargetOrders: 'HrNUwbZF4NPRSdZ9hwD7EWV1cwQoJ9Yhu9Jf7ybXALpe',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FaoMKkKzMDQaURce1VLewT6K38F6FQS5UQXD1mTXJ2Cb',
    poolPcTokenAccount: 'GE8m3rHHejrNf4jE96n5gzMmLbxTfPPcmv9Ppaw24FZa',
    poolWithdrawQueue: '4J45miDrQ5UdqpLzunHAYUqTg8A78CHKeBwa6a1TvFeF',
    poolTempLpTokenAccount: '7WCk8sFJiUnpGbzHpFF9FsV5oJQgKs5iBERysFDyywnq',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HxkQdUnrPdHwXP5T9kewEXs3ApgvbufuTfdw9v1nApFd',
    serumBids: 'wNv6YZ31PX5hS42XCijwgd7SuMAu63aPvDWjMNTM2UP',
    serumAsks: '7g28QYJPPNypyPvoAdir8WzPT2Me78u78jufiG7M3wym',
    serumEventQueue: 'Ee9UPY9CH2jHx2LLW2daLyc9VS5Bnp4yTykw4aveeXLX',
    serumCoinVaultAccount: 'FgVVda2Wnp2PuDpuh23B341qZx2cnArqVNSgxsU877Y',
    serumPcVaultAccount: '2PtdrUGJd7aYoMKXpQ5d19r5Aa1z8dkRj6NNRCNGTE3D',
    serumVaultSigner: 'QMhH9Mnv1jg8tLNanAvKf3ymbuzh7sDENyjCgiyn3Kk',
    official: true
  },
  {
    name: 'BTC-mSOL',
    coin: { ...TOKENSBASE.BTC },
    pc: { ...TOKENSBASE.mSOL },
    lp: { ...LP_TOKENSBASE['BTC-mSOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'ynV2H2b7FcRBho2TvE25Zc4gDeuu2N45rUw9DuJYjJ9',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FD7fCGepsCf3bBWF4EmPHuKCNuE9UmqqTHVsAsQSKv6b',
    ammTargetOrders: 'HBpTcRToBmQKWTwCHgziFhoRkzzEdXEyAAqHoTLpyMXg',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CXmwnKYkXebSbiFdNa2AVF34iRQPaf6jecyLWkEra6Dd',
    poolPcTokenAccount: 'GtdKqFoUtHC8vH1rMZvW2eVqqFa3vRphqkNCviog4LAK',
    poolWithdrawQueue: '3gctDYUqCgeinnxecj3iifkopbG88Ars14QhAf6UoCwY',
    poolTempLpTokenAccount: '5TrJppACzkDAra1MUgZ1rCm4pvYZ2gVYWBAXPt7pMQDt',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HvanEnuruBXBPJymSLr9EmsFUnZcbY97B7RBwZAmfcax',
    serumBids: 'UPgp2Apw1weBoAVyozcc4WuAJrCJPf6ckSZa9psCe63',
    serumAsks: 'HQyMusq5noGcSz2VoPqvztZyEAy8K1Mx6F37bN5ppH35',
    serumEventQueue: 'D4bcCmeFca5rF8KC1JDJkJTiRLLBmoQAdNS2x7zTaqF4',
    serumCoinVaultAccount: 'DxXBH5NCTENPh6zsfMstyHhoBtdaVnYSzHgaa6GyVbfY',
    serumPcVaultAccount: '9XqpiagW7bnAbMwpc85M2hfrcqxtvfgZucyrYPAPkcvq',
    serumVaultSigner: 'mZrDXx1TQizPd9CzToBx8FqqrPCPdePHy6ttgBdNPuB',
    official: true
  },
  {
    name: 'SLIM-SOL',
    coin: { ...TOKENSBASE.SLIM },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['SLIM-SOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '8idN93ZBpdtMp4672aS4GGMDy7LdVWCCXH7FKFdMw9P4',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'E9t69DajWSrPC2acSjPb2EnLhFjXaDzcWsfZkEu5i26i',
    ammTargetOrders: 'GtE4pXKu4Ps1oFP6Y2E7mu2RyqCJxoSqE9Cz3qwQRLRD',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6FoSD24CM2MyadTwVUqgZQ17kXozfMa3DfusbnuqYduy',
    poolPcTokenAccount: 'EDL73XTnmr56U4ohW5uXXh6LJwsQQdoRLragMYEWLGPn',
    poolWithdrawQueue: '8LEzGejBbTP7q5mNKru5vjK1HMp9XriEsVv4SAvKTSy9',
    poolTempLpTokenAccount: '3FXv4555tehX7tBwbTL1MkKxLm9Q28dJFvh32wnFoEvg',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GekRdc4eD9qnfPTjUMK5NdQDho8D9ByGrtnqhMNCTm36',
    serumBids: 'GXUZncBwk2iGYNbUtyCYon1CWu8tpTGqnyjYGZZQLuf9',
    serumAsks: '26fwQXsb5Gh5uPAwLCwBvHj6nqtXhL3DpPwYdtWKFcSo',
    serumEventQueue: '6FKmUUXSu11nnYwbWRpwQQrgLHScxDxyDdBD9MGbs23G',
    serumCoinVaultAccount: 'NwNLSyB41djEmYzmqWVbia4p3kVZuqjFpdC7c72ZAZC',
    serumPcVaultAccount: '87FwRiq7Ct7Tvc2KUVPGvssbKwPAM7BLTzV9ixS3g6Y9',
    serumVaultSigner: 'Fv9vYZoH5t9bGnyLrV7ifGt74vz4qvtsAUyZbLXX7qoz',
    official: true
  },
  {
    name: 'AURY-USDC',
    coin: { ...TOKENSBASE.AURY },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['AURY-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'Ek8uoHjADzbNk2yr2HysybwFk1h2j9XXDsWAjAJN38n1',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BnGTcze1GXtCMkFPceWfUC4HPRXjJo5dGb2bmevHfgL3',
    ammTargetOrders: '2h5kDQddqUTUaAjFv3FHNMtvVVCYo1PY6BxkxtkhVzkH',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'JBvjQsg5YasDvmSKnetHZzUesa1Aucp6gXwGtPhjefGY',
    poolPcTokenAccount: '2auTq31drUwTmMKsJcD2KqZnKgiTRTN1XDKS9CQ7wzGe',
    poolWithdrawQueue: 'BngHmGEaQbDF9LacaSs1hQRFMVmkvEqFpo5h5gkiWQRB',
    poolTempLpTokenAccount: '5wdZqTKhpnFwWSC3mxEH4QHd9o8Jwt7swqB2QPBJb5yf',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '461R7gK9GK1kLUXQbHgaW9L6PESQFSLGxKXahvcHEJwD',
    serumBids: 'B8yZ7jW9UAKLTtPTGzfobqfn9J4obmwy8BtdX17joKVt',
    serumAsks: '8cytrpCzPUiFub2Zjxhz4VN6sz5UycVYWPEpyVteARXh',
    serumEventQueue: 'Dg1CmXWtyHwoi71GVgpp9N4u7wQtcmuGcXbh9Bgpd9wb',
    serumCoinVaultAccount: 'HbYw9LSKVepB9mYwbTeDy6oAj5TPrw3GqAFtKWm99jNd',
    serumPcVaultAccount: '6DbF2jRhrNgeZnHGR6c1UfGmQxk4qtBueox56huK8Etr',
    serumVaultSigner: '639H2jxUJRbvNiCQnkypf4Nvz72bSdbexchvcCg2jHYR',
    official: true
  },
  {
    name: 'PRT-SOL',
    coin: { ...TOKENSBASE.PRT },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['PRT-SOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7rVAbPFzqaBmydukTDFAuBiuyBrTVhpa5LpfDRrjX9mr',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7nsGyAGAawvpVF2JQRKLJ9PVwE64Xc2CzhbTukJdZ4TY',
    ammTargetOrders: 'DqR8zK676oafdCMAtRm6Jc5d8ADQtoiUKnQb6DkTnisE',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Bh8KFmkkXZQzNgQ9qpjegfWQjNupLugtoNDZSacawGbb',
    poolPcTokenAccount: 'ArBXA3NvfSmSDq4hhR17qyKpwkKvGvgnBiZC4K36eMvz',
    poolWithdrawQueue: '4kj6urHjHG3DD8eEdSrMvKQ3P1sL5wvaTakHoZqaTLLx',
    poolTempLpTokenAccount: '6u5JagDxsfVwGe543NKAviCwRUEXV9XCXEBXFFcUPcoT',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'H7ZmXKqEx1T8CTM4EMyqR5zyz4e4vUpWTTbCmYmzxmeW',
    serumBids: '5Yfr8HHzV8FHWBiCDCh5U7bUNbnaUL4UKMGasaveAXQo',
    serumAsks: 'A2gckowJzAv3P2fuYtMTQbEvVCpKZa6EbjwRsBzzeLQj',
    serumEventQueue: '2hYscTLaWWWELYNsHmYqK9XK8TnbGF2fn2cSqAvVrwrd',
    serumCoinVaultAccount: '4Zm3aQqQHJFb7Q4oQotfxUFBcf9FVP6qvt2pkJA35Ymn',
    serumPcVaultAccount: 'B34rGhNUNxnSfxodkUoqYC3kGMdF4BjFHV2rQZAzQPMF',
    serumVaultSigner: '9ZGDGCN9BHiqEy44JAd1ExaAiRoh9HWou8nw44MbhnNX',
    official: true
  },
  {
    name: 'LIQ-RAY',
    coin: { ...TOKENSBASE.LIQ },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['LIQ-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'HuMDhYhW1BmBjXoJZBdjqaqoD3ehQeCUMbDSiZsaXSDU',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7wdwaVqX54dpmHsAv1p1j6CNX384ngTdPw6hhyrqnSkm',
    ammTargetOrders: '35KVohngiK6EuhFVSycgVkedgmxGjyebjHBEWnTmZSaJ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DNfbb7s6zD1kWpGHCCEv6BrLYUFdvoqbLE7pkRpWEAD3',
    poolPcTokenAccount: '6tPg3nmHnvN8HfCfLC9EEpB1dvV3sB5XtwaQeqpwaqzY',
    poolWithdrawQueue: '2bQ5JURC12KdxzigEzUTC15wMvFb8Lf6UQWDMTr4by3f',
    poolTempLpTokenAccount: 'Exj93mjyV378SD3CTDAyh5V5zEf9pSPU12yKJtp3hjgQ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FL8yPAyVTepV5YfzDfJvNu6fGL7Rcv5v653LdZ6h4Bsu',
    serumBids: 'BkiWgktHinZLpc6ochQGUujh4aLQL7S9ZvhnRY64Z5Je',
    serumAsks: 'EcHLYi56KcNKsiUiHb7mXrT29YJhArdizegkjmVJ6LeJ',
    serumEventQueue: '9U3PefXaFHYiTaCz2p4SsW6X5RK9Kq7FxUeB3PTwpG1a',
    serumCoinVaultAccount: '3VB8kEgcpuFzSf6Nbe3Nm2BiUNGxmJpZGbYSoqnDruRp',
    serumPcVaultAccount: 'DYRShjB8necZU1Qx9FVPDLSjuu3zEkbHgd6BEkMZPS23',
    serumVaultSigner: 'CEhFiD6xAgRptnuyUJg3iAkN7Zi65ZNoyi9uBPt5V8Y',
    official: true
  },
  {
    name: 'SYP-SOL',
    coin: { ...TOKENSBASE.SYP },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['SYP-SOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'D95EzH4ZsGLikvYzp7kmz1RM1xNMo1MXXiXaedQesA2m',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '34Ggyj2dNyQUWDaGUaMKVvyQDoTHEupD4o2m1mPFaPVf',
    ammTargetOrders: 'DAadSXEyP5dZPiYFKcEkj6i7rY5TQtHucXPvum53uAHY',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4iuHfu5rPzdsnjBEPAdGvnK3brF3JiqpwtXerko1o6U4',
    poolPcTokenAccount: '5FvQrUmnCN4o1HBsA3XqbCDPypvyroJ9MBSYH5goxFGC',
    poolWithdrawQueue: '3sXFB5JFTi38cVbJaAf6b95GJp8UqgbBX5YMcPg5sBsH',
    poolTempLpTokenAccount: 'CdQQS6QJLR6it5bNfmpiU6uQod6Z71scF5ZuGTzrwdut',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '4ksjTQDc2rV3d1ZHdPxmi5s6TRc3j4aa7rAUKiY7nneh',
    serumBids: 'BgzeMbya7kgtaV9zNhF4L6oABQSrErg9ZiDFDWeUqpv1',
    serumAsks: '8L6HcYpMr4TqaEksbUy7GkGBUvPv8UARCVH4nhbrfZFt',
    serumEventQueue: 'J99229xgQtGXN7jvWFh6wB73kT44X269GEtjaykkcuf5',
    serumCoinVaultAccount: 'GkM6SiD2GFKTuqJraMuWbPVYcvEvzPqjndsKq3GfYEX4',
    serumPcVaultAccount: 'FF6EXqFSZzUvyuj6uYRWxTFDAhd5jcz57PL69BAMPutd',
    serumVaultSigner: 'BmNvsW45ZLYrnSZpFHFL3xmTyWsJ1X6jof3XoCkEry6H',
    official: true
  },
  {
    name: 'SYP-RAY',
    coin: { ...TOKENSBASE.SYP },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['SYP-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '3hhSfFhbk7Kd8XrRYKCcGAyUVYRaW9MLhcqAaU9kx6SA',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '9WAbiCgjiYeV9aBh8jo2eX8ujAhfEZdZPxPeBtEemz9t',
    ammTargetOrders: '43FmUjW5ZLQ9VeZA7B5gCqJ5fmvJgXHn2zfistpxJt8t',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'FPPZjSgvMJ9EkKJpsTFNnGNJYAbiteskZQGHieVh9Mfh',
    poolPcTokenAccount: 'FEB62fNjbKaPPc9YBnuA2SMacyQhqQw5XTy5d5kTS1oW',
    poolWithdrawQueue: '6MMAE9t29jmuckFgmYojPQk5pJB4TTHJxAmTvWfHAkBr',
    poolTempLpTokenAccount: 'EbNabXhGffsMVn2QyaRVgaR9M1M2NM9AZWCCKMLuZSRT',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '5s966j9dDcs6c25MZjUZJUCvpABpC4gXqf9pktwfzhw1',
    serumBids: '6ESsneZ4fQgPE6MUKsP6Z8kzAZk9RGeVg3uffVqhuJXb',
    serumAsks: 'F2SRQpGR8z4gQQxJ1QVdrzZr7gowTLmfXanTsWmBbzTf',
    serumEventQueue: '6WpyfUCGwDBMgMng5kqsYeGHq4cmFP7X5zyXSs6ZZJ93',
    serumCoinVaultAccount: '5reSWxhb7uugMzxQXPEfYY7zaveCmHro7juk3VzQJx9T',
    serumPcVaultAccount: '4S5XZnwyd7kB1LnY55rJmXjZHty3FGAxyqQaNHphqfzC',
    serumVaultSigner: 'BBaMkoum9hY53mCXAGqMcP2hMSzEyS7Nr12RLY395eCL',
    official: true
  },
  {
    name: 'SYP-USDC',
    coin: { ...TOKENSBASE.SYP },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SYP-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '2Tv6eMih3iqxHrLAWn372Nba4A8FT8AxFSbowBmmTuAd',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GNHftHYD7WRG5HYdyWjd9KsxjUgUALrLcSG2AZvv5ahU',
    ammTargetOrders: '89weJGn5qci3QF1tPQC3P4B3xMbKqdgeXSHfiNxKvKCd',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '9ZQNgn9zAc9oLKST5yW9PNjCCqSfJVwnFpfgZnd88Xn1',
    poolPcTokenAccount: 'HLtqBqwgdbGdFfd5UZtKkvrdxLLcpaMnAJ5aZAzDjFdT',
    poolWithdrawQueue: '4LybXzk5xxLPRsz8evCNtNXLc6Mydb5HCWyitHeDvCKT',
    poolTempLpTokenAccount: '5WKtEZL7Zst2QBKA5E9YCbKMPxTZNrErGB8TyGs3z9oD',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '9cuBrXXSH9Uw51JB9odLqEyeF5RQSeRpcfXbEW2L8X6X',
    serumBids: 'EmqbfgZFSQxAeJRWKrrBVST4oLsq8aMt4WtcufPARcd7',
    serumAsks: 'GZqx3xX1PjNpmw2qDGhiUSa6PsM5tWYY7cMmKzYFCCLD',
    serumEventQueue: '8w8JzuqcRUm9QAC3YWJm2mBCVjWDLXh8b7ktSouJKMUd',
    serumCoinVaultAccount: '8DGcP5Z8M878mguFLohaK9jFrrShDCREF3qa7JhMfgib',
    serumPcVaultAccount: 'CLS4WFje2PbV3MmV4v7CGxu3bNFqx2sYewq95rzGR8t8',
    serumVaultSigner: 'FBLtcfAXmm5PpJLLr95L5cjfgbpJiGHsWdBXDpC2TBQ2',
    official: true
  },
  {
    name: 'FAB-USDC',
    coin: { ...TOKENSBASE.FAB },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['FAB-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7eM9KWYiJmNfDfeztMoEZE1KPyWD54LRxM9GmRY9ske6',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4JJD9FBTigYALJgmJ5NN7uSAdm4UF3MqcfQG6zaDcZSj',
    ammTargetOrders: 'PknPGRn3K3HPzjyaKjSAqDWqXm65TRzQzsSjG6dibPn',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Dz7UPsYuDnCPfomPDS1qzhGXqerPhoy7PYScv99JDefh',
    poolPcTokenAccount: '3Xo2iExmhn4X3yrKmwsRTMMTg2mXdWuEQD2BVweNyCCr',
    poolWithdrawQueue: '4bneChpQF8xrjB7TAYZvBm5xgxncZgn4skZxKV4r3ByM',
    poolTempLpTokenAccount: '7npJaUpN2TFcMStrQKVPjEcKD9Ju5wpyJHcnVW54Z1Ye',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Cud48DK2qoxsWNzQeTL5D8sAiHsGwG8Ev1VMNcYLayxt',
    serumBids: 'FWSRaqAPmbwepdz49MVvvioTLWTXW18XCtEvfSv3ytBV',
    serumAsks: '21CBXgZHF58nfFJVts6rAphuPNsbj6JY8CacokMdhpNB',
    serumEventQueue: '6qdexKV3nXYtkZkh49fSFrzEStdmaGj8HttNWSG2ZViT',
    serumCoinVaultAccount: '71E7dr2Rodeneu6wPn8oofCpLQJjfDHr6r76HGCDv491',
    serumPcVaultAccount: '8gU7HWyk3X41ebNkMH44JhEWq1nzRGdWwGgZaJfr4zGR',
    serumVaultSigner: 'GuLwNbHHLDyNtYF5qv16boMKvdek5AFK8v7PZ2hMgvdv',
    official: true
  },
  {
    name: 'WOOF-RAY',
    coin: { ...TOKENSBASE.WOOF },
    pc: { ...TOKENSBASE.RAY },
    lp: { ...LP_TOKENSBASE['WOOF-RAY-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '3HYhQC6ne6SAPVT5sPTKawRUxv9ZpYyLuk1ifrw8baov',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'Bo8BrjEpfu7pJVH32FTE6rJr2UBvhPp59zfA2mWT581U',
    ammTargetOrders: '4JZBoQLkpgPzdwLBbQeZ6PQj11vtLomuRtSFE4Xkc3CJ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5cjmkkBTx5QecZh78iwwVRUobE25fyjJZQcfEXdzWo37',
    poolPcTokenAccount: 'DPLFfchYfphyS86uLRx2gqHTTy8urWBGt1yYC2a6xUHX',
    poolWithdrawQueue: '7UYg1Gh4tipvNdYYC4rqqLapcs9szENKkrgrEKmDqtJu',
    poolTempLpTokenAccount: 'DQAeQPjQqB733mJfJbt4wHfA2fHVM6bVgaUGNjCerJjE',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'EfckmBgVkKxBAqPgzLNni6mW1gbHaRKiJSJ3KgWihZ7V',
    serumBids: '4WfAKMzXH2Gbcx6tafVy2CwpKDbqFqtx5CbAr877ivx5',
    serumAsks: 'H8WLtDAhcJZLW3J1g2sNPhiqy7PG75GkRZU93EB5xwwj',
    serumEventQueue: '7n1qHSyCH7btGmiexi1tj5tzsJgRBywg1a1Xvov3GVoq',
    serumCoinVaultAccount: 'CJVUSSsd4AnqNK7pvDb3XWWx6v34NELyy8JdQoKxnSdW',
    serumPcVaultAccount: '4YFPXdvk2HYwAJMPFCw7EU2h6CUTeWzvsC5DnrrTGF3Z',
    serumVaultSigner: '78dHXV2JdqQyFTs1tprMH359be7WWMYsmsSAsFctBoZe',
    official: true
  },
  {
    name: 'WOOF-USDC',
    coin: { ...TOKENSBASE.WOOF },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['WOOF-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'EZRHhpvAP4zEX1wZtTQcf6NP4FLWjs9c6tMRBqfrXgFD',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GBGxwY1eqBJcTVAjwFDpLGQGCv5eoQTciudT9ttFybqZ',
    ammTargetOrders: 'EdQNfUu9EAX6aT7ixLV9zYBRLhArCgrxPAQPr3CBdFK7',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '6LP3CwLwA7StkyMQ9NpKUqLS9ipMmUjPrKhQ8V9w1BoH',
    poolPcTokenAccount: '6HXfUDRXJkywFYvrKVgZMhnhvfqiU8T9pVYhJzyHEcmS',
    poolWithdrawQueue: 'EhgYsvA9J31J64LREuzTtt7QYhMBUX3EEAoCSZ6BwQjk',
    poolTempLpTokenAccount: '7E1e3kEWAgaerDErppzSJX34ukHtUQryiM7sAa7zhYPa',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'CwK9brJ43MR4BJz2dwnDM7EXCNyHhGqCJDrAdsEts8n5',
    serumBids: 'D5S8oWsPjytRq6uXB9H7fHxzFTpcmvULwYbuhAeAKNu4',
    serumAsks: '3PZAPrwUkhTqjaB7sDHLEj669J6hQXzPFTrnv7tgcgZT',
    serumEventQueue: '4V7fTH8x6qYz4GyvEVbzq1yLoGcpoByo6nCrsiA1HUUv',
    serumCoinVaultAccount: '2VcGBzs54DWCVtAQsw8fx1VVdrxEvX7bJz3AD4j8EBHX',
    serumPcVaultAccount: '3rfTMxRqmtoVvVsZXnvf2ifpFweeKSWxuFkYtyQnN9KG',
    serumVaultSigner: 'BUwcHs7HSHMexNjrEuSaP3TY5xdqBo87384VmWMV9BQF',
    official: true
  },
  {
    name: 'SLND-USDC',
    coin: { ...TOKENSBASE.SLND },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SLND-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'GRM4jGMtx64sEocBFz6ZgdogF2fyTWiixht8thZoHjkK',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GLgrNWTUfX4n165WaMG4dELg4e7E7RBNWMzBFvYKbcbs',
    ammTargetOrders: 'FCa9xL1TeJrDvhxyuc9J3o4KNtXBZREC3Kxr5sYVZNtQ',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DCHrCqguY9Jtn8xutdVPAhCbLayYaksPSwqg5aZzFXVM',
    poolPcTokenAccount: 'BxzizWAWk91TKbMAZM4F9zhUM5omdtdhjQQSdEM5sEXA',
    poolWithdrawQueue: '2TYYWf8RKyu5YoH5bwxiJnCyHdAeWUMadBDMotuNWoR8',
    poolTempLpTokenAccount: '53KFE2hkixwSRMj8Co9dZfG8uj2PXmfm1pBBUaqCocsA',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'F9y9NM83kBMzBmMvNT18mkcFuNAPhNRhx7pnz9EDWwfv',
    serumBids: 'EcwoMdYezDRLVNFzSzf7jKEuUe32KHp5ddU7RZWdAnWh',
    serumAsks: '4iLAK21RWx2XRyXzHhhuoj7hhjVFcrUiMqMSRGandobn',
    serumEventQueue: '8so7uCu3u53PUWU8UZSTJG1b9agvQtQms9gDDsynuXr1',
    serumCoinVaultAccount: '5JDR5i3wqrLxoZfaytoW14hti9pxVEouRy5pUtyhisYD',
    serumPcVaultAccount: '6ktrwB3FevRNdNHXW7n6ufk2h1jwKnWFtjhHgNwYaxJb',
    serumVaultSigner: 'HP7nqJpWXBS91fRncBCawqidJhxqNwKbS84Ni3HBTiGG',
    official: true
  },
  {
    name: 'FRKT-SOL',
    coin: { ...TOKENSBASE.FRKT },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['FRKT-SOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'H3dhkXcC5MRN7VRXNbWVSvogH8mUQPzpn8PYQL7HfBVg',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '7yHu2fwMQDA7vx5RJMX1TyzDE2cJx6u1v4abTgfEP8rd',
    ammTargetOrders: 'BXjSVXdMUYM3CpAs97SE5e9YnxC2NLqaT6tzwNiJNi6r',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'EAz41ABjVhXLWFXcVdC6WtYBjnVqBZQw7XxXBd8J8KMp',
    poolPcTokenAccount: '6gBKhNH2U1Qrxg73Eo6BMuXLoW2H4DML18AnALSrbrXr',
    poolWithdrawQueue: '9Pczi311AjZRXukgUws9QVPYBswXmMETZTM4TFcjqd4s',
    poolTempLpTokenAccount: 'BNRZ1W1QCw9v6LNgor1fU91X49WyPUnTWEUJ6H7HVefj',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FE5nRChviHFXnUDPRpPwHcPoQSxXwjAB5gdPFJLweEYK',
    serumBids: 'F4D6Qe2FcVSLDGByxCQoMeCdaLQF3Z7vuWnrXoEW3xss',
    serumAsks: '9oPEuJtJQTaFWqhkA9omNzKoz8BLEFmGfFyPdVYxkk8B',
    serumEventQueue: '6Bb5UtTAu6VBJ71dh8vGji6JBRsajRGKXaxhtRkqwy7R',
    serumCoinVaultAccount: 'EgZKQ4zMUiNNXFzTJ89eyL4gjfF2yCrH1seQHTnwihAc',
    serumPcVaultAccount: 'FCnpLA4Xzo4GKctHwMydTx81NRgbAxsZTreT9zHAEV8d',
    serumVaultSigner: '3x6rbV78zDotLTfat9tXpWgCzqKYBJKEzaDEWStcumud',
    official: true
  },
  {
    name: 'whETH-SOL',
    coin: { ...TOKENSBASE.whETH },
    pc: { ...NATIVE_SOL },
    lp: { ...LP_TOKENSBASE['whETH-SOL-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '4yrHms7ekgTBgJg77zJ33TsWrraqHsCXDtuSZqUsuGHb',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'FBU5FSjYeEZTbbLAjPCfkcDKJpAKtHVQUwL6zDgnNGRF',
    ammTargetOrders: '2KjKkci5zpGa6orKCu3ov4eFSB2aLR2ZdAYvVnaJxJjd',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5ushog8nHpHmYVJVfEs3NXqPJpne21sVZNuK3vqm8Gdg',
    poolPcTokenAccount: 'CWGyCCMC7xmWJZgAynhfAG7vSdYoJcmh27FMwVPsGuq5',
    poolWithdrawQueue: 'BzTWSVgYaqHvUcuPZKD4yKTDR2xCDtZFb1bqkwfoPHZJ',
    poolTempLpTokenAccount: 'Dfvj9bmde56ZWgxDsrADywZhctejEG2WTbnYa7P5SAhk',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '7gtMZphDnZre32WfedWnDLhYYWJ2av1CCn1RES5g8QUf',
    serumBids: '4Z6iBaVyCusvALJShz39yDY98jwPn6T1SsKaiLE3k5du',
    serumAsks: 'J6ULjQv2xpifRQQAKNYAtEGapgAsAA7vNhhRU57Law6m',
    serumEventQueue: '4tMSdiQWSGJbaz4UCdHQpqczxCJfLvBNWtskGbAnFgBz',
    serumCoinVaultAccount: '5F5W8nkQpXnb5ewS2GiUCuWAiamZpzGEMBciwaZ72frr',
    serumPcVaultAccount: 'CdWhLReMv1A4BJQkogvMwxVVop6agSW22YzQBzKUCS1y',
    serumVaultSigner: 'GRiN6BiHeaa2wrFEpqzR397d6RqefCSRhnQVsVscwT3r',
    official: true
  },
  {
    name: 'whETH-USDC',
    coin: { ...TOKENSBASE.whETH },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['whETH-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'EoNrn8iUhwgJySD1pHu8Qxm5gSQqLK3za4m8xzD2RuEb',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '6iwDsRGaQucEcfXX8TgDW1eyTfxLAGrypxdMJ5uqoYcp',
    ammTargetOrders: 'EGZL5PtEnSHrNmeoQF64wXG6b5oqiTArDvAQuSRyomX5',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'DVWRhoXKCoRbvC5QUeTECRNyUSU1gwUM48dBMDSZ88U',
    poolPcTokenAccount: 'HftKFJJcUTu6xYcS75cDkm3y8HEkGgutcbGsdREDWdMr',
    poolWithdrawQueue: 'A443y1KRAvKdK8yLJ9H29mgwuY56FAq1KvJmkcPCn47B',
    poolTempLpTokenAccount: 'jYvXX2z6USGtBSgJiPYWM9XZTBoiHJGPRGeQ9AUX98T',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '8Gmi2HhZmwQPVdCwzS7CM66MGstMXPcTVHA7jF19cLZz',
    serumBids: '3nXzH1gYKM1FKdSLHM7GCRG76mhKwyDjwinJxAg8jjx6',
    serumAsks: 'b3L5dvehk48X4mDoKzZUZKA4nXGpPAMFkYxHZmsZ98n',
    serumEventQueue: '3z4QQPFdgNSxazqEAzmZD5C5tJWepczimVqWak2ZPY8v',
    serumCoinVaultAccount: '8cCoWNtgCL7pMapGZ6XQ6NSyD1KC9cosUEs4QgeVq49d',
    serumPcVaultAccount: 'C7KrymKrLWhCsSjFaUquXU3SYRmgYLRmMjQ4dyQeFiGE',
    serumVaultSigner: 'FG3z1H2BBsf5ekEAxSc1K6DERuAuiXpSdUGkYecQrP5v',
    official: true
  },
  {
    name: 'weUNI-USDC',
    coin: { ...TOKENSBASE.weUNI },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['weUNI-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '8J5fa8WBGaDSv8AUpgtqdh9HM5AZuSf2ijvSkKoaCXCi',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4s8QacM13Z9Vf9en2DyM3EhKbekwnmYQTvd2RDjWAsee',
    ammTargetOrders: 'FDNvqhZiUkWwo95Q21gNimdqFQDJb5nqqttPT5uCUmBe',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'B5S6r6DBFgB8nxa8P7FnTwps7NAiTsFbiM6Xo7KrGtxP',
    poolPcTokenAccount: 'DBd8RZyBi3rdrpbXxXdcmWuTTrfkA5vfPh9HDLo1cHS',
    poolWithdrawQueue: 'CsPmj2rcDNQF85Q1bvWbieNkymtEHqyo7aXHmwHNiEKQ',
    poolTempLpTokenAccount: '9qHe2MC69BTwZY2GBJusz1rgMARsJAd6WvRu7cCYczjg',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'B7b5rjQuqQCuGqmUBWmcCTqaL3Z1462mo4NArqty6QFR',
    serumBids: '2FafQRbcuh7sE9iPgWU7ccs5WNsSyih9rXCTZn4Bv3t2',
    serumAsks: 'HJMohwcR3WUVFj9whhogSpBYzqKBjHyLcXHecArwgUEN',
    serumEventQueue: 'CTZuXPjhrLb4PSNSqdsc7xUn8eiRAByfQXoi4HXkPVUe',
    serumCoinVaultAccount: '4c4EMg5rPDx4quJdo3tL1uvQVpnoLLPKzMDn224NtER7',
    serumPcVaultAccount: '8MCzvWSskaoJpcXNVMui9GfzYMaMBQKPvE9GpqVZWtxq',
    serumVaultSigner: 'E4D2s9V4wuh6MMEJp7zkh6rcGgnoncJtMFFHjo4y1d5v',
    official: true
  },
  {
    name: 'weSUSHI-USDC',
    coin: { ...TOKENSBASE.weSUSHI },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['weSUSHI-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '9SWy6nbSVZ44XuixEvHpona663pZPpVgzXQ3N7muG4ou',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '4dDzSb5sVQuQU7JpiELNLukEUVYoTNyhwrfTd59L3HTK',
    ammTargetOrders: '4soQgpB1MhYjnD2cbo3aRinZh9muAAgBhTk6gLYSG4hM',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CTTAtNw3TPxMhZVcrxHPjbyqEfYS7ShAf6KafC4xeJj',
    poolPcTokenAccount: 'EPav47MmuNRnHdiRSNpRZq9fPAvpvGb81mWfQ4TMc4VQ',
    poolWithdrawQueue: '4DwCSyerQnxtiHc2koWWxpz31KjQdmLFe8ywWwrVkwEq',
    poolTempLpTokenAccount: 'EwFVC9RA6WRBpqPjTxRmw6iYVtCGd7JoSi5MECvc3vE9',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '3uWVMWu7cwMnYMAAdtsZNwaaqeeeZHARGZwcExnQiFay',
    serumBids: 'HtAQ6zXqg53WKTHoPNz6Y6nfy2vpRvaFFif13y9wWQzo',
    serumAsks: 'CyMeznxwdK1vVLB8yrq1MpwZpmQ43UipnqhahrwHNj5r',
    serumEventQueue: 'EiA2FLSrSJkJEGZg79eJkrAz7wtaB3jHDiXvQ4v5hZyA',
    serumCoinVaultAccount: '2DiofKbhznosm6ngnVXZY9r6j3WypkK6PXZu4XVhrUwS',
    serumPcVaultAccount: 'FwRAP48S9kwXFgiBDHU4NvuGkFnqctXEurgLFZFqdt2Z',
    serumVaultSigner: '4BRTPsziQ1QcKtsqAiXjnJe5rASuu41VXF1Bt5zpHqJs',
    official: true
  },
  {
    name: 'CYS-USDC',
    coin: { ...TOKENSBASE.CYS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['CYS-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '661trVCzDWp114gy4PEK4etbjb3u3RNaP4aENa5uN8Vp',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'gng63EZXkDhK3Qp8KgvLEZkcWmVDrmBe3EuYRy8mBPy',
    ammTargetOrders: '5Y23u3wgJ68uk7suF1mbJZQ9q1BnQKSVXUZfjJeY5RGw',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'CVioXLp58QsN9Xsf8JkAcadRmC1vsW74imLpKhMxPWSM',
    poolPcTokenAccount: 'HfBK19mBWh5D9VgnsPaKccfQaD79AYXetULtwLo62qxr',
    poolWithdrawQueue: '7txhWR41faQuKEBb6xq53RHBdGMCXf7fM7MBJgMvTiBN',
    poolTempLpTokenAccount: 'FrzaE4b2kpXtihidZj8mpTK3ji36wrTMtKLdVAxqPbiU',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '6V6y6QFi17QZC9qNRpVp7SaPiHpCTp2skbRQkUyZZXPW',
    serumBids: '5GdFXwsM4oW5pgyYUE4uqQXKsswL1y21DBwn6HJTteQt',
    serumAsks: 'ARGstQL7aLDdfN5yXUXKh8Y4Gwqe6eq5pMvYGcgkvHR1',
    serumEventQueue: 'FC9bnU5d4irjaWdCjG8sgUT5TTaADDpvxdn4twN9fA9A',
    serumCoinVaultAccount: '4PfqVvYg6tshSnMBMrXUwzYdS9gZvoxWFwGeLEx6BKow',
    serumPcVaultAccount: '81WG3s7xWe8aT6nf3r3t6sBuoMFb4QPiEZ2caENXQuKr',
    serumVaultSigner: 'FeGULrcjRyxHyRJTAUt84TqjR89biLnwwtjReWtRNoy2',
    official: true
  },
  {
    name: 'SAMO-USDC',
    coin: { ...TOKENSBASE.SAMO },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SAMO-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '7oYaghDwJ6ZbZwzdzcPqQtW6r4cojSLJDKB6U7tqAK1x',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'DsYePDFjAFNQVEjiGwg4tsUdqfLu9hXuu9VPS6DtyPZs',
    ammTargetOrders: '6RQvAcLyub9KNcAWkJMER3Rm2AvwysYyVVdxzSBuUNMm',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '4jrV1Fwqxdnw3WXvLQiXqquLvn4p6p5F9imAVNEU4yCT',
    poolPcTokenAccount: '5vkX52gpV1ZXmvk2JBSjD8z2wpGKp5Cs1XW15y5YB5ca',
    poolWithdrawQueue: '6ZX2Ct81QtwvWKUARLMjzR3jvs9QNDwPVyPN45YaoKAL',
    poolTempLpTokenAccount: 'DsT2dCWWGEmNcrX8vzx9Fm89Xg4J58LjEijNhVXsRuuN',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FR3SPJmgfRSKKQ2ysUZBu7vJLpzTixXnjzb84bY3Diif',
    serumBids: '2Ra3y1Y4HDd2jLjvAwdR6JKgGbyySGMToaZACkjroRWR',
    serumAsks: 'EXBohV8AsD8kt1GcHTuwHoPLfkz5n8PmNn5JyPJybJ35',
    serumEventQueue: '9FeUXsT6LbNXXZRQohoMRuxsmmYdfQM85JbVtrLUSB2w',
    serumCoinVaultAccount: 'HgKq27kVsH6bFdHru5p3ohnrL2d4D776Yiptkzv2ntwX',
    serumPcVaultAccount: 'JzkBGgCZLSzuZrC2XAmq5F4BRHmvhZtiUrbxsMP2BP6',
    serumVaultSigner: '679pdaM91fct45cM3nCvzBN57UGCFHe1CTSJwSRqjGwJ',
    official: true
  },
  {
    name: 'ABR-USDC',
    coin: { ...TOKENSBASE.ABR },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['ABR-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'GQJjrG6f8HbxkE3ZVSRpzoyWhQ2RiivT68BybVK9DxME',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'AwHZdJrEDWAFhxsdsErvVPjWyE5JEY5Xq6cq4JjZX73L',
    ammTargetOrders: 'AdWdYACEwtJLtNsqjBeAuXhHFiJPNJHkScYrdQeJWV6W',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '3zrQ9od43vB9sV1MNbM68VnkLCfq9dVUvM1hmp8tcJNz',
    poolPcTokenAccount: '5odFuHq8jhqtNBKtCu4F2GvUiH5hB1zVfpS9XXbLf35d',
    poolWithdrawQueue: 'FHi35hxZM29USwLwdAhbT8u7YhW8BPWvtLHyLnXPebW2',
    poolTempLpTokenAccount: '53fmAZj3d3YEnHY4PvyCE1Cx23x5g3d1ejwyDAZd3NzH',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'FrR9FBmiBjm2GjLZbfnCcgkbueUJ78NbBx1qcQKPUQe8',
    serumBids: '4W6ZoBB2QNBe6AYM6ofpWjerAsnJad93hVfdC5WMjRsX',
    serumAsks: '64yfFmc7ivEknLRT2nvUmWkASGwz8MPxtcPdaiWUffro',
    serumEventQueue: 'GgJ8bQSZ6Lt2mEurrhzLMWFMzTgVFq8ax91QzmZzYiS6',
    serumCoinVaultAccount: '9yg6VjgPUbojGn9d2n3UpX7B6gz7todGfTcV8apV5wkL',
    serumPcVaultAccount: 'BDdh4ane6wXkRdbqUuMGYYR4ggf3GufUbjT2TxpHiAzU',
    serumVaultSigner: 'A3LkbNQUjz1q3Ux5kQKCzNMFJw3yxk9qx1RtuQBXbZZe',
    official: true
  },
  {
    name: 'IN-USDC',
    coin: { ...TOKENSBASE.IN },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['IN-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '5DECiJuqwmeCptoBEpyJtXKrVfiUrG9nBbBGkxGkPYyF',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GujdDreXBSEXUCjk39tRnM8ZYCrtyambNSa3JjJVGvLJ',
    ammTargetOrders: 'D4dBV5v9AMfGzgf1eBrpAUom72YVLYeZr1ufnY1dJd8W',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '2z4day3sVMRULUtFJ4sbTvKrkjMsc42rjXHDQtggbSE9',
    poolPcTokenAccount: '9PVPqk5RYf5x9nRYbEzotVNpk36NJ6bAZJaaSnaaZrYn',
    poolWithdrawQueue: '3xxiFPPRwy4bshMeG3bN4yCNDiFsbVdPq29qK2bddJ9J',
    poolTempLpTokenAccount: 'EbDVS5gwPdVYK7f14g2B9zNesgEfAcgnxQzTYf7GYw9j',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: '49vwM54DX3JPXpey2daePZPmimxA4CrkXLZ6E1fGxx2Z',
    serumBids: '8hU3yAFb1429V1TTSKqpgJ7XJyQQQoLq76wxHeM1WYo',
    serumAsks: 'CEdiYZ2Cp62ECHgkz2mPiK9A6HcMG2jSmrppxiENzgKT',
    serumEventQueue: 'DJgsxzKvBY2wTqAWEmiqV8quTR7k9GZ7rsmvov3yzXPw',
    serumCoinVaultAccount: 'De4wrN3UtHs783VTZjqoFZtP2v95pMWFx1KCqmkWBXqU',
    serumPcVaultAccount: 'DiiAfxX3J5apQ8SJ42Z4z2USTK3QbhksTzniAugLaG91',
    serumVaultSigner: 'D8QQQMut9bbPfpCXHgbwoPSF4KNYSg7SyRUGF828dBfZ',
    official: true
  },
  {
    name: 'weDYDX-USDC',
    coin: { ...TOKENSBASE.weDYDX },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['weDYDX-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'CbGQojcizFEHn3woL7NPu3P9BLL1SWz5a8zkL9gks24q',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '75hTsLMn57111C8JwG9uqrkw6iZsFtyU8CYQYSzM2CY8',
    ammTargetOrders: '3pbY7NyETK3UBG1yvaFjqeYPLXMd2wHgcZVJi9LZVdx1',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '45pPLPHYUJ7ainr9eqPzdKcWJSbGuoUwcMcMamAXgcCX',
    poolPcTokenAccount: '7aE4zihDvU58Uua8W82Q2u915rKqzpmpWPxZSDdeXrwu',
    poolWithdrawQueue: '2r8yHQGdydgngeTXdqsM2P2ZWVmwRAe3Kq3MLTCQPpHD',
    poolTempLpTokenAccount: 'DBmenZarP1WQx9uvrKQQj3pNfhmNanZ9ns5tpMYpDcyJ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'GNmTGd6iQvQApXgsyvHepDpCnvdRPiWzRr8kzFEMMNKN',
    serumBids: '89Ux1PrzAVv5tejtCQhfs5tqEfQdb3WQsfY6f7BzQtsN',
    serumAsks: '36eRuVT8kyWq1UbZeYf66q5EhUpNP2Kq8TgffyVbHEzF',
    serumEventQueue: '4GX63nbB8SHwDeDpuSKacfch1ANTLp4zn8ivkcTjCnEn',
    serumCoinVaultAccount: 'CXxN6hGatd5nK7uPwxvxHYmqvM4b88eKb9fcHapRhtda',
    serumPcVaultAccount: 'NMWKX4jfzkKvRBYkcvurus8aofaHZ8MwMNYqudztWZh',
    serumVaultSigner: 'DD6e6WMaZ3JePsBNP9Eoz9aJsD3bZ81EjMvUSWF96qQx',
    official: true
  },
  {
    name: 'STARS-USDC',
    coin: { ...TOKENSBASE.STARS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['STARS-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'CWQVga1qUbpZXjrWQRj6U6tmL3HhrFiAT11VYnB8d3CF',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'D3bJNYcUhza55mdGFTAUi4CLE12f54qzMcPmawoBCNLc',
    ammTargetOrders: 'FNjcSQ7VB7ULoSU7BDTotiRDmqiQj7CvVxHALnYC5JGP',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '5NtsnqVNXGmxs6zEU73W2RaFh4e58gqdWrxMvzcqNxGk',
    poolPcTokenAccount: 'MZihwPviJgm5WjHDmh6c5pq1tTipuZnHFN3KBg63Mtj',
    poolWithdrawQueue: '5NRhJQS8m4pgc8Lgo1kuqHJrU8JAeToriPvpJ4LY88uH',
    poolTempLpTokenAccount: '8vLEHvkCEdAj4YPGbfrcTKHccaEJQwuY32WunJWzyuZx',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'DvLrUbE8THQytBCe3xrpbYadNRUfUT7SVCm677Nhrmby',
    serumBids: '9Nvw43fQ4vNfdJgajMC4JUpLGGTiia1vGYEM7SbfaWei',
    serumAsks: 'CnVNbSQcVNQjGA4fdBtSrzDyFNXAHuBhcMnZsQBpEHo5',
    serumEventQueue: 'D1hpxetuGzfz2mSf3US6F7QHjmmA3A5Q1EUJ3Qk5E1ZG',
    serumCoinVaultAccount: 'AzhvXGjqJtDW4ieSYVje3zxL14TP1pGJv6uULR2F86uR',
    serumPcVaultAccount: '8SrtqysGeiKkXWMGMgee9frWbGdhXZr9gWHh2VKRnvkZ',
    serumVaultSigner: 'EN7RnB2RVxeDcTQWFBAuaf5Bg9sEuHhwwWiuj1TFHEuC',
    official: true
  },
  {
    name: 'weAXS-USDC',
    coin: { ...TOKENSBASE.weAXS },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['weAXS-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'HopVRTvFvRe1ED3dRCQrt1h5onkMvY3tKUHRVQMc7MMH',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'BWJ96nvwjxqkjbu2rQN2H4U3E5PjWRMjrw2gqRcicazt',
    ammTargetOrders: '6JtLCecsVp3UN1eEyZCHUBXKmd4HqnzYXB3AcS1DCEFe',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '9pyHCyqHKvfbsTeYNQRTf5zHLzZedmxWA7YGC4ybCfBD',
    poolPcTokenAccount: '3WuvWRBqCtw1zqKmgZ79t5QK8Ph7Rfwf7nYB8Tv5KV2C',
    poolWithdrawQueue: 'B5ixFzgKhBysnWpJcEiozrf8Ykc361xKwkKstWCBLggW',
    poolTempLpTokenAccount: 'F7NwbHNfgU9p1iQAkjDs8HnbVVDsCXfSxv5jn4LxUxKn',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HZCheduA4nsSuQpVww1TiyKZpXSAitqaXxjBD2ymg22X',
    serumBids: 'AaWuUgau8jRbbo2tVv3oFcAUyrSPXQxJkPUYsUPeCFe6',
    serumAsks: 'HFZCap81Q9JAuySeggJrQvw9XJuVdbb9R617BeTnsZbA',
    serumEventQueue: 'DQZDYYbCCknsvAUadroAs3YPH8XU4Bo7iCmTy3GAWFrF',
    serumCoinVaultAccount: '69bNeKy1gM4xDfSfjCaVeGpoBR2hPeXioJMNShu1BjdS',
    serumPcVaultAccount: 'Gzbck4nwKYEEmwHxJxBpBpGhuMZaDhL1UqVBVFTrReki',
    serumVaultSigner: '2qodg1XKZ5hauWnz1hBBfUWzMbRqABym2hMgLSS7pmJ2',
    official: true
  },
  {
    name: 'weSHIB-USDC',
    coin: { ...TOKENSBASE.weSHIB },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['weSHIB-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: 'SU7vPveBjEuR5tgQwidRqqTxn1WwraHpydHHBpM2W96',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: 'GQBHmoAkWiXEsoGYBqFGifCwDcfU2QYCwL8GHWFAbBqZ',
    ammTargetOrders: 'm7JmrtyJq4CxTYPmB3WKMVbsDxge8SD95rWHb4WREEz',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: 'Ar37g5ebxRMq1NJyswFw9JKwRzZ8CzVr9SEMFH5wy9P8',
    poolPcTokenAccount: 'EGynHanKeLLUYeWFE6ULXE1QRD8YPTV7ehSnphWsLqq2',
    poolWithdrawQueue: '5VBUYLnVPHKtiFSqSEhaANF5fXv7QzATRB5BRHrQv3B',
    poolTempLpTokenAccount: 'G5Wrnafh95moPCxvKM5QNTMwAFQMGnnB9YTh24TvWnrD',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'Er7Jp4PADPVHifykFwbVoHdkL1RtZSsx9zGJrPJTrCgW',
    serumBids: '2FkkrUR6MWq7Qd1LLMnR4NWmKcnqkNhK6NK6x7Wi1aRD',
    serumAsks: '2Qxa2n6rRGm5f3Qc8H9HDV7wYsjnXZuXEWjgQs1bEwzK',
    serumEventQueue: '5jGZmP29GfcEWKVHGxCymuD5qGg33kM2rPfPvD1BFS35',
    serumCoinVaultAccount: '7nbNVNdhzZoD3KdjKnGRXbb9pPnDP2CSK1tPoRNvq94m',
    serumPcVaultAccount: '6ovLsr9T6754PrgH3QwFCPtjizWEh6H3DDpc3QXnMsqi',
    serumVaultSigner: 'HoDhphLcgw8hb6GdTicv6V9are7Yi7xXvUriwWwRWuRk',
    official: true
  },
  {
    name: 'SBR-USDC',
    coin: { ...TOKENSBASE.SBR },
    pc: { ...TOKENSBASE.USDC },
    lp: { ...LP_TOKENSBASE['SBR-USDC-V4'] },
    version: 4,
    programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
    ammId: '5cmAS6Mj4pG2Vp9hhyu3kpK9yvC7P6ejh9HiobpTE6Jc',
    ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    ammOpenOrders: '8bEDWrUBqMV7ei55PgySABm8swC9WFW24NB6U5f5sPJT',
    ammTargetOrders: 'G2nswHPqZLXtMimXZtsiLHVZ5gJ9GTiKRdLxahDDdYag',
    // no need
    ammQuantities: NATIVE_SOL.mintAddress,
    poolCoinTokenAccount: '8vwzjpW7KPGFLQdRuyoBBoiBCsNG6SLRGssKMNsofch2',
    poolPcTokenAccount: 'AcK6bv25Q7xofBUiXKwUgueSi3ELS6anMbmNn2NPV8FZ',
    poolWithdrawQueue: 'BG59NCoZnxqSU2TQ2DNsENiCZci73BcRvXWtqmQhNrcw',
    poolTempLpTokenAccount: 'msNco37chvHeLivUwoetEnHDFZxVNi2KXQzjGAXkRuZ',
    serumProgramId: SERUM_PROGRAM_ID_V3,
    serumMarket: 'HXBi8YBwbh4TXF6PjVw81m8Z3Cc4WBofvauj5SBFdgUs',
    serumBids: 'FdGKYpHxpQEkRitZw6KZ8b21Q2mYiATHXZgJjFDhnRWM',
    serumAsks: 'cxqTRyeoGeh6TBEgo3NAieHaMkdmfZiCjSEfkNAe1Y3',
    serumEventQueue: 'EUre4VPaLh7B95qG3JPS3atquJ5hjbwtX7XFcTtVNkc7',
    serumCoinVaultAccount: '38r5pRYVzdScrJNZowNyrpjVbtRKQ5JMcQxn7PgKE45L',
    serumPcVaultAccount: '4YqAGXQEQTQbn4uKX981yCiSjUuYPV8aCajc9qQh3QPy',
    serumVaultSigner: '84aqZGKMzbr8ddA267ML7JUTAjieVJe8oR1yGUaKwP53',
    official: true
  }
]