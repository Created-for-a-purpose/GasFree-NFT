import { ethers } from 'ethers'
import { useState } from 'react'
import './Dashboard.css'
import {abi, contractAddress} from './constants.js'

const Dashboard = ({smartAccount, provider}) => {
    const [tokens, setTokens] = useState([])

    async function loadNfts(){
      const contract = new ethers.Contract(contractAddress, abi, provider)
    const tokens = await contract.tokensOfOwner(smartAccount.address)
    setTokens(tokens)
    }
    
    return (
    <div>
    <h3>Your NFTs:</h3>
    <button onClick={loadNfts}>Refresh</button>
    <div className='cardContainer'>
     {
        tokens && tokens.map((token, index) => {
        return (
        <div key={index} className='card'>
            <p>Token ID: {token.toString()}</p>
            {/* <img src={`https://beige-asleep-chinchilla-881.mypinata.cloud/ipfs/QmfFJZEfRJFf5auRT1PfjKWukmsHgwDxcv8FCeMaUB4ck5/${token.toString()}.png`} alt={`Token ${token.toString()}`} /> */}
        </div>
        )})
     }
     </div>
    </div>
    )
}

export default Dashboard