const express = require('express');
const fetch = require('node-fetch');
const expressGraphQL = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull
} = require('graphql')
const app = express();
const BASE_URL = 'http://api.reddit.com';

function fetchResponseByURL(relativeURL) {
  return fetch(`${BASE_URL}${relativeURL}`).then(res => res.json());
}

function fetchArticles() {
  return fetchResponseByURL('/top?limit=50').then(json => json.data.children);
}

function fetchArticleByURL(relativeURL) {
  return fetchResponseByURL(relativeURL).then(json => json.data.children[0]);
}

const ArticleType = new GraphQLObjectType({
  name: 'Article',
  description: 'An Reddit article',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: article => article.data.id
    },
    permalink: {
      type: GraphQLString,
      resolve: article => article.data.permalink
    },
    author: {
      type: GraphQLString,
      resolve: article => article.data.author
    },
    created: {
      type: GraphQLInt,
      resolve: article => article.data.created
    },
    num_comments: {
      type: GraphQLInt,
      resolve: article => article.data.num_comments
    },
    thumbnail: {
      type: GraphQLString,
      resolve: article => article.data.thumbnail
    },
    title: {
      type: GraphQLString,
      resolve: article => article.data.title
    },
    visited: {
      type: GraphQLBoolean,
      resolve: article => article.data.visited
    }
  })
});


const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    articles: {
      type: new GraphQLList(ArticleType),
      resolve: fetchArticles,
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType
})

app.use('/graphql', expressGraphQL({
  schema: schema,
  graphiql: true
}))

app.listen(
  5000,
  () => console.log('GraphQL Server running at http://localhost:5000')
);
