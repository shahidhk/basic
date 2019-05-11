// Remove the apollo-boost import and change to this:
import ApolloClient from "apollo-client";

// Setup the network "links"
import { HttpLink } from 'apollo-link-http';

import { InMemoryCache } from 'apollo-cache-inmemory';

const httpurl = 'https://api.iftar.shahidh.in/v1alpha1/graphql';

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
