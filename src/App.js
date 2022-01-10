import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { connectWallet, checkIfWalletIsConnected } from "./utils/wallet";
import { mintNft } from "./utils/contract";
import { CONTRACT_ADDRESS } from "./constants";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  const onConnectWalletClick = async () => {
    const { account, status } = await connectWallet();
    setCurrentAccount(account);
    setStatus(status);
    if (account !== "") {
      setupEventListener();
    }
  };

  const onMintNftClick = async () => {
    setIsMinting(true);
    const { hash, status, error } = await mintNft(currentAccount);
    if (error) {
      setIsMinting(false);
      return;
    }
    setHash(hash);
    setStatus(status);
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={onConnectWalletClick}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <div>
      <button
        className="cta-button connect-wallet-button"
        onClick={onMintNftClick}
      >
        Mint NFT
      </button>
      {/* <p className="mint-total-text">
        {totalMinted} / {TOTAL_MINT_COUNT} minted so far.
      </p> */}
    </div>
  );

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setMintedTokenId(tokenId.toNumber());
          // alert(
          //   `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          // );
          setIsMinting(false);
          console.log("token id: ", tokenId.toNumber());
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { account, status } = await checkIfWalletIsConnected();
      setCurrentAccount(account);
      setStatus(status);
      if (account !== "") {
        setupEventListener();
      }
    }
    fetchData();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Eugene's First NFT Minter</p>
          <p className="sub-text">
            Best writers. Finest foods. What are they like.
          </p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
        </div>
        <div className="footer-container"></div>
      </div>
    </div>
  );
};

export default App;
