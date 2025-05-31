## Modules

<dl>
<dt><a href="#module_Commands">Commands</a></dt>
<dd><p>Functions for <code>git</code>, <code>package.json</code> version, and more</p>
</dd>
<dt><a href="#module_Files">Files</a></dt>
<dd><p>Update <code>changelog</code> and <code>package.json</code></p>
</dd>
<dt><a href="#module_Global">Global</a></dt>
<dd></dd>
<dt><a href="#module_Init">Init</a></dt>
<dd><p>Start <code>changelog</code> updates</p>
</dd>
<dt><a href="#module_Parse">Parse</a></dt>
<dd><p>Parse and format commit messages</p>
</dd>
</dl>

<a name="module_Commands"></a>

## Commands
Functions for `git`, `package.json` version, and more


* [Commands](#module_Commands)
    * [~runCmd(cmd, settings)](#module_Commands..runCmd) ⇒ <code>string</code>
    * [~commitFiles(version, options)](#module_Commands..commitFiles) ⇒ <code>string</code>
    * [~getCurrentVersion(options)](#module_Commands..getCurrentVersion) ⇒ <code>string</code>
    * [~getReleaseCommit(options)](#module_Commands..getReleaseCommit) ⇒ <code>string</code>
    * [~getLinkUrls(options)](#module_Commands..getLinkUrls) ⇒ <code>Object</code>
    * [~getGit(options, settings)](#module_Commands..getGit) ⇒ <code>Array.&lt;{commit: string, isBreaking: boolean}&gt;</code>
        * [~getGitLog(commitHash, searchFilter)](#module_Commands..getGit..getGitLog) ⇒ <code>string</code>
    * [~getOverrideVersion(options)](#module_Commands..getOverrideVersion) ⇒ <code>Object</code>
    * [~getVersion(versionBump, settings)](#module_Commands..getVersion) ⇒ <code>Object</code>

<a name="module_Commands..runCmd"></a>

### Commands~runCmd(cmd, settings) ⇒ <code>string</code>
Executes a shell command and handles any errors that occur.

This function wraps Node's execSync to provide consistent error handling
and output formatting for all command executions in the application.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>string</code> - The command output as a string  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>cmd</td><td><code>string</code></td><td><p>The shell command to execute</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>settings.errorMessage</td><td><code>string</code></td><td><p>Error message template (use {0} for the error message)</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..commitFiles"></a>

### Commands~commitFiles(version, options) ⇒ <code>string</code>
Commits changes to CHANGELOG.md, package.json, and optionally package-lock.json.

This function stages the specified files and creates a commit with a message
that includes the release type and version. It handles both string and array
formats for the release type scope.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>string</code> - The output from the git commit command  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>version</td><td><code>string</code></td><td><p>The version being released</p>
</td>
    </tr><tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.changelogPath</td><td><code>string</code></td><td><p>Path to the changelog file</p>
</td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td><td><p>Path to the package.json file</p>
</td>
    </tr><tr>
    <td>options.lockFilePath</td><td><code>string</code></td><td><p>Optional path to the package-lock.json file</p>
</td>
    </tr><tr>
    <td>options.releaseTypeScope</td><td><code>Array.&lt;string&gt;</code> | <code>string</code></td><td><p>Release type for the commit message (e.g., &quot;chore&quot;, &quot;feat&quot;)</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getCurrentVersion"></a>

### Commands~getCurrentVersion(options) ⇒ <code>string</code>
Retrieves the current version from package.json.

This function reads the package.json file at the specified path
and returns the version field value.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>string</code> - The current version string from package.json  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td><td><p>Path to the package.json file</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getReleaseCommit"></a>

### Commands~getReleaseCommit(options) ⇒ <code>string</code>
Retrieves the hash of the last release commit.

This function searches the git history for commits matching the specified
release type scope pattern and returns the most recent one. It can be
restricted to a specific branch if provided.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>string</code> - The hash and message of the last release commit  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.releaseTypeScope</td><td><code>Array.&lt;string&gt;</code> | <code>string</code></td><td><p>Pattern to match in commit messages for identifying releases</p>
</td>
    </tr><tr>
    <td>options.releaseBranch</td><td><code>string</code> | <code>undefined</code></td><td><p>Optional branch to restrict the search to</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getLinkUrls"></a>

### Commands~getLinkUrls(options) ⇒ <code>Object</code>
Generates URLs for linking to commits, comparisons, and pull requests in the changelog.

This function takes the repository URL (either provided or fetched from git)
and constructs various URLs for linking to different resources in the changelog.
It handles formatting and ensures all URLs end with a trailing slash.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.commitPath</td><td><code>string</code></td><td><p>Path segment for commit URLs (e.g., &quot;commit&quot;)</p>
</td>
    </tr><tr>
    <td>options.comparePath</td><td><code>string</code></td><td><p>Path segment for comparison URLs (e.g., &quot;compare&quot;)</p>
</td>
    </tr><tr>
    <td>options.linkUrl</td><td><code>string</code></td><td><p>Optional explicit repository URL (falls back to git remote)</p>
</td>
    </tr><tr>
    <td>options.prPath</td><td><code>string</code></td><td><p>Path segment for pull request URLs (e.g., &quot;pull&quot;)</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getGit"></a>

### Commands~getGit(options, settings) ⇒ <code>Array.&lt;{commit: string, isBreaking: boolean}&gt;</code>
Retrieves and processes git commits since the last release.

This function gets all commits since the last release and identifies breaking changes
by examining commit messages for specific patterns. It supports two types of breaking
change indicators: message body syntax and scope type syntax.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>Array.&lt;{commit: string, isBreaking: boolean}&gt;</code> - Array of commit objects with hash and breaking change flag  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.releaseBranch</td><td><code>string</code> | <code>undefined</code></td><td><p>Optional branch to restrict the search to</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Function and value overrides for customization</p>
</td>
    </tr><tr>
    <td>settings.getReleaseCommit</td><td><code>getReleaseCommit</code></td><td><p>Function to get the last release commit</p>
</td>
    </tr><tr>
    <td>settings.breakingChangeMessageFilter</td><td><code>Array.&lt;string&gt;</code></td><td><p>Patterns to identify breaking changes in commit messages</p>
</td>
    </tr><tr>
    <td>settings.breakingChangeScopeTypeFilter</td><td><code>Array.&lt;string&gt;</code></td><td><p>Patterns to identify breaking changes in commit scope/type</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getGit..getGitLog"></a>

#### getGit~getGitLog(commitHash, searchFilter) ⇒ <code>string</code>
Build git log command

- Filter a range of commits since the last release if it exists
- Filter breaking change commits with message body syntax
- Filter breaking change commits with scope type syntax. And apply an additional check to help filter out
    commits with message body scope type syntax used unintentionally.

**Kind**: inner method of [<code>getGit</code>](#module_Commands..getGit)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>commitHash</td><td><code>string</code></td>
    </tr><tr>
    <td>searchFilter</td><td><code>Array</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getOverrideVersion"></a>

### Commands~getOverrideVersion(options) ⇒ <code>Object</code>
Validates and processes an override version string.

This function checks if the provided override version is a valid semantic version
using semver's clean function. If valid, it returns both the original version string
and the cleaned version. If invalid, it logs an error and returns undefined values.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>Object</code> - The processed version information  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.overrideVersion</td><td><code>string</code></td><td><p>The version string to validate and process</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getVersion"></a>

### Commands~getVersion(versionBump, settings) ⇒ <code>Object</code>
Calculates a new version based on the current version and a semantic version bump.

This function retrieves the current version from package.json and applies the specified
semantic version bump (major, minor, patch) using semver's increment function.
It returns both the formatted version string and a cleaned version string.

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
**Returns**: <code>Object</code> - The new version information  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>versionBump</td><td><code>&#x27;major&#x27;</code> | <code>&#x27;minor&#x27;</code> | <code>&#x27;patch&#x27;</code> | <code>string</code></td><td><p>Type of semantic version bump to apply</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Function overrides for customization</p>
</td>
    </tr><tr>
    <td>settings.getCurrentVersion</td><td><code>getCurrentVersion</code></td><td><p>Function to get the current version from package.json</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Files"></a>

## Files
Update `changelog` and `package.json`


* [Files](#module_Files)
    * [~updateChangelog(params, options, settings)](#module_Files..updateChangelog) ⇒ <code>string</code>
    * [~updatePackage(versionBump, options)](#module_Files..updatePackage) ⇒ <code>string</code>

<a name="module_Files..updateChangelog"></a>

### Files~updateChangelog(params, options, settings) ⇒ <code>string</code>
Updates the CHANGELOG.md file with formatted commit messages.

This function reads the existing changelog file (if it exists), adds a new section with
the current version and formatted commit messages, and writes the updated content back to the file.

Note: Future enhancement - syntax for the comparison can include the use of caret.
Review using caret vs a release commit for determining range.

**Kind**: inner method of [<code>Files</code>](#module_Files)  
**Returns**: <code>string</code> - The updated changelog content  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>params</td><td><code>object</code></td><td><p>Parameters for changelog generation</p>
</td>
    </tr><tr>
    <td>params.commits</td><td><code>Object</code></td><td><p>Parsed commit messages grouped by type</p>
</td>
    </tr><tr>
    <td>params.isBreakingChanges</td><td><code>boolean</code></td><td><p>Whether breaking changes are included (applies a &#39;major&#39; weight if true)</p>
</td>
    </tr><tr>
    <td>params.packageVersion</td><td><code>string</code></td><td><p>Version to display in the changelog</p>
</td>
    </tr><tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.changelogPath</td><td><code>string</code></td><td><p>Path to the changelog file</p>
</td>
    </tr><tr>
    <td>options.date</td><td><code>string</code></td><td><p>Date to use for the release (defaults to current date)</p>
</td>
    </tr><tr>
    <td>options.isBasic</td><td><code>boolean</code></td><td><p>Whether to use basic formatting without links</p>
</td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td><td><p>Whether to perform a dry run without writing files</p>
</td>
    </tr><tr>
    <td>options.releaseDescription</td><td><code>string</code></td><td><p>Optional description for the release</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Function and value overrides for customization</p>
</td>
    </tr><tr>
    <td>settings.breakingChangeReleaseDesc</td><td><code>string</code></td><td><p>Text to display for breaking changes</p>
</td>
    </tr><tr>
    <td>settings.fallbackPackageVersion</td><td><code>string</code></td><td><p>Fallback version if packageVersion is not provided</p>
</td>
    </tr><tr>
    <td>settings.getComparisonCommitHashes</td><td><code>getComparisonCommitHashes</code></td><td><p>Function to get commit hashes for comparison links</p>
</td>
    </tr><tr>
    <td>settings.getLinkUrls</td><td><code>getLinkUrls</code></td><td><p>Function to get URLs for links</p>
</td>
    </tr><tr>
    <td>settings.headerMd</td><td><code>string</code></td><td><p>Markdown header for the changelog file</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Files..updatePackage"></a>

### Files~updatePackage(versionBump, options) ⇒ <code>string</code>
Updates the package.json file with a new version based on the specified semantic version bump.

This function uses npm's version command to update the version field in package.json
without creating a git tag. It can perform a dry run to preview the changes without
modifying the file.

**Kind**: inner method of [<code>Files</code>](#module_Files)  
**Returns**: <code>string</code> - A message indicating the version bump that was applied  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>versionBump</td><td><code>&#x27;major&#x27;</code> | <code>&#x27;minor&#x27;</code> | <code>&#x27;patch&#x27;</code> | <code>string</code></td><td><p>Type of semantic version bump or specific version</p>
</td>
    </tr><tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td><td><p>Whether to perform a dry run without writing files</p>
</td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td><td><p>Path to the package.json file</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Global"></a>

## Global

* [Global](#module_Global)
    * [~color](#module_Global..color) : <code>object</code>
    * [~generalCommitType](#module_Global..generalCommitType) : <code>object</code>
    * [~conventionalCommitType](#module_Global..conventionalCommitType) : <code>object</code>
    * [~OPTIONS](#module_Global..OPTIONS) : <code>object</code>

<a name="module_Global..color"></a>

### Global~color : <code>object</code>
ANSI color codes for console output formatting.

This object provides a set of color constants that can be used to format
console output text. Each property is an ANSI escape sequence string.

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>BLACK</td><td><code>string</code></td><td><p>Black text color code</p>
</td>
    </tr><tr>
    <td>BLUE</td><td><code>string</code></td><td><p>Blue text color code</p>
</td>
    </tr><tr>
    <td>CYAN</td><td><code>string</code></td><td><p>Cyan text color code</p>
</td>
    </tr><tr>
    <td>GREEN</td><td><code>string</code></td><td><p>Green text color code</p>
</td>
    </tr><tr>
    <td>GREY</td><td><code>string</code></td><td><p>Grey text color code</p>
</td>
    </tr><tr>
    <td>MAGENTA</td><td><code>string</code></td><td><p>Magenta text color code</p>
</td>
    </tr><tr>
    <td>NOCOLOR</td><td><code>string</code></td><td><p>Reset color code (returns to default)</p>
</td>
    </tr><tr>
    <td>RED</td><td><code>string</code></td><td><p>Red text color code</p>
</td>
    </tr><tr>
    <td>WHITE</td><td><code>string</code></td><td><p>White text color code</p>
</td>
    </tr><tr>
    <td>YELLOW</td><td><code>string</code></td><td><p>Yellow text color code</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Global..generalCommitType"></a>

### Global~generalCommitType : <code>object</code>
Fallback commit type for non-conventional commits.

This object defines a generic commit type that can be used to categorize commits
that don't follow the conventional commit format. It's used when the
"isAllowNonConventionalCommits" option is enabled.

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>general</td><td><code>object</code></td><td><p>General commit type</p>
</td>
    </tr><tr>
    <td>general.description</td><td><code>string</code></td><td><p>Description of the general commit type</p>
</td>
    </tr><tr>
    <td>general.title</td><td><code>string</code></td><td><p>Display title for the general commit type</p>
</td>
    </tr><tr>
    <td>general.value</td><td><code>string</code></td><td><p>Value used for identifying general commits</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Global..conventionalCommitType"></a>

### Global~conventionalCommitType : <code>object</code>
Standard conventional commit types with enhanced structure.

This object transforms the conventional commit types from the 'conventional-commit-types'
package by adding the key as a 'value' property to each type object. This makes it
easier to reference the type key when processing commits.

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>feat</td><td><code>object</code></td><td><p>Feature commit type</p>
</td>
    </tr><tr>
    <td>feat.description</td><td><code>string</code></td><td><p>Description of feature commits</p>
</td>
    </tr><tr>
    <td>feat.title</td><td><code>string</code></td><td><p>Display title for feature commits</p>
</td>
    </tr><tr>
    <td>feat.value</td><td><code>string</code></td><td><p>Value used for identifying feature commits (equals &quot;feat&quot;)</p>
</td>
    </tr><tr>
    <td>fix</td><td><code>object</code></td><td><p>Bug fix commit type</p>
</td>
    </tr><tr>
    <td>fix.description</td><td><code>string</code></td><td><p>Description of bug fix commits</p>
</td>
    </tr><tr>
    <td>fix.title</td><td><code>string</code></td><td><p>Display title for bug fix commits</p>
</td>
    </tr><tr>
    <td>fix.value</td><td><code>string</code></td><td><p>Value used for identifying bug fix commits (equals &quot;fix&quot;)</p>
</td>
    </tr><tr>
    <td>chore</td><td><code>object</code></td><td><p>Chore commit type</p>
</td>
    </tr><tr>
    <td>chore.description</td><td><code>string</code></td><td><p>Description of chore commits</p>
</td>
    </tr><tr>
    <td>chore.title</td><td><code>string</code></td><td><p>Display title for chore commits</p>
</td>
    </tr><tr>
    <td>chore.value</td><td><code>string</code></td><td><p>Value used for identifying chore commits (equals &quot;chore&quot;)</p>
</td>
    </tr><tr>
    <td>[other]</td><td><code>object</code></td><td><p>Other conventional commit types as defined in &#39;conventional-commit-types&#39;</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Global..OPTIONS"></a>

### Global~OPTIONS : <code>object</code>
Global configuration options for the changelog generator.

This object stores all configuration options used throughout the application.
It has a special '_set' property that allows for one-time initialization of
options, after which the object is frozen to prevent further modifications.

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>contextPath</td><td><code>string</code></td><td><p>Base directory path for file operations</p>
</td>
    </tr><tr>
    <td>_set</td><td><code>function</code></td><td><p>Setter function for initializing options (used once then removed)</p>
</td>
    </tr><tr>
    <td>[changelogFile]</td><td><code>string</code></td><td><p>Path to the changelog file (set during initialization)</p>
</td>
    </tr><tr>
    <td>[packagePath]</td><td><code>string</code></td><td><p>Path to the package.json file (set during initialization)</p>
</td>
    </tr><tr>
    <td>[isDryRun]</td><td><code>boolean</code></td><td><p>Whether to perform a dry run without writing files (set during initialization)</p>
</td>
    </tr><tr>
    <td>[isCommit]</td><td><code>boolean</code></td><td><p>Whether to commit changes to git (set during initialization)</p>
</td>
    </tr><tr>
    <td>[overrideVersion]</td><td><code>string</code></td><td><p>Optional version to use instead of calculated version (set during initialization)</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Init"></a>

## Init
Start `changelog` updates

<a name="module_Init..commitChangelog"></a>

### Init~commitChangelog(options, settings) ⇒ <code>Object</code>
Updates changelog and package.json files based on commit history.

This function analyzes commit messages, determines the appropriate semantic version bump,
updates the changelog with formatted commit messages, and optionally commits the changes.

**Kind**: inner method of [<code>Init</code>](#module_Init)  
**Returns**: <code>Object</code> - Result of the changelog update  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options for the changelog update</p>
</td>
    </tr><tr>
    <td>options.changelogFile</td><td><code>string</code></td><td><p>Path to the changelog file</p>
</td>
    </tr><tr>
    <td>options.contextPath</td><td><code>string</code></td><td><p>Base directory path for operations</p>
</td>
    </tr><tr>
    <td>options.isCommit</td><td><code>boolean</code></td><td><p>Whether to commit changes to git</p>
</td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td><td><p>Whether to perform a dry run without writing files</p>
</td>
    </tr><tr>
    <td>options.overrideVersion</td><td><code>string</code></td><td><p>Optional version to use instead of calculated version</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Function overrides for testing or customization</p>
</td>
    </tr><tr>
    <td>settings.commitFiles</td><td><code>commitFiles</code></td><td><p>Function to commit changes to git</p>
</td>
    </tr><tr>
    <td>settings.getOverrideVersion</td><td><code>getOverrideVersion</code></td><td><p>Function to get the override version</p>
</td>
    </tr><tr>
    <td>settings.getVersion</td><td><code>getVersion</code></td><td><p>Function to calculate the new version</p>
</td>
    </tr><tr>
    <td>settings.parseCommits</td><td><code>parseCommits</code></td><td><p>Function to parse commit messages</p>
</td>
    </tr><tr>
    <td>settings.semverBump</td><td><code>semverBump</code></td><td><p>Function to determine semantic version bump</p>
</td>
    </tr><tr>
    <td>settings.updateChangelog</td><td><code>updateChangelog</code></td><td><p>Function to update the changelog file</p>
</td>
    </tr><tr>
    <td>settings.updatePackage</td><td><code>updatePackage</code></td><td><p>Function to update the package.json file</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Parse"></a>

## Parse
Parse and format commit messages


* [Parse](#module_Parse)
    * [~getCommitType(options)](#module_Parse..getCommitType) ⇒ <code>Object</code>
    * [~getComparisonCommitHashes(settings)](#module_Parse..getComparisonCommitHashes) ⇒ <code>Object</code>
    * [~parseCommitMessage(params, settings)](#module_Parse..parseCommitMessage) ⇒ <code>Object</code>
    * [~formatChangelogMessage(params, options, settings)](#module_Parse..formatChangelogMessage) ⇒ <code>string</code>
    * [~parseCommits(settings)](#module_Parse..parseCommits) ⇒ <code>Object</code>
    * [~semverBump(params, options, settings)](#module_Parse..semverBump) ⇒ <code>Object</code>

<a name="module_Parse..getCommitType"></a>

### Parse~getCommitType(options) ⇒ <code>Object</code>
Retrieves and combines conventional commit types with optional support for non-conventional commits.

This function returns the standard conventional commit types from the 'conventional-commit-types'
package and optionally includes a general catch-all type for non-conventional commits.
The result is used to categorize and process commit messages throughout the application.

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
**Returns**: <code>Object</code> - Combined commit types  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td><td><p>Configuration options</p>
</td>
    </tr><tr>
    <td>options.isAllowNonConventionalCommits</td><td><code>boolean</code></td><td><p>Whether to include the general commit type for non-conventional commits</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Parse..getComparisonCommitHashes"></a>

### Parse~getComparisonCommitHashes(settings) ⇒ <code>Object</code>
Retrieves the commit hashes for generating comparison links in the changelog.

This function finds the hash of the last release commit and the most recent commit
in the current branch. These hashes are used to create comparison links in the
changelog that show all changes between releases.

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
**Returns**: <code>Object</code> - Commit hashes for comparison  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>settings</td><td><code>object</code></td><td><p>Function overrides for customization</p>
</td>
    </tr><tr>
    <td>settings.getGit</td><td><code>getGit</code></td><td><p>Function to get all commits</p>
</td>
    </tr><tr>
    <td>settings.getReleaseCommit</td><td><code>getReleaseCommit</code></td><td><p>Function to get the last release commit</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Parse..parseCommitMessage"></a>

### Parse~parseCommitMessage(params, settings) ⇒ <code>Object</code>
Parses a git commit message into structured components.

This function extracts various parts of a commit message including the hash,
type, scope, description, and pull request number. It handles both conventional
commit format and non-conventional formats, falling back to a general type
for commits that don't follow the conventional format.

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
**Returns**: <code>Object</code> - Parsed commit message components  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>params</td><td><code>object</code></td><td><p>Parameters for parsing</p>
</td>
    </tr><tr>
    <td>params.message</td><td><code>string</code></td><td><p>The raw commit message to parse</p>
</td>
    </tr><tr>
    <td>params.isBreaking</td><td><code>boolean</code></td><td><p>Whether the commit contains breaking changes</p>
</td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td><p>Function overrides for customization</p>
</td>
    </tr><tr>
    <td>settings.getCommitType</td><td><code>getCommitType</code></td><td><p>Function to get commit types</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_Parse..formatChangelogMessage"></a>

### Parse~formatChangelogMessage(params, options, settings) ⇒ <code>string</code>
Format commit message for CHANGELOG.md

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>params</td><td><code>object</code></td>
    </tr><tr>
    <td>params.scope</td><td><code>string</code></td>
    </tr><tr>
    <td>params.description</td><td><code>string</code></td>
    </tr><tr>
    <td>params.prNumber</td><td><code>string</code> | <code>number</code> | <code>*</code></td>
    </tr><tr>
    <td>params.hash</td><td><code>string</code></td>
    </tr><tr>
    <td>params.isBreaking</td><td><code>boolean</code></td>
    </tr><tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.isBasic</td><td><code>boolean</code></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.getLinkUrls</td><td><code>getLinkUrls</code></td>
    </tr>  </tbody>
</table>

<a name="module_Parse..parseCommits"></a>

### Parse~parseCommits(settings) ⇒ <code>Object</code>
Return an object of commit groupings based on "conventional-commit-types"

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.getCommitType</td><td><code>getCommitType</code></td>
    </tr><tr>
    <td>settings.getGit</td><td><code>getGit</code></td>
    </tr><tr>
    <td>settings.formatChangelogMessage</td><td><code>formatChangelogMessage</code></td>
    </tr><tr>
    <td>settings.parseCommitMessage</td><td><code>parseCommitMessage</code></td>
    </tr>  </tbody>
</table>

<a name="module_Parse..semverBump"></a>

### Parse~semverBump(params, options, settings) ⇒ <code>Object</code>
Apply a clear weight to commit types, determine MAJOR, MINOR, PATCH

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>params</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>params.commits</td><td><code>Object</code></td><td></td>
    </tr><tr>
    <td>params.isBreakingChanges</td><td><code>boolean</code></td><td><p>Apply a &#39;major&#39; weight if true</p>
</td>
    </tr><tr>
    <td>options</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>options.isOverrideVersion</td><td><code>boolean</code></td><td></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>settings.getCommitType</td><td><code>getCommitType</code></td><td></td>
    </tr>  </tbody>
</table>

