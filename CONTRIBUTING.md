# Contributing

## Commits
For consistency we make use of [Conventional Commits](https://www.conventionalcommits.org). It's encouraged that 
commit messaging follow the format
  ```
  <type>[optional scope]: <description>
  ```

### Build Requirements
To set up your work environment you'll need to use
 * [NodeJS](https://nodejs.org/)
 * [Yarn](https://yarnpkg.com)
    
### Develop with testing
To start work
  ```shell
  $ yarn
  $ yarn test:dev
  ```

#### Testing
Jest is used for the unit test framework. To run unit tests during development open a terminal instance and run
  ```shell
  $ yarn test:dev
  ```

### Code Coverage
The requirements for code coverage are currently maintained around the `60%` to `80%` mark.

Updates that drop coverage below the current threshold should have their coverage expanded before being merged. 

Settings for coverage can be found in [package.json](./package.json)

#### To check test coverage
  ```shell
  $ yarn test
  ```

#### Code coverage failing to update?
If you're having trouble getting an accurate code coverage report, or it's failing to provide updated results (i.e. you renamed files) you can try running
  ```
  $ yarn test:clearCache
  ```
