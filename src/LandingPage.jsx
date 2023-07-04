import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
    DAOABI,
    DAOAddress,
    NFTABI,
    NFTAddress,
  } from "./constants";
  import { useEffect, useState } from "react";
  import { formatEther } from "viem/utils";
  import { getAddress } from "viem/utils";
  import { useAccount, useBalance, useContractRead } from "wagmi";
  import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
  import styles from "./land.module.css";

const LandingPage = () => {
    const { address, isConnected } = useAccount();
    const [isMounted, setIsMounted] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [nftId, setNftId] = useState('');
    const [proposalType, setProposalType] = useState('');
    const [proposals, setProposals] = useState([]);
    const [tab, setTab] = useState('');
    const [nftsAtDao, setNftsAtDao] = useState(0);

    const daoBalance = useBalance({
        address: DAOAddress});

    const totalProposals = useContractRead({
        abi: DAOABI,
        address: DAOAddress,
        functionName: "proposalCount"
    });

    const nftBalance = useContractRead({
        abi: NFTABI,
        address: NFTAddress,
        functionName: "balanceOf",
        args: [address]
    });
    
    const createProposal = async () => {
        setLoading(true);
        try{
            const tx = await writeContract({
                abi: DAOABI,
                address: DAOAddress,
                functionName: "createProposal",
                args: [nftId, proposalType]
            });
            await waitForTransaction(tx);
        }
        catch(e){ window.alert(e.message); }
        finally{ setLoading(false); }
    }
    
    const fetchProposalById = async(id)=>{
        try{
           let idx = id;
        const proposal = await readContract({
            abi: DAOABI,
            address: DAOAddress,
            functionName: "proposals",
            args: [idx]
        });
        
        const [i, nftId, deadline, yes, no, executed, proposalType, voters] = proposal;
        const parsedProposal = {
            pid: id.toString(),
            nftId: nftId.toString(),
            deadline: new Date(deadline.toString()*1000),
            yesVotes: yes.toString(),
            noVotes: no.toString(),
            executed: Boolean(executed),
            proposalType: proposalType.toString(),
       }
       return parsedProposal;
    }
    catch(e){ window.alert(e.message); }
    
    }

    const fetchAllProposals = async()=>{
        try{
            const proposals = [];
            for(let i=0; i<(totalProposals.data.toString()); i++){
                console.log('in loop')
                const proposal = await fetchProposalById(i);
                proposals.push(proposal);
            }
            setProposals(proposals);
            return proposals;
        }
        catch(e){ window.alert(e.message); }
    }

    const vote = async (id, vote)=>{
        setLoading(true);
        try{
            const tx = await writeContract({
                abi: DAOABI,
                address: DAOAddress,
                functionName: "vote",
                args: [id, vote==='yes'?0:1]
            });
            await waitForTransaction(tx);
        }
        catch(e){ window.alert(e.message); }
        setLoading(false);
    }

    const executeProposal = async (id)=>{
        setLoading(true);
        try{
         const tx = await writeContract({
                abi: DAOABI,
                address: DAOAddress,
                functionName: "execute",
                args: [id]
            });
            await waitForTransaction(tx);
        }
        catch(e){ window.alert(e.message); }
        setLoading(false);
    }
    
    function renderTabs(){
        if(tab==='Create Proposal')
        return renderCreateProposal();
        else if(tab==='View Proposals')
         return renderViewProposals();
    }

    function renderCreateProposal(){
        console.log('prop', proposals)
        if(loading){
            return(
                <div className={styles.description}>
                    Loading...
                </div>
            )
        }
        else if(nftsAtDao===0){
            return(
            <div className={styles.description}> 
                You are not a member of the DAO!
                <b>You cannot create or vote on proposals</b>
            </div>)
        }
        else{
            return(
              <div className={styles.container}>
                <label>NFT token id for the proposal: </label>
                <input placeholder="0" 
                type="number"
                onChange={(e)=>setNftId(e.target.value)}/>
                <button className={styles.button2}
                onClick={createProposal}>Create</button>
              </div>
            )
        }
    }

    function renderViewProposals(){
        if(loading){
            return(
                <div className={styles.description}>
                    Loading...
                </div>
            );
        }
        else if(proposals.length===0){
            return(
            <div className={styles.description}>Oops! No proposals yet.</div>
            );
        }
        else{
            return(
                <>
                    {proposals && proposals.map((p, index)=>{
                          return (<div className={styles.card} key={index}>
                            <p>Proposal ID: {p.pid}</p>
                            <p>NFT token ID: {p.nftId}</p>
                            <p>Deadline: {p.deadline.toLocaleString()}</p>
                            <p>Accepted: {p.yesVotes}</p>
                            <p>Rejected: {p.noVotes}</p>
                            <p>Executed: {p.executed.toString()}</p>
                            <p>Proposal Type: {p.proposalType}</p>
                            { 
                                p.deadline.getTime()>Date.now() && !p.executed ?(
                                    <div className={styles.flex}>
                                        <button className={styles.button2}
                    onClick={() => vote(p.proposalId, "yes")}>Vote YES!</button>
                                        <button className={styles.button2}
                    onClick={() => vote(p.proposalId, "no")}>Vote NO!</button>
                                    </div>
                                ):(p.deadline.getTime()<Date.now() && !p.executed ?(
                                    <div className={styles.flex}>
                                        <button className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}>Execute</button>
                                    </div>
                                ):(<div className={styles.description}>
                                    Proposal has been executed!
                                </div>))
                            }

                          </div>)
                    })}
                </>
            )
        }
    }

    const mint = async()=>{
        setLoading(true);
        try{
            const tx = await writeContract({
                abi: NFTABI,
                address: NFTAddress,
                functionName: "mint",
            });
            await waitForTransaction(tx);
        }
        catch(e){ window.alert(e.message); }
        setLoading(false);
    }

    const stakeNft = async()=>{
        setLoading(true);
        try{
            const tx = await writeContract({
                abi: NFTABI,
                address: NFTAddress,
                functionName: "safeTransferFrom",
                args: [address, DAOAddress, 5]
            })
            await waitForTransaction(tx);
        const tx2= await writeContract({
            abi: DAOABI,
            address: DAOAddress,
            functionName: "onERC721Received",
            args: [address, address, 5, "0x"]
        });
        await waitForTransaction(tx2);
        console.log('on rec', tx2);
    }
        catch(e){ window.alert(e.message); }
        setLoading(false);
    }

    useEffect(()=>{
        if(tab==='Create Proposal')
        fetchAllProposals();
    }, [tab]);
    useEffect(()=>{
        const loadMembership=async()=>{
        try{
           const member = await readContract({
            abi: DAOABI,
            address: DAOAddress,
            functionName: "members",
            args: [getAddress(address)]
        });
        setNftsAtDao(member.toString());
        console.log('member', member.toString());
    }catch(e){ window.alert(e.message); }
    }
    loadMembership();
        setIsMounted(true);
    }, []);

    if(!isMounted) return null;

    if(!isConnected)
    return <ConnectButton />;

    return(
        <div className={styles.main}>
            <ConnectButton/>
            <div className={styles.description}>Welcome to the DAO!</div>
            <button className={styles.button2} onClick={mint}>Mint DAO NFT</button>
            <p>Your NFTs: {nftBalance.data.toString()}</p>
            <button className={styles.button2} onClick={stakeNft}>Stake NFT at the DAO</button>
            <div className={styles.description}>You joined the DAO at: {nftsAtDao}
            <br/>
            {daoBalance.data && (<>
            Treasury: {formatEther(daoBalance.data.value)} ETH</>)}<br/>
            Total proposals: {totalProposals.data.toString()}
            </div>
            <div className={styles.flex}>
                <button className={styles.button2}
                onClick={()=>setTab('Create Proposal')}>Create Proposal</button>
                <button className={styles.button2}
                onClick={()=>setTab('View Proposals')}>View Proposals</button>
            </div>
            {renderTabs()}
        </div>
    );
}

export default LandingPage;