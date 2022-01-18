import { publicKey, struct, u128, u64 } from '@project-serum/borsh';
// import {seq, struct } from 'buffer-layout';
import { Connection, PublicKey } from '@solana/web3.js';

import { getFarmByPoolId } from '../utils/farms';
import { STAKE_PROGRAM_ID, STAKE_PROGRAM_ID_V4, STAKE_PROGRAM_ID_V5 } from '../utils/ids';
import { getBigNumber } from '../utils/layouts';
import { lt, TokenAmount } from '../utils/safe-math';
import { findAssociatedStakeInfoAddress, getFilteredProgramAccounts } from '../utils/web3';
// import {
//   findAssociatedStakeInfoAddress, getFilteredProgramAccounts
// } from '../utils/web3';


// export const state = () => ({
//   initialized: false,
//   loading: false,

//   autoRefreshTime: AUTO_REFRESH_TIME,
//   countdown: 0,
//   lastSubBlock: 0,

//   infos: {},
//   stakeAccounts: {},
//   auxiliaryStakeAccounts: {}
// })

// export const getters = getterTree(state, {})

// export const mutations = mutationTree(state, {
//   setInitialized(state: any) {
//     state.initialized = true
//   },

//   setLoading(state: any, loading: boolean) {
//     if (loading) {
//       state.countdown = AUTO_REFRESH_TIME
//     }

//     state.loading = loading

//     if (!loading) {
//       state.countdown = 0
//     }
//   },

//   setInfos(state: any, infos: object) {
//     state.infos = cloneDeep(infos)
//   },

//   setStakeAccounts(state: any, stakeAccounts: any) {
//     state.stakeAccounts = cloneDeep(stakeAccounts)
//   },

//   setAuxiliaryStakeAccounts(state: any, auxiliaryStakeAccounts: any) {
//     state.auxiliaryStakeAccounts = cloneDeep(auxiliaryStakeAccounts)
//   },

//   setCountdown(state: any, countdown: number) {
//     state.countdown = countdown
//   },

//   setLastSubBlock(state: any, lastSubBlock: number) {
//     state.lastSubBlock = lastSubBlock
//   }
// })

// export const actions = actionTree(
//   { state, getters, mutations },
//   {
//     async requestInfos({ commit, dispatch }) {
//       commit('setLoading', true)
//       dispatch('getStakeAccounts')

//       const conn = this.$web3

//       const farms = {} as any
//       const publicKeys = [] as any

//       FARMS.forEach((farm) => {
//         const { lp, poolId, poolLpTokenAccount } = farm

//         publicKeys.push(new PublicKey(poolId), new PublicKey(poolLpTokenAccount))

//         const farmInfo = cloneDeep(farm)

//         farmInfo.lp.balance = new TokenAmount(0, lp.decimals)

//         farms[poolId] = farmInfo
//       })

//       const multipleInfo = await getMultipleAccounts(conn, publicKeys, commitment)
//       multipleInfo.forEach((info) => {
//         if (info) {
//           const address = info.publicKey.toBase58()
//           const data = Buffer.from(info.account.data)

//           const { key, poolId } = getAddressForWhat(address)

//           if (key && poolId) {
//             const farmInfo = farms[poolId]

//             switch (key) {
//               // pool info
//               case 'poolId': {
//                 let parsed

//                 if ([4, 5].includes(farmInfo.version)) {
//                   parsed = STAKE_INFO_LAYOUT_V4.decode(data)
//                 } else {
//                   parsed = STAKE_INFO_LAYOUT.decode(data)
//                 }

//                 farmInfo.poolInfo = parsed

//                 break
//               }
//               // staked balance
//               case 'poolLpTokenAccount': {
//                 const parsed = ACCOUNT_LAYOUT.decode(data)

//                 farmInfo.lp.balance.wei = farmInfo.lp.balance.wei.plus(getBigNumber(parsed.amount))

//                 break
//               }
//             }
//           }
//         }
//       })

//       commit('setInfos', farms)
//       logger('Farm&Stake pool infomations updated')
//       commit('setInitialized')
//       commit('setLoading', false)
//     },

export const work = () => {
  console.log('asfd');
}

export const getStakeAccounts = async (conn: Connection, wallet: any) => {
  if (wallet && wallet.connected) {
    // stake user info account
    const stakeFilters = [
      {
        memcmp: {
          offset: 40,
          bytes: wallet.publicKey.toBase58()
        }
      },
      {
        dataSize: struct([
          u64('state'),
          publicKey('poolId'),
          publicKey('stakerOwner'),
          u64('depositBalance'),
          u64('rewardDebt')
        ]).span
      }
    ]

    // stake user info account v4
    const stakeFiltersV4 = [
      {
        memcmp: {
          offset: 40,
          bytes: wallet.publicKey.toBase58()
        }
      },
      {
        dataSize: struct([
          u64('state'),
          publicKey('poolId'),
          publicKey('stakerOwner'),
          u64('depositBalance'),
          u64('rewardDebt'),
          u64('rewardDebtB')
        ]).span
      }
    ]

    // stake user info account v5
    const stakeFiltersV5 = [
      {
        memcmp: {
          offset: 40,
          bytes: wallet.publicKey.toBase58()
        }
      }
    ]

    const stakeAccounts: any = {}
    const auxiliaryStakeAccounts: any = {}

    // await Promise.all([
    //   await stakeProgramIdAccount(stakeAccounts, conn, stakeFilters),
    //   await stakeProgramIdAccountV4(STAKE_PROGRAM_ID_V4, stakeAccounts, conn, stakeFiltersV4),
    //   await stakeProgramIdAccountV5(
    //     STAKE_PROGRAM_ID_V5,
    //     stakeAccounts,
    //     auxiliaryStakeAccounts,
    //     conn,
    //     stakeFiltersV5
    //   )
    // ])

    console.log(stakeAccounts);
    console.log(auxiliaryStakeAccounts);

  }
}

async function stakeProgramIdAccount(stakeAccounts: any, conn: any, stakeFilters: any) {
  debugger;
  const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(STAKE_PROGRAM_ID), stakeFilters)
  stakeAccountInfos.forEach((stakeAccountInfo) => {
    const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
    const { data } = stakeAccountInfo.accountInfo

    const userStakeInfo = struct([
      u64('state'),
      publicKey('poolId'),
      publicKey('stakerOwner'),
      u64('depositBalance'),
      u64('rewardDebt')
    ]).decode(data)

    const poolId = userStakeInfo.poolId.toBase58()

    const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)

    const farm = getFarmByPoolId(poolId)

    if (farm) {
      const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

      if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
        if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
          stakeAccounts[poolId] = {
            depositBalance,
            rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
            stakeAccountAddress
          }
        }
      } else {
        stakeAccounts[poolId] = {
          depositBalance,
          rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
          stakeAccountAddress
        }
      }
    }
  })
}

// async function stakeProgramIdAccountV4(programId: string, stakeAccounts: any, conn: any, stakeFilters: any) {
//   const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(programId), stakeFilters)

//   stakeAccountInfos.forEach((stakeAccountInfo) => {
//     const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
//     const { data } = stakeAccountInfo.accountInfo

//     const userStakeInfo = struct([
//       u64('state'),
//       publicKey('poolId'),
//       publicKey('stakerOwner'),
//       u64('depositBalance'),
//       u64('rewardDebt'),
//       u64('rewardDebtB')
//     ]).decode(data)

//     const poolId = userStakeInfo.poolId.toBase58()

//     const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)
//     const rewardDebtB = getBigNumber(userStakeInfo.rewardDebtB)

//     const farm = getFarmByPoolId(poolId)

//     if (farm) {
//       const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

//       if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
//         if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
//           stakeAccounts[poolId] = {
//             depositBalance,
//             rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
//             // @ts-ignore
//             rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
//             stakeAccountAddress
//           }
//         }
//       } else {
//         stakeAccounts[poolId] = {
//           depositBalance,
//           rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
//           // @ts-ignore
//           rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
//           stakeAccountAddress
//         }
//       }
//     }
//   })
// }

// async function stakeProgramIdAccountV5(
//   programId: string,
//   stakeAccounts: any,
//   auxiliaryStakeAccounts: any,
//   conn: any,
//   stakeFilters: any
// ) {
//   const stakeAccountInfos = await getFilteredProgramAccounts(conn, new PublicKey(programId), stakeFilters)

//   for (const stakeAccountInfo of stakeAccountInfos) {
//     const stakeAccountAddress = stakeAccountInfo.publicKey.toBase58()
//     const { data } = stakeAccountInfo.accountInfo

//     const LAYOUT =
//       data.length === struct([
//         u64('state'),
//         publicKey('poolId'),
//         publicKey('stakerOwner'),
//         u64('depositBalance'),
//         u64('rewardDebt'),
//         u64('rewardDebtB')
//       ]).span
//         ? struct([
//           u64('state'),
//           publicKey('poolId'),
//           publicKey('stakerOwner'),
//           u64('depositBalance'),
//           u64('rewardDebt'),
//           u64('rewardDebtB')
//         ])
//         : struct([
//           u64('state'),
//           publicKey('poolId'),
//           publicKey('stakerOwner'),
//           u64('depositBalance'),
//           u128('rewardDebt'),
//           u128('rewardDebtB'),
//           seq(u64(), 17)
//         ])

//     const userStakeInfo = LAYOUT.decode(data)

//     const poolId = userStakeInfo.poolId.toBase58()

//     const rewardDebt = getBigNumber(userStakeInfo.rewardDebt)
//     const rewardDebtB = getBigNumber(userStakeInfo.rewardDebtB)

//     const farm = getFarmByPoolId(poolId)

//     if (farm) {
//       const depositBalance = new TokenAmount(getBigNumber(userStakeInfo.depositBalance), farm.lp.decimals)

//       const pda = await findAssociatedStakeInfoAddress(
//         userStakeInfo.poolId,
//         userStakeInfo.stakerOwner,
//         new PublicKey(programId)
//       )

//       if (pda.equals(stakeAccountInfo.publicKey)) {
//         stakeAccounts[poolId] = {
//           depositBalance,
//           rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
//           // @ts-ignore
//           rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
//           stakeAccountAddress
//         }
//       } else if (Object.prototype.hasOwnProperty.call(stakeAccounts, poolId)) {
//         if (lt(getBigNumber(stakeAccounts[poolId].depositBalance.wei), getBigNumber(depositBalance.wei))) {
//           stakeAccounts[poolId] = {
//             depositBalance,
//             rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
//             // @ts-ignore
//             rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
//             stakeAccountAddress
//           }
//         }

//         if (!Object.prototype.hasOwnProperty.call(auxiliaryStakeAccounts, poolId)) {
//           auxiliaryStakeAccounts[poolId] = []
//         }
//         auxiliaryStakeAccounts[poolId].push(stakeAccountAddress)
//       } else {
//         stakeAccounts[poolId] = {
//           depositBalance,
//           rewardDebt: new TokenAmount(rewardDebt, farm.reward.decimals),
//           // @ts-ignore
//           rewardDebtB: new TokenAmount(rewardDebtB, farm.rewardB.decimals),
//           stakeAccountAddress
//         }

//         if (!Object.prototype.hasOwnProperty.call(auxiliaryStakeAccounts, poolId)) {
//           auxiliaryStakeAccounts[poolId] = []
//         }
//         auxiliaryStakeAccounts[poolId].push(stakeAccountAddress)
//       }
//     }
//   }
// }
