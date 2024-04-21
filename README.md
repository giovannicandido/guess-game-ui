![Deployment Status](https://github.com/giovannicandido/guess-game-ui/actions/workflows/deploy-staging.yml/badge.svg?branch=main)
![Pull Request](https://github.com/giovannicandido/guess-game-ui/actions/workflows/pr.yml/badge.svg)
[![DeepSource](https://deepsource.io/gh/giovannicandido/guess-game-ui.svg/?label=active+issues&show_trend=true&token=VPKuFqZgaTj_Z50Lj9-nrl42)](https://deepsource.io/gh/giovannicandido/guess-game-ui/?ref=repository-badge)
# Guess Game UI

This project is the main user interface to operate mercado system.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# Deployment Pipeline

Every commit to the main branch is deployed to a staging environment.

Url Access: 

This tag will be used to deploy the app in kubernetes, and can be used in query logs in New Relic like the following:

```text
namespace_name:"" container_name:"guess-game-ui" "labels.app.kubernetes.io/version":"v20240421.5"
```
