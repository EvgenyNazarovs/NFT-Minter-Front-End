import "./styles/App.css";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { connectWallet, getCurrentWalletConnected } from "./utils/wallet";
import {
  CONTRACT_ADDRESS,
  TOTAL_MINT_COUNT,
  RINKEBY_URL,
  OPENSEA_LINK,
  RARIBLE_URL,
} from "./constants";
import Loading from "./Animation";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [status, setStatus] = useState("");
  const [hash, setHash] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNumber, setMintedNumber] = useState(0);

  const onConnectWalletClick = async () => {
    const { account, status } = await connectWallet();
    setCurrentAccount(account);
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
      {isMinting ? (
        <Loading></Loading>
      ) : (
        <button className="cta-button mint-button" onClick={mintNft}>
          Mint NFT
        </button>
      )}
      <p className="mint-total-text">
        Total Minted So Far: {mintedNumber} / {TOTAL_MINT_COUNT}.
      </p>
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
          const tokenNumberId = tokenId.toNumber();
          const newStatus = (
            <div>
              <p>
                We've minted your NFT and sent it to your wallet. It may be
                blank right now. It can take a max of 10 min to show up on
                OpenSea.
              </p>
              <p>
                See your NFT on OpenSea (may take up to 10 min):
                <a href={OPENSEA_LINK + "" + tokenNumberId}>
                  {OPENSEA_LINK}/{tokenNumberId}
                </a>
              </p>
              <p>
                <a href={RARIBLE_URL + "/" + tokenNumberId}>
                  See your NFT on Rarible: {RARIBLE_URL}
                  {tokenNumberId}
                </a>
              </p>
            </div>
          );
          setStatus(newStatus);
          connectedContract
            .getTotalMintedNFTs()
            .then((total) => setMintedNumber(total.toNumber()))
            .catch((err) => console.error(err));
          setIsMinting(false);
        });
        console.log("Setup event listener!");
      } else {
        setStatus("Can't connect to your MetaMask account.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const mintNft = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        if (currentAccount === "") {
          setStatus("Please connect your MetaMask 🦊 account first.");
          return;
        }
        setIsMinting(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        setStatus("Going to pop wallet now to pay gas... ⛽️");
        const txn = await connectedContract.makeAnEpicNFT();
        setStatus("Minting...");
        await txn.wait();
        // setStatus(`Minted, see transaction: ${RINKEBY_URL}/${txn.hash}`);
      } catch (error) {
        setStatus("Sorry, there was a minting error 😳");
        setIsMinting(false);
      }
    } else {
      setStatus("Please connect your MetaMask 🦊 account first.");
    }
  };

  const getTotalNFTsMintedSoFar = async () => {
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
        const totalMinted = await connectedContract.getTotalMintedNFTs();
        setMintedNumber(totalMinted.toNumber());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const { account, status } = await getCurrentWalletConnected();
      setCurrentAccount(account);
      setStatus(status);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (currentAccount !== "") {
      setupEventListener();
      getTotalNFTsMintedSoFar();
    }
  }, [currentAccount]);

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
        <div className="sub-text">{status}</div>
        <div className="footer-container"></div>
      </div>
    </div>
  );
};

export default App;
