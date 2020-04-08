import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

const cache = new InMemoryCache();
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const hostname = window.location.hostname;
const port = process.env.NODE_ENV === 'production' ? '' : ':8081';
const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';

export const subscriptionClient = new SubscriptionClient(`${protocol}://${hostname}${port}/api/graphql`, {
  reconnect: true,
  connectionParams: () => {
    const storedUser = JSON.parse(window.sessionStorage.getItem('user') || '{}');

    return {
      identity: storedUser.identity,
      websocketToken: storedUser.websocketToken,
    };
  },
});

const wsLink = new WebSocketLink(subscriptionClient);

const client = new ApolloClient({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink
  ),
  cache,
});

export default client;
