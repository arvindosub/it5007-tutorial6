import React, { Component } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'
import Main from './Main'

const client = new ApolloClient({ uri: 'http://localhost:3000/graphql', cache: new InMemoryCache() });

export default class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Main />
      </ApolloProvider>
    )
  }
}
