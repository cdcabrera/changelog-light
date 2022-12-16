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

#### CLI Usage
```
  $ changelog --help
  Generate a CHANGELOG.md with conventional commit types.

  Usage: changelog [options]
  
  Options:
    -c, --commit        Commit CHANGELOG.md and package.json with a release commit
                                                         [boolean] [default: true]
    -d, --date          CHANGELOG.md release date in the form of a valid date
                        string. Uses system new Date([your date])
                                    [string] [default: "2022-10-13T17:51:29.464Z"]
    -n, --non-cc        Allow non-conventional commits to apply a semver weight
                        and appear in CHANGELOG.md under a general type
                        description.                    [boolean] [default: false]
    -o, --override      Use a version you define.                         [string]
    -r, --dry-run       Generate CHANGELOG.md sample output
                                                        [boolean] [default: false]
        --commit-path   CHANGELOG.md path used for commits. This will be "joined"
                        with "remote-url". Defaults to the commits path for
                        GitHub.                      [string] [default: "commit/"]
        --compare-path  CHANGELOG.md path used for version comparison. This will
                        be "joined" with "remote-url". Defaults to the comparison
                        path for GitHub.            [string] [default: "compare/"]
        --pr-path       CHANGELOG.md path used for PRs/MRs. This will be "joined"
                        with "remote-url". Defaults to the PR path for GitHub.
                                                       [string] [default: "pull/"]
        --remote-url    Git remote get-url for updating CHANGELOG.md base urls.
                        This should start with "http". Defaults to "$ git remote
                        get-url origin"                                   [string]
    -h, --help          Show help                                        [boolean]
    -v, --version       Show version number                              [boolean]
```
### Using within a project
Using `changelog-light` within a project requires one primary thing... formatting your commit messages using [conventional commit types](https://www.conventionalcommits.org)

This project leverages this [conventional commit types resource](https://github.com/commitizen/conventional-commit-types/blob/master/index.json) to determine
how `CHANGELOG.md` is generated.

#### How it works
`changelog-light` doesn't use tags. Focusing on tags to determine what gets generated works in some environments.

Since handling tags was unnecessary for our purpose, we kept it simple. Instead, `changelog-light` looks for the
last commit message, of a specific type, to determine the range of commits...

   ```
   chore(release): [semver version format]
   ```

#### Example NPM script
Using within a project you could apply `changelog-light` as a NPM script in `package.json`

   ```js
   "scripts": {
     "release": "changelog"
   }
   ```


#### How to use
Assuming you're using GitHub as your base. _If you're not using GitHub we do expose the url paths used to generate the log._

1. First, git checkout the branch you want to run `changelog-light` on
1. Next, run the CLI, either directly, or through a NPM script like the above example.

   ```
   $ changelog --dry-run --non-cc
   ```
   _We recommend you try the `--dry-run` and `--non-cc` options for your first run._

1. Review the output, you have a few choices
   - in your terminal only, see option `--dry-run`
   - or as a commit with a `CHANGELOG.md` and `package.json` update. This is the default option `--commit`
   - or as updated files `CHANGELOG.md` and `package.json`, if you opted to update without a commit, see option `--commit=false`
1. That's it!

## Credit
This project is influenced by the now deprecated project [Standard Version](https://github.com/conventional-changelog/standard-version). 

The primary differences between [Standard Version](https://github.com/conventional-changelog/standard-version) and this project
are the weighting assigned to commit message types and a fraction of the features.

## Contributing
Contributing? Guidelines can be found here [CONTRIBUTING.md](./CONTRIBUTING.md).
