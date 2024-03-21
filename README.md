# Changelog Light
[![Build Status](https://github.com/cdcabrera/changelog-light/workflows/Build/badge.svg?branch=main)](https://github.com/cdcabrera/changelog-light/actions?query=workflow%3ABuild)
[![coverage](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fcdcabrera.github.io%2Fchangelog-light%2Fsummary.json&query=%24.coverage.pct&suffix=%25&label=coverage&color=9F3FC0)](https://cdcabrera.github.io/changelog-light/)
[![License](https://img.shields.io/github/license/cdcabrera/changelog-light.svg)](https://github.com/cdcabrera/changelog-light/blob/main/LICENSE)

Generate a changelog with [conventional commit types](https://www.conventionalcommits.org).

## Requirements
The basic requirements:
 * [NodeJS version 16+](https://nodejs.org/)
 * Optionally your system could be running
    - [Yarn](https://yarnpkg.com), otherwise NPM should be adequate.
 

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
    -b, --basic            Keep updates to [CHANGELOG.md] basic, skip all markdown
                           link syntax                  [boolean] [default: false]
    -c, --commit           Commit [CHANGELOG.md] and package.json with a release
                           commit                        [boolean] [default: true]
    -d, --date             [CHANGELOG.md] release date in the form of a valid date
                           string. Uses system new Date([your date])
                                    [string] [default: "2024-03-21T13:20:45.593Z"]
    -n, --non-cc           Allow non-conventional commits to apply a semver weight
                           and appear in [CHANGELOG.md] under a general type
                           description.                 [boolean] [default: false]
    -o, --override         Use a version you define.                      [string]
    -r, --dry-run          Generate [CHANGELOG.md] sample output
                                                        [boolean] [default: false]
        --branch           The local branch used to run `$ git log [branch]`
                           against, defaults to HEAD, or just `$ git log`
                                                        [string] [default: "HEAD"]
        --changelog        Changelog output filename and relative path
                                              [string] [default: "./CHANGELOG.md"]
        --commit-path      [CHANGELOG.md] path used for commits. This will be
                           "joined" with "link-url". Defaults to the commits path
                           for GitHub.               [string] [default: "commit/"]
        --compare-path     [CHANGELOG.md] path used for version comparison. This
                           will be "joined" with "link-url". Defaults to the
                           comparison path for GitHub.
                                                    [string] [default: "compare/"]
        --link-url         Url override for updating all [CHANGELOG.md] base urls.
                           This should start with "http". Attempts to use "$ git
                           remote get-url origin", if it starts with "http"
                                                                          [string]
        --lock-file        Lock file read and relative path. Will attempt to
                           determine "package-lock.json" or "yarn.lock" use and
                           updates during release. Use if a "lock-like" file
                           outside of "package" and "yarn" lock is customized or
                           used.                                          [string]
        --package          package.json read, output and relative path
                                              [string] [default: "./package.json"]
        --pr-path          [CHANGELOG.md] path used for PRs/MRs. This will be
                           "joined" with "link-url". Defaults to the PR path for
                           GitHub.                     [string] [default: "pull/"]
        --release-message  A list of prefix release scope commit messages. First
                           list item is the new commit message prefix, the second
                           list item searches for the prior release message prefix
                           for range. [write new, search old]
                                               [array] [default: "chore(release)"]
        --release-desc     Add a description under the release version header
                           copy. Example, "⚠ BREAKING CHANGES"            [string]
    -h, --help             Show help                                     [boolean]
    -v, --version          Show version number                           [boolean]
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

##### Common scenario
I want to run `changelog-light` from a different branch in the same repository, or from a "forked" repository?

To get your release commit setup from a different branch...
1. Make sure your working branch is synced and updated with the branch you want to merge into
1. Run and confirm the hashes align in the terminal with...
   ```
   $ changelog --dry-run
   ```
1. Run the release script
   ```
   $ changelog
   ```
1. Setup your pull/merge request, there should be a single commit difference... your release commit.
   > If there is more than one commit difference then you incorrectly synced your branch. Confer online, or with your team, for the git commands needed.
1. Merge, or rebase, your commit (depending on your approval process) into the target branch 
   > The git hash associated with the release commit **IS NOT USED** until the next time you run `changelog-light`. Having it updated when you merge, or rebase, your commit makes no difference in your markdown.

To get your release commit setup from a "forked" repository...
1. Make sure your working branch is synced and updated with the remote branch you want to merge into
1. Run and confirm the hashes AND LINKS with the remote align in the terminal with...
   ```
   $ changelog --dry-run --link-url https://github.com/[the remote url].git
   ```
1. Run the release script
   ```
   $ changelog --link-url https://github.com/[the remote url].git
   ```
1. Setup your pull/merge request, there should be a single commit difference... your release commit.
   > If there is more than one commit difference then you incorrectly synced your branch. Confer online, or with your team, for the git commands needed.
1. Merge, or rebase, your commit (depending on your approval process) into the target branch
   > The git hash associated with the release commit **IS NOT USED** until the next time you run `changelog-light`. Having it updated when you merge, or rebase, your commit makes no difference in your markdown.


## Credit
This project is influenced by the deprecated project [Standard Version](https://github.com/conventional-changelog/standard-version). 

The primary differences between [Standard Version](https://github.com/conventional-changelog/standard-version) and this project
are the weighting assigned to commit message types and a fraction of the features.

## Contributing
Contributing? Guidelines can be found here [CONTRIBUTING.md](./CONTRIBUTING.md).
