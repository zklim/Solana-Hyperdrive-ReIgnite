import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { airdropClient } from "../utils/graphql";

const CREATE_RECORD = gql`
  mutation CreateRecord(
    $walletAddress: String!
    $walletID: Int!
    $idempotencyKey: String!
    $description: String!
    $depositAddress: String!
  ) {
    insert_createdWallet_one(
      object: {
        walletAddress: $walletAddress
        walletID: $walletID
        idempotencyKey: $idempotencyKey
        description: $description
        depositAddress: $depositAddress
      }
    ) {
      record {
        ... on createdWallet {
          id
          walletAddress
          walletID
          idempotencyKey
          description
          depositAddress
        }
      }
    }
  }
`;

export async function createRecord(wallet: any) {
  try {
    const response = await airdropClient.mutate({
      mutation: CREATE_RECORD,
      variables: {
        walletAddress: wallet.walletAddress,
        walletID: wallet.walletID,
        idempotencyKey: wallet.idempotencyKey,
        description: wallet.description,
        depositAddress: wallet.depositAddress,
      },
    });

    // Return the newly created record
    return response.data.insert_createdWallet_one.record;
  } catch (error) {
    console.error("Error creating record:", error);
    throw error;
  }
}
