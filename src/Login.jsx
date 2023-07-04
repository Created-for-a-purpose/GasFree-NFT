import './App.css'
import { useNavigate } from "react-router-dom";
import "@biconomy/web3-auth/dist/src/style.css"
import { useState, useEffect, useRef } from 'react'
import SocialLogin from "@biconomy/web3-auth"
import { ChainId } from "@biconomy/core-types";
import { ethers } from 'ethers'
import SmartAccount from "@biconomy/smart-account";
import Dashboard from './Dashboard';
import {abi, contractAddress} from './constants'

export default function Login() {
  const navigate = useNavigate();
  const [smartAccount, setSmartAccount] = useState(null)
  const [interval, enableInterval] = useState(false)
  const sdkRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    let configureLogin;
    if (interval) {
      configureLogin = setInterval(() => {
        if (sdkRef.current?.provider) {
          setupSmartAccount()
          clearInterval(configureLogin)
        }
      }, 1000)
    }
  }, [interval])

  async function login() {
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin()
      const signature1 = await socialLoginSDK.whitelistUrl('http://localhost:3000/')
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: "testnet",
        whitelistUrls: {
          'http://localhost:3000/': signature1,
        }
      })
      sdkRef.current = socialLoginSDK
    }
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet()
      enableInterval(true)
    } else {
      setupSmartAccount()
    }
  }

  async function setupSmartAccount() {
    if (!sdkRef?.current?.provider) return
    sdkRef.current.hideWallet()
    setLoading(true)
    const web3Provider = new ethers.providers.Web3Provider(
      sdkRef.current.provider
    )
    setProvider(web3Provider)
    try {
      const smartAccount = new SmartAccount(web3Provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
        networkConfig: [
          {
            chainId: ChainId.POLYGON_MUMBAI,
            dappAPIKey: 'ctCFUOHSG.22a421c6-1e05-4442-8cc3-7c1e269c4518',
          },
        ],
      })
      await smartAccount.init()
      setSmartAccount(smartAccount)
      setLoading(false)
    } catch (err) {
      console.log('error setting up smart account... ', err)
    }
  }

  const logout = async () => {
    if (!sdkRef.current) {
      console.error('Web3Modal not initialized.')
      return
    }
    await sdkRef.current.logout()
    sdkRef.current.hideWallet()
    setSmartAccount(null)
    enableInterval(false)
  }

  const mint=async ()=>{
        const contract = new ethers.Contract(contractAddress, abi, provider)
        const mintnft = await contract.populateTransaction.mint()
        const tx = {
          to: contractAddress,
          data: mintnft.data,
        }
        const txresponse = await smartAccount.sendTransaction({transaction: tx})
        await txresponse.wait()
  }

  return (
    <div>
      <h1>Biconomy SDK Auth + Gasless Transactions</h1>
      {
        !smartAccount && !loading && <button onClick={login}>Login</button>
      }
      {
        loading && <p>Loading account details...</p>
      }
      {
        smartAccount && (
          <div className="buttonWrapper">
            <h3>Smart account address:</h3>
            <p>{smartAccount.address}</p>
            <button onClick={() => window.open(`https://mumbai.polygonscan.com/address/${smartAccount.address}`, '_blank')}>View on PolygonScan</button>
            <button onClick={mint} >Mint Gas Free</button>
            <Dashboard smartAccount={smartAccount} provider={provider} />
            <button onClick={logout}>Logout</button>
          </div>
        )
      }
    </div>
  )
}


