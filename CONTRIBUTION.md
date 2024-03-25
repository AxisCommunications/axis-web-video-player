# Contribution

## Developing

Create a GitHub personal access token (classic) with at least read:packages scope to install required packages.

Add registry to .npmrc, .yarnrc or similar, as well as your GitHub token:

 ```
   @lkp-rnd:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=TOKEN
   ```

   If using `.yarnrc.yml` this would instead be:

   ```
   npmScopes:
     lkp-rnd:
       npmRegistryServer: "https://npm.pkg.github.com"
       npmAuthToken: TOKEN
   ```

## Create a npm package locally

Run 
:
```
npm run local-pack
```

This will create a tgz file that can be distributed externally. 

To install it with npm:

```
npm install <filename>.tgz
```

Remember to bump the version in `package.json` if creating a new release.