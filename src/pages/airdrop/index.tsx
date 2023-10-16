import React, { useEffect, useState } from "react";
import { localhost, polygonMumbai } from "@wagmi/chains";
import { useContractRead, useAccount, useConnect, useNetwork } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";
import Hypercert from "../../../public/Hypercert.json";
import fetch from "node-fetch";
import { HYPERCERT_CONTRACT } from "../../../utils/constants";
import {
  fetchHypercertBalance,
  fetchHoldersOfTokenID,
} from "../../../graphql/queries";
const connector = new MetaMaskConnector({
  chains: [localhost, polygonMumbai],
});

// function to generate a random UUID
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    // eslint-disable-next-line
    const r = (Math.random() * 16) | 0,
      // eslint-disable-next-line
      v = c === "x" ? r : (r & 0x3) | 0x8;
    // eslint-disable-next-line
    return v.toString(16);
  });
}

export async function createWallet(description: string) {
  const idempotencyKey = uuidv4();
  const url = "https://api-sandbox.circle.com/v1/wallets";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization:
        "Bearer SAND_API_KEY:3d48568ed5c14a5856f1e70b5836e6af:b0478a88f58afe0ae1113a8f26fc9a94",
    },
    body: JSON.stringify({
      idempotencyKey: idempotencyKey,
      description: description,
    }),
  };

  const response = await fetch(url, options);

  const json = await response.json();
  console.log(json.data.walletId);
  return [json.data.walletId, idempotencyKey];
}

export async function createBlockchainAddress(
  walletID: number,
  idempotencyKey: string
) {
  const url = `https://api-sandbox.circle.com/v1/wallets/${walletID}/addresses`;
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`,
    },
    body: JSON.stringify({
      idempotencyKey: idempotencyKey,
      currency: "USD",
      chain: "MATIC",
    }),
  };

  const response = await fetch(url, options);

  const json = await response.json();
  return json.data.address;
}

export async function checkTransferStatus(walletID: number) {
  console.log(walletID);
  const circleAPIUrl = `https://api-sandbox.circle.com/v1/transfers?walletId=${walletID}&returnIdentities=false`;
  const circleAPIOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`,
    },
  };

  //call the circle api first, and from the result received, call the luniverse api
  const circleAPIResponse = await fetch(circleAPIUrl, circleAPIOptions);
  const circleAPIJson = await circleAPIResponse.json();

  const txHash = circleAPIJson.data[0]?.transactionHash;

  // const luniverseAPIUrl = `https://web3.luniverse.io/v1/polygon/mumbai/transactions/${txHash}`;
  // console.log(luniverseAPIUrl);

  // const options = {
  //   method: "GET",
  //   headers: {
  //     accept: "application/json",
  //     "Access-Control-Allow-Origin": "*", // Required for CORS support to work
  //     mode: "cors",
  //     Authorization:
  //       "Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJoYkg5RmlFMkZfcEFSY2RWeWxGaHNtVVY1blZfOEVGYXN4VlVyajVtRU9JIn0.eyJleHAiOjE2ODYwNzAzODUsImlhdCI6MTY4NTQ2NTU4NSwianRpIjoiMDgzMzk5ZjAtYjk1MS00ZGJhLTg4MDYtY2NmMTM5MTljZjljIiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLmx1bml2ZXJzZS5jb206MzEwMC9yZWFsbXMvbm92YSIsInN1YiI6Ijk2MzA4Y2JlLWU1Y2YtNDEzOS04ZDY5LTUxNDJhODk2ZDI5OSIsInR5cCI6IkJlYXJlciIsImF6cCI6IjE2ODU0NTY0NzU1OTIyNDI3OTAiLCJzZXNzaW9uX3N0YXRlIjoiNjRlMzMwNWYtMDhjNy00ZGQzLThjNmMtYTU0Yzg2YzJkNjU4IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW5vdmEiXX0sInNjb3BlIjoicHJvZmlsZSIsInNpZCI6IjY0ZTMzMDVmLTA4YzctNGRkMy04YzZjLWE1NGM4NmMyZDY1OCIsInByZWZlcnJlZF91c2VybmFtZSI6IjE2ODU0NTY0NzU1OTIyNDI3OTA6eWFjdW5uaWNtdW11eXVieGhneGt5cHhyamNqZnJtYWt3dzhydXBhanN2eXFhdnAzdW51cjN2Z3M5OWFiNG1hYSIsImdyYW50Ijp7InByb3RvY29scyI6IjIiLCJhY2NvdW50cyI6IjIiLCJibG9ja3MiOiIyIiwidHJhbnNhY3Rpb25zIjoiMiIsImFzc2V0cyI6IjIiLCJldmVudHMiOiIyIiwic3RhdHMiOiIyIiwid2ViaG9va3MiOiIyIn19.NYxeu8IO1Jz6OEMJ6VKhrygppPe491-f1ss9E0PpcXR_s-rJyuKIFwCBBWOhsQwDDnTMJ53Kv8CVmJ6tRkrowXvcK-DHWqHCvNvFk9V_Kq7A7or5XS_tCoiPC3xYk76iKEbLIkhrUYTsknp_3tlueMtnG2cNLP3VA0hihFJa77XsXEQPSAIro-VMwIyglaT6iXRyMOWrrAbcbqTmzw-d1cUqGK4z4_fQvBJ8zyImXayjNmpJgvxVf5Mv56nQkzp-DYCMTaOF95fkKLgll3NDW4NcBsoUsa2D4SVgxQpYuZcOCcFXmBPFq_dPGN6wXzt1nqmEc4CgqqrQteGmRDc75A",
  //   },
  // };

  // fetch(luniverseAPIUrl, options)
  //   .then((response) => response.json())
  //   .then((response) => console.log(response))
  //   .catch((err) => console.error(err));

  const polygonScanUrl = `https://api-testnet.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=YourApiKeyToken`;
  const polygonScanResponse = await fetch(polygonScanUrl);
  const polygonScanJson = await polygonScanResponse.json();
  const status = polygonScanJson.result.status;

  return status;
}

export default function Index() {
  const [selectedTokenID, setSelectedTokenID] = useState("");
  const [isGrantVerified, setIsGrantVerified] = useState(false);
  const [isFundsDeposited, setIsFundsDeposited] = useState(false);
  const [isWalletAddressCreated, setIsWalletAddressCreated] = useState(false);
  const [isAddressesAdded, setIsAddressesAdded] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [inputError, setInputError] = useState(false);
  const [isVerificationClicked, setIsVerificationClicked] = useState(false);
  const [description, setDescription] = useState("");
  const [walletID, setWalletID] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isCreatingAirdrop, setIsCreatingAirdrop] = useState(true);
  const [isAirdropped, setIsAirdropped] = useState(false);

  const { isConnected, address } = useAccount();
  const [isConnect, setIsConnect] = useState(false);
  const { chain, chains } = useNetwork();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const handleTokenIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Replace non-numeric characters
    setSelectedTokenID(inputValue);
    setInputError(false); // Reset input error when token ID changes
  };

  const handleSliderChange = () => {
    setIsCreatingAirdrop(!isCreatingAirdrop);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  //set is funds deposited to true

  const { data: grantEnded } = useContractRead({
    abi: HYPERCERT_CONTRACT.abi,
    address: HYPERCERT_CONTRACT.address,
    functionName: "grantEnded(uint256)",
    args: [selectedTokenID],
    watch: true,
    onError: (err: any) => {
      console.error(err);
    },
  });

  const { data: grantOwner } = useContractRead({
    abi: HYPERCERT_CONTRACT.abi,
    address: HYPERCERT_CONTRACT.address,
    functionName: "grantOwner(uint256)",
    args: [selectedTokenID],
    watch: true,
    onError: (err: any) => {
      console.error(err);
    },
  });

  const { data: grantInfo } = useContractRead({
    abi: HYPERCERT_CONTRACT.abi,
    address: HYPERCERT_CONTRACT.address,
    functionName: "grantInfo(uint256)",
    args: [selectedTokenID],
    watch: true,
    onError: (err: any) => {
      console.error(err);
    },
  });

  const handleVerifyGrant = async () => {
    if (selectedTokenID === "") {
      setInputError(true);
    } else {
      setInputError(false);
    }

    // Perform a check before fetching contract data.
    // If grantEnded is true and grantOwner is the same as the connected wallet address, then grant is verified
    if (grantEnded && grantOwner === address) {
      setIsGrantVerified(true);
      setIsVerificationClicked(true); // Set the state to true after verification
    } else {
      setIsGrantVerified(false);
      alert("Grant has not ended or you are not the grant owner");
    }

    //call fetchHoldersOfTokenID() function
    // console.log(selectedTokenID);
    // const holders = await fetchHoldersOfTokenID(selectedTokenID);
    // console.log("holders:", holders);
  };

  const handleDepositFunds = async (description: string) => {
    interface Wallet {
      walletAddress: any;
      walletID: string;
      idempotencyKey: string;
      description: string;
      depositAddress: string;
    }

    //call createWallet() function
    const [walletID, idempotencyKey] = await createWallet(description);
    console.log(walletID, idempotencyKey);
    setWalletID(walletID);
    setIdempotencyKey(idempotencyKey);

    //call createBlockchainAddress() function
    const depositAddress = await createBlockchainAddress(
      walletID,
      idempotencyKey
    );
    console.log(depositAddress);
    setWalletAddress(depositAddress);

    let wallet: Wallet = {
      walletAddress: address,
      walletID: walletID,
      idempotencyKey: idempotencyKey,
      description: description,
      depositAddress: depositAddress,
    };

    // const data = await createRecord(wallet);
    // console.log(data);
  };

  const handleDepositCheck = async (walletID: number) => {
    //call checkTransferStatus() function
    if ((await checkTransferStatus(walletID)) === "1") {
      setIsFundsDeposited(true);
    } else {
      setIsFundsDeposited(false);
      //also tell the user that no funds have been deposited
      alert("No funds have been deposited");
    }
  };

  const createAirdropParticipants = async (walletAddress: string) => {
    const idempotencyKey = uuidv4();

    const grantName = (grantInfo as any).grantName;
    //remove all spaces from the grant name
    const newGrantName = grantName.replace(/\s/g, "");
    const url = "https://api-sandbox.circle.com/v1/addressBook/recipients";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({
        chain: "MATIC",
        metadata: { email: `${newGrantName}@reignite.com` },
        idempotencyKey: idempotencyKey,
        address: walletAddress,
      }),
    };

    const response = await fetch(url, options);

    const json = await response.json();
    console.log(json);
  };

  const getHypercertBalance = async (address: any) => {
    const data = await fetchHypercertBalance(
      "0x79Ba287a5b8FDf3d290238a58476A3eA1dA9B514"
    );
    console.log(data);

    const balances: { [key: string]: string } = {};

    data.account?.ERC1155balances?.forEach((balance: any) => {
      const identifier = balance.token.identifier;
      const valueExact = balance.token.balances[0].valueExact;
      balances[identifier] = valueExact;
    });

    console.log(balances);
  };

  const createPayouts = async () => {
    const idempotencyKey = uuidv4();

    const grantName = (grantInfo as any).grantName;
    //remove all spaces from the grant name
    const newGrantName = grantName.replace(/\s/g, "");
    const url = `https://api-sandbox.circle.com/v1/addressBook/recipients?email=${newGrantName}%40reignite.com`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`,
      },
    };

    const response = await fetch(url, options);

    const json = await response.json();
    console.log(json.data[0].address);
    //the data is in json.data, so iterate over it and remove duplicate addresses
    const addresses = json.data.map((item: any) => [item.address, item.id]);
    //now in addresses, remove all duplicate addresses by checking the first element of each array
    const uniqueAddresses = Array.from(
      new Set(addresses.map((a: any) => a[0]))
    ).map((address) => {
      return addresses.find((a: any) => a[0] === address);
    });
    console.log(uniqueAddresses);

    //for each of the unique address, create a payout request
    uniqueAddresses.forEach(async (address) => {
      const url = "https://api-sandbox.circle.com/v1/payouts";
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({
          source: {
            type: "wallet",
            identities: [
              {
                type: "individual",
                addresses: [
                  {
                    line1: "100",
                    city: "Test",
                    district: "Test",
                    postalCode: "10000",
                    country: "Te",
                  },
                ],
                name: "ReIgnite",
              },
            ],
            id: walletID,
          },
          destination: { type: "address_book", id: address[1] },
          amount: { currency: "USD", amount: 1 },
          toAmount: { currency: "USD" },
          idempotencyKey: idempotencyKey,
        }),
      };

      const response = await fetch(url, options);

      const json = await response.json();
      console.log(json);
    });
  };

  const handleAirdrop = async () => {
    //include a way to get the wallet addresses from the subgraph, for now its hardcoded
    //dictionary containing wallet address to token holdings mapping
    const walletAddresses = {
      "0x79Ba287a5b8FDf3d290238a58476A3eA1dA9B514": 100,
      "0x07e96f02d57A1F0EACe103028D0b26fd2D5f283E": 200,
    };

    for (const [key, value] of Object.entries(walletAddresses)) {
      await createAirdropParticipants(key);
    }
    setIsAddressesAdded(true);

    //call createPayouts() function
    await createPayouts();
    setIsAirdropped(true);
  };

  useEffect(() => {
    if (isConnected) {
      setIsConnect(true);
    }
  }, [isConnected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Add the slider */}
      <div className="flex items-center mb-6 justify-center">
        <label className="mr-2">Create Retrospective Rewards</label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
          <input
            type="checkbox"
            name="slider"
            id="slider"
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            checked={isCreatingAirdrop}
            onChange={handleSliderChange}
          />
          <label
            htmlFor="slider"
            className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"
            style={{
              backgroundColor: isCreatingAirdrop ? "#3B82F6" : "#D1D5DB",
              marginLeft: isCreatingAirdrop ? "auto" : "0",
              marginRight: isCreatingAirdrop ? "0" : "auto",
            }}
          ></label>
        </div>
        <label className="ml-2">Manage Retrospective Rewards</label>
      </div>
      {/* Render the appropriate content based on the slider */}
      {isCreatingAirdrop ? (
        <div className="flex items-center mb-5 ">
          <div className="w-full max-w-md">
            <div className="text-3xl font-bold mb-8 flex flex-col items-between text-center">
              <h1 className="text-3xl font-bold">
                Retrospective Rewards to be initiated by
              </h1>
              <div>
                {isConnect ? (
                  <p className="text-blue-500 text-3xl">
                    {address} on {chain?.name}
                  </p>
                ) : (
                  <button
                    className="bg-blue-500 text-white rounded px-4 py-2 mb-4"
                    onClick={() => connect()}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
            {/* Section 1: Choose Grant */}
            <div className="flex items-center mb-6 justify-center">
              <div
                className={`w-6 h-6 rounded-full ${
                  isGrantVerified ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></div>
              <div className="flex flex-row">
                <p className="ml-2">Choose Grant</p>
              </div>
            </div>

            <div className="flex items-center mb-5 justify-center">
              <input
                type="text"
                value={selectedTokenID}
                onChange={handleTokenIDChange}
                className="px-2 py-1 border border-gray-300 rounded"
                placeholder="Enter Token ID"
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleVerifyGrant}
              >
                Verify
              </button>
            </div>

            {inputError && (
              <p className="text-red-500 mb-4 text-center">
                Please provide a Token ID.
              </p>
            )}
            {isGrantVerified && (
              <div className="flex items-center mt-1 md-5 justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-5"></div>
                <p>Grant ended</p>
                <div className="w-3 h-3 rounded-full bg-green-500 mr-5 ml-5"></div>
                <p>Grant creator</p>
              </div>
            )}

            {/* Section 2: Deposit Funds */}
            <div className="flex items-center mb-6 mt-10 justify-center">
              <div
                className={`w-6 h-6 rounded-full ${
                  isGrantVerified ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></div>
              <p className="ml-2">Deposit Funds</p>
            </div>
            {isGrantVerified && (
              <>
                <div className="flex items-center mb-6 justify-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={description}
                      onChange={handleDescriptionChange}
                      className="px-2 py-1 border border-gray-300 rounded"
                      placeholder="Enter Description (Optional)"
                    />
                  </div>
                  <button
                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handleDepositFunds(description)}
                  >
                    Create Wallet Address
                  </button>
                </div>
                {walletID && (
                  <div className="flex items-center mb-6 justify-center">
                    <p className="mr-2">Wallet ID:</p>
                    <p className="text-blue-500">{walletID}</p>
                  </div>
                )}
                {walletAddress && (
                  <div className="flex items-center mb-6 justify-center">
                    <p className="mr-2">Wallet Address:</p>
                    <p className="text-blue-500">{walletAddress}</p>
                  </div>
                )}
                {walletAddress && walletID && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => handleDepositCheck(walletID)}
                  >
                    I have deposited USDC on Polygon Mumbai to the above address
                  </button>
                )}
              </>
            )}

            {/* Section 3: Airdrop */}
            <div className="flex items-center mb-10 mt-10 justify-center">
              <div
                className={`w-6 h-6 rounded-full ${
                  isFundsDeposited ? "bg-blue-500" : "bg-gray-500"
                }`}
              ></div>
              <p className="ml-2">Retrospective Rewards</p>
            </div>
            {isFundsDeposited && (
              <div className="flex items-center justify-center">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => handleAirdrop()}
                >
                  Initiate Retrospective Rewards
                </button>
              </div>
            )}
            {isAddressesAdded && (
              <div className="flex items-center mt-1 md-5 justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-5"></div>
                <p>Addresses added</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-3xl font-bold mb-8 flex flex-col items-between text-center">
            <h2 className="text-3xl font-bold">Manage Wallets</h2>
            {/* Add your Manage Wallets code here */}
          </div>
          <div className="text-3xl font-bold mb-8 flex flex-col items-between text-center">
            <h2 className="text-3xl font-bold">
              Retrospective Rewards History
            </h2>
            {/* Add your Airdrop History code here */}
          </div>
        </div>
      )}
    </div>
  );
}
