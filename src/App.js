import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import githubLogo from "./assets/github-logo.png";
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
  COLLECTION_URL,
  TWITTER_HANDLE,
  TWITTER_LINK,
  GITHUB_LINK,
} from "./constants";
import Loading from "./Loading";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [rinkebyUrl, setRinkebyUrl] = useState("");
  const [openSeaUrl, setOpenSeaUrl] = useState("");
  const [raribleUrl, setRaribleUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNumber, setMintedNumber] = useState(null);
  const [showUrls, setShowUrls] = useState(false);

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

  const renderMintUI = () =>
    isMinting ? (
      <Loading></Loading>
    ) : (
      <button className="cta-button mint-button" onClick={mintNft}>
        Mint NFT
      </button>
    );

  const renderTotalMintedSoFar = () => (
    <p className="mint-total-text">
      Total Minted So Far: {mintedNumber} / {TOTAL_MINT_COUNT}.
    </p>
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
          const openSea = `${OPENSEA_LINK}/${tokenNumberId}`;
          const rarible = RARIBLE_URL + tokenNumberId;
          setOpenSeaUrl(openSea);
          setRaribleUrl(rarible);

          const mintedMsg = (
            <div>
              <p>We've minted your NFT and sent it to your wallet. 😍</p>
              <p>It may take up to 10 min to display on OpenSea.</p>
            </div>
          );

          connectedContract
            .getTotalMintedNFTs()
            .then((total) => setMintedNumber(total.toNumber()))
            .catch((err) => console.error(err));
          setIsMinting(false);
          setStatus(mintedMsg);
          setShowUrls(true);
        });
        console.log("Setup event listener!");
      } else {
        setStatus("Can't connect to your MetaMask account.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const renderUserUrls = () => (
    <div>
      <p>
        <button className="user-link-button opensea-button">
          <a
            href={rinkebyUrl}
            target="_blank"
            rel="noreferrer"
            className="collection-link"
          >
            Your Transaction
          </a>
        </button>
      </p>

      <p>
        <button className="user-link-button opensea-collection-button">
          <a
            href={openSeaUrl}
            target="_blank"
            rel="noreferrer"
            className="cta-button collection-link"
          >
            Your NFT on OpenSea
          </a>
        </button>
      </p>

      <p>
        <button className="user-link-button rarible-button">
          <a
            href={raribleUrl}
            target="_blank"
            rel="noreferrer"
            className="cta-button collection-link"
          >
            Your NFT on Rarible
          </a>
        </button>
      </p>
    </div>
  );

  const mintNft = async () => {
    const { ethereum } = window;
    if (ethereum) {
      try {
        if (currentAccount === "") {
          setStatus("Please connect your MetaMask 🦊 account first.");
          return;
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        setStatus("Going to pop wallet now to pay gas... ⛽️");
        const txn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        setStatus("Minting...");
        await txn.wait();
        setRinkebyUrl(`${RINKEBY_URL}/${txn.hash}`);
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
          <button className="cta-button see-collection-button">
            <a
              href={COLLECTION_URL}
              target="_blank"
              rel="noreferrer"
              className="collection-link"
            >
              See Collection
            </a>
          </button>

          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}

          {mintedNumber && renderTotalMintedSoFar()}
        </div>

        <div className="sub-text">
          {status}
          {showUrls && renderUserUrls()}
        </div>
        <div className="footer-container">
          <div className="logo-container">
            <img
              alt="Twitter Logo"
              className="social-media-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
          <div className="logo-container">
            <img
              alt="Github logo"
              className="social-media-logo"
              src={githubLogo}
            />
            <a
              className="footer-text github-text"
              href={GITHUB_LINK}
              target="_blank"
              rel="noreferrer"
            >
              my github
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
