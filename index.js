const port = process.env.PORT || 5000
const express = require('express');
const fetch = require('node-fetch');
const expressGraphQL = require('express-graphql')
const cors = require('cors');

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

app.use(cors());

function fetchResponseByURL(relativeURL) {
  return fetch(`${BASE_URL}${relativeURL}`).then(res => res.json());
}

function fetchArticles(limit, before, after) {
  return fetchResponseByURL(`/top?limit=${limit}&before=${before}&after=${after}`).then(json => json.data.children);
}

function fetchSubredditInfo(relativeURL) {
  return fetchResponseByURL(relativeURL).then(json => json.data);
}

const ArticleType = new GraphQLObjectType({
  name: 'Article',
  description: 'An Reddit article',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: article => article.data.id
    },
    name: {
      type: GraphQLString,
      resolve: article => article.data.name
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
    },
    preview: {
      type: PreviewType,
      resolve: article => article.data.preview
    },
    subreddit: {
      type: GraphQLString,
      resolve: article => article.data.subreddit
    }
  })
});


const PreviewType = new GraphQLObjectType({
  name: 'Preview',
  description: 'Preview for a Reddit article',
  fields: () => ({
    images: {
      type: GraphQLList(ImageType),
      resolve: preview => preview.images
    },
    enabled: {
      type: GraphQLBoolean,
      resolve: preview => preview.enabled
    }
  })
});

const ImageType = new GraphQLObjectType({
  name: 'Image',
  description: 'Images for a Reddit preview',
  fields: () => ({
    source: {
      type: SourceType,
      resolve: image => image.source
    },
    id: {
      type: GraphQLString,
      resolve: image => image.id
    },
    resolutions: {
      type: GraphQLList(SourceType),
      resolve: image => image.resolutions
    }
  })
});

const SourceType = new GraphQLObjectType({
  name: 'Source',
  description: 'Source for a image in Reddit article images',
  fields: () => ({
    url: {
      type: GraphQLString,
      resolve: source => source.url
    },
    width: {
      type: GraphQLString,
      resolve: source => source.width
    },
    height: {
      type: GraphQLString,
      resolve: source => source.height
    }
  })  
});  

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    articles: {
      type: new GraphQLList(ArticleType),
      args: {
        limit: { type: GraphQLInt },
        before: { type: GraphQLString },
        after: { type: GraphQLString }
      },
      resolve: (root, args) => {
        return fetchArticles(args.limit, args.before, args.after)
      },
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQueryType
})

app.use('/', expressGraphQL({
  schema: schema,
  graphiql: true
}))

app.listen(
  port,
  () => console.log(`GraphQL Server running at http://localhost:${port}`)
);
