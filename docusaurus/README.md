# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator. It can be visited at [klint.docs.shopify.io/](https://klint.docs.shopify.io/)

[![Build status](https://badge.buildkite.com/97c3dd6dfb8619261e74d10604279d0eb3082fc5c8dff4942a.svg)](https://buildkite.com/shopify/klint-docs)

https://buildkite.com/shopify/klint-docs

## Installation

```
$ yarn
```

## Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
