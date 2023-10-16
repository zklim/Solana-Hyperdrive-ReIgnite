import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import client from "../utils/graphql";

const GET_HYPERCERT_BALANCE = `
  query GetHypercertBalance($wallet: ID!) {
    account(id: $wallet) {
        ERC1155balances {
          token {
            identifier
            balances(where: {account: $wallet}) {
              valueExact
            }
          }
        }
      }
  }
`;

const GET_HOLDERS_OF_TOKENID = `
query GetHoldersOfTokenID($id:ID!) {
  erc1155Token(id: $id) {
    balances {
      account {
        id
      }
      valueExact
    }
  }
}
`;

export async function fetchHypercertBalance(wallet: string) {
  try {
    const { data } = await client.query({
      query: gql(GET_HYPERCERT_BALANCE),
      variables: { wallet },
    });

    // Process the retrieved data
    return data;
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error fetching Hypercert balance:", error);
    throw error;
  }
}

// Send something like this: "0xf41b72fa91eea7c3b87526ebac58be28dccbb32d/0x6"
export async function fetchHoldersOfTokenID(id: string) {
  try {
    const { data } = await client.query({
      query: gql(GET_HOLDERS_OF_TOKENID),
      variables: { id },
    });

    // Process the retrieved data
    return data;
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error("Error fetching holders of token ID:", error);
    throw error;
  }
}
