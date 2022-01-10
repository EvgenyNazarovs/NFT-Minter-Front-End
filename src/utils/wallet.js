import { RINKEBY_CHAIN_ID } from "../constants";

export const connectWallet = async () => {
  const { ethereum } = window;
  if (!ethereum) {
    return {
      account: "",
      status: "Get MetaMask!",
    };
  }

  try {
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== RINKEBY_CHAIN_ID) {
      return {
        account: "",
        status: "You are not connected to the Rinkeby Test Network!",
      };
    }

    const [account = ""] = await ethereum.request({
      method: "eth_requestAccounts",
    });

    return {
      account,
      status: "Found MetaMask Account",
    };
  } catch (err) {
    console.error(err);
    return {
      account: "",
      status: "😥 " + err.message,
    };
  }
};

export const getCurrentWalletConnected = async () => {
  const { ethereum } = window;
  if (!ethereum) {
    return {
      account: "",
      status: "Get MetaMask!",
    };
  }

  try {
    const accounts = await ethereum.request({ methods: "eth_accounts" });
    if (accounts.length !== 0) {
      return {
        account: accounts[0],
        status: "Found an authorised account",
      };
    } else {
      return {
        account: "",
        status: "No authorised account found",
      };
    }
  } catch (err) {
    console.error(err);
  }
};
