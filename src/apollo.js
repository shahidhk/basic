// Remove the apollo-boost import and change to this:
import ApolloClient from "apollo-client";

// Setup the network "links"
import { HttpLink } from 'apollo-link-http';

import { InMemoryCache } from 'apollo-cache-inmemory';

export const HASURA_GRAPHQL_ENGINE_HOSTNAME = '192.168.0.103:8080';
// export const HASURA_GRAPHQL_ENGINE_HOSTNAME = window.location.host;

const scheme = (proto) => {
  return window.location.protocol === 'https:' ? `${proto}s` : proto;
}

const httpurl = `${scheme('http')}://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1alpha1/graphql`;

const getNewClient = (accessKey) => {

  const httpLink = new HttpLink({
    uri: httpurl,
    headers: {
      'x-hasura-access-key': accessKey
    }
  });


  const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  });

  return client;
};

export default getNewClient;
