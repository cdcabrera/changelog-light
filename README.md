# Changelog Light
[![Build Status](https://github.com/cdcabrera/changelog-light/workflows/Build/badge.svg?branch=main)](https://github.com/cdcabrera/changelog-light/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/cdcabrera/changelog-light/branch/main/graph/badge.svg)](https://codecov.io/gh/cdcabrera/changelog-light)
[![License](https://img.shields.io/github/license/cdcabrera/changelog-light.svg)](https://github.com/cdcabrera/changelog-light/blob/main/LICENSE)

Generate a changelog with [conventional commit types](https://www.conventionalcommits.org).

## Requirements
The basic requirements:
 * [NodeJS version 14+](https://nodejs.org/)
 * Optionally your system could be running
    - [Yarn 1.22+](https://yarnpkg.com), otherwise NPM should be adequate.
 

## Use

### CLI

NPM install...

  ```shell
    $ npm i changelog-light
  ```
  
or Yarn

  ```shell
    $ yarn add changelog-light
  ```

#### Usage
```
  $ changelog --help
  Generate a CHANGELOG.md with conventional commit types.

  Usage: changelog [options]
  
  Options:
    -c, --commit   Commit CHANGELOG.md and package.json with a release commit
                                                         [boolean] [default: true]
    -d, --date     CHANGELOG.md release date in the form of a valid date string.
                   Uses system new Date([your date])
                                      [string] [default: new Date().toISOString()]
    -r, --dry-run  Generate CHANGELOG.md sample output  [boolean] [default: false]
    -o, --override  Use a version you define.                             [string]
    -h, --help     Show help                                             [boolean]
    -v, --version  Show version number                                   [boolean]
```
### Using within a project
Using `changelog-light` within a project requires one thing... formatting your commit messages using [conventional commit types](https://www.conventionalcommits.org)

This project leverages this [conventional commit types resource](https://github.com/commitizen/conventional-commit-types/blob/master/index.json) to determine
how `CHANGELOG.md` is generated.

#### Example NPM script
Using within a project you could apply `changelog-light` as a NPM script in `package.json`

   ```js
     "scripts": {
       "release": "changelog"
     }
   ```

## Credit
This project is influenced by the now deprecated project [Standard Version](https://github.com/conventional-changelog/standard-version). 

The primary differences between [Standard Version](https://github.com/conventional-changelog/standard-version) and this project
are the weighting assigned to commit message types and a fraction of the features.

## Contributing
Contributing? Guidelines can be found here [CONTRIBUTING.md](./CONTRIBUTING.md).
