import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://indexooooor-9760.gke-singapore.settlemint.com/subgraphs/name/reignite-9b6d",
  cache: new InMemoryCache(),
  headers: {
    "x-auth-token": "bpaas-1243117E4eF3d8f636a5196571edD086A44fced3",
  },
});

const airdropClient = new ApolloClient({
  uri: "https://reignite-db-dfd4.gke-singapore.settlemint.com/v1/graphql",
  cache: new InMemoryCache(),
  headers: {
    "x-auth-token": "bpaas-1Ed9609d331838065C05a489268Acd13290e38a3",
    "x-hasura-admin-secret": "627fcb1ec6b3569880f3",
  },
});

export default client;

export { airdropClient };
