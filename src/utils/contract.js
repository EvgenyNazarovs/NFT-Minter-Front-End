import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { CONTRACT_ADDRESS, RINKEBY_URL } from "../constants";

export const mintNft = async (currentAccount) => {
  const { ethereum } = window;
  if (ethereum) {
    try {
      if (currentAccount === "") {
        return {
          account: "",
          status: "Please connect your account first!",
        };
      }
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      const txn = await connectedContract.makeAnEpicNFT();
      await txn.wait();
      return {
        hash: txn.hash,
        status: `Minted, see transaction: ${RINKEBY_URL}/${txn.hash}`,
      };
    } catch (error) {
      console.error(error);
      return {
        error,
        status: "There was an error while minting",
      };
    }
  } else {
    return {
      status: "Get MetaMask!",
    };
  }
};

export const getTotalNFTsMintedSoFar = async () => {
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
      return totalMinted.toNumber();
    }
  } catch (err) {
    console.error(err);
  }
};
