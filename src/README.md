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
    * [~getCurrentVersion(options)](#module_Commands..getCurrentVersion) ⇒ <code>\*</code>
    * [~getReleaseCommit(options)](#module_Commands..getReleaseCommit) ⇒ <code>string</code>
    * [~getRemoteUrls(options)](#module_Commands..getRemoteUrls) ⇒ <code>Object</code>
    * [~getGit(settings)](#module_Commands..getGit) ⇒ <code>Array</code>
        * [~getGitLog(commitHash, searchFilter)](#module_Commands..getGit..getGitLog) ⇒ <code>string</code>
    * [~getOverrideVersion(options)](#module_Commands..getOverrideVersion) ⇒ <code>Object</code>
    * [~getVersion(versionBump, settings)](#module_Commands..getVersion) ⇒ <code>string</code>

<a name="module_Commands..runCmd"></a>

### Commands~runCmd(cmd, settings) ⇒ <code>string</code>
Execute a command

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>cmd</td><td><code>string</code></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.errorMessage</td><td><code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..commitFiles"></a>

### Commands~commitFiles(version, options) ⇒ <code>string</code>
Optionally commit CHANGELOG.md, package.json

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>version</td><td><code>*</code> | <code>string</code></td>
    </tr><tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.changelogPath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.releaseTypeScope</td><td><code>Array.&lt;string&gt;</code> | <code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getCurrentVersion"></a>

### Commands~getCurrentVersion(options) ⇒ <code>\*</code>
Get current package.json version

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getReleaseCommit"></a>

### Commands~getReleaseCommit(options) ⇒ <code>string</code>
Get last release commit hash

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.releaseTypeScope</td><td><code>Array.&lt;string&gt;</code> | <code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getRemoteUrls"></a>

### Commands~getRemoteUrls(options) ⇒ <code>Object</code>
Get the repositories remote

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.commitPath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.comparePath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.prPath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.remoteUrl</td><td><code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getGit"></a>

### Commands~getGit(settings) ⇒ <code>Array</code>
Return output for a range of commits from a hash

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
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
    <td>settings.getReleaseCommit</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.breakingChangeMessageFilter</td><td><code>Array</code></td>
    </tr><tr>
    <td>settings.breakingChangeScopeTypeFilter</td><td><code>Array</code></td>
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
Determine if override version is valid semver and return

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.overrideVersion</td><td><code>string</code> | <code>*</code></td>
    </tr>  </tbody>
</table>

<a name="module_Commands..getVersion"></a>

### Commands~getVersion(versionBump, settings) ⇒ <code>string</code>
Set package.json version using npm version

**Kind**: inner method of [<code>Commands</code>](#module_Commands)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>versionBump</td><td><code>&#x27;major&#x27;</code> | <code>&#x27;minor&#x27;</code> | <code>&#x27;patch&#x27;</code> | <code>*</code></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.getCurrentVersion</td><td><code>function</code></td>
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
Update CHANGELOG.md with commit output.

**Kind**: inner method of [<code>Files</code>](#module_Files)  
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
    <td>params.packageVersion</td><td><code>*</code> | <code>string</code></td><td></td>
    </tr><tr>
    <td>options</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>options.changelogPath</td><td><code>string</code></td><td></td>
    </tr><tr>
    <td>options.date</td><td><code>string</code></td><td></td>
    </tr><tr>
    <td>options.isBasic</td><td><code>boolean</code></td><td></td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td><td></td>
    </tr><tr>
    <td>options.releaseDescription</td><td><code>string</code></td><td></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>settings.breakingChangeReleaseDesc</td><td><code>string</code></td><td></td>
    </tr><tr>
    <td>settings.fallbackPackageVersion</td><td><code>string</code></td><td></td>
    </tr><tr>
    <td>settings.getComparisonCommitHashes</td><td><code>function</code></td><td></td>
    </tr><tr>
    <td>settings.getRemoteUrls</td><td><code>function</code></td><td></td>
    </tr><tr>
    <td>settings.headerMd</td><td><code>string</code></td><td></td>
    </tr>  </tbody>
</table>

<a name="module_Files..updatePackage"></a>

### Files~updatePackage(versionBump, options) ⇒ <code>string</code>
Apply bump and update package.json

**Kind**: inner method of [<code>Files</code>](#module_Files)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>versionBump</td><td><code>&#x27;major&#x27;</code> | <code>&#x27;minor&#x27;</code> | <code>&#x27;patch&#x27;</code> | <code>*</code></td>
    </tr><tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td>
    </tr><tr>
    <td>options.packagePath</td><td><code>string</code></td>
    </tr>  </tbody>
</table>

<a name="module_Global"></a>

## Global

* [Global](#module_Global)
    * [~color](#module_Global..color) : <code>Object</code>
    * [~generalCommitType](#module_Global..generalCommitType) : <code>Object</code>
    * [~conventionalCommitType](#module_Global..conventionalCommitType) : <code>Object</code>
    * [~OPTIONS](#module_Global..OPTIONS) : <code>Object</code>

<a name="module_Global..color"></a>

### Global~color : <code>Object</code>
Console output colors

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
<a name="module_Global..generalCommitType"></a>

### Global~generalCommitType : <code>Object</code>
Custom catch all commit type for use with the "isAllowNonConventionalCommits"

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
<a name="module_Global..conventionalCommitType"></a>

### Global~conventionalCommitType : <code>Object</code>
Conventional commit types, expose "key" as "value"

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
<a name="module_Global..OPTIONS"></a>

### Global~OPTIONS : <code>Object</code>
Global options/settings. One time _set, then freeze.

**Kind**: inner constant of [<code>Global</code>](#module_Global)  
<a name="module_Init"></a>

## Init
Start `changelog` updates

<a name="module_Init..commitChangelog"></a>

### Init~commitChangelog(options, settings) ⇒ <code>Object</code>
Set changelog and package.

**Kind**: inner method of [<code>Init</code>](#module_Init)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.changelogFile</td><td><code>string</code></td>
    </tr><tr>
    <td>options.contextPath</td><td><code>string</code></td>
    </tr><tr>
    <td>options.isCommit</td><td><code>boolean</code></td>
    </tr><tr>
    <td>options.isDryRun</td><td><code>boolean</code></td>
    </tr><tr>
    <td>options.overrideVersion</td><td><code>string</code></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.commitFiles</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.getOverrideVersion</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.getVersion</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.parseCommits</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.semverBump</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.updateChangelog</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.updatePackage</td><td><code>function</code></td>
    </tr>  </tbody>
</table>

<a name="module_Parse"></a>

## Parse
Parse and format commit messages


* [Parse](#module_Parse)
    * [~getCommitType(options)](#module_Parse..getCommitType) ⇒ <code>Object</code>
    * [~getComparisonCommitHashes(settings)](#module_Parse..getComparisonCommitHashes) ⇒ <code>Object</code>
    * [~parseCommitMessage(params, settings)](#module_Parse..parseCommitMessage) ⇒ <code>Object</code> \| <code>Object</code>
    * [~formatChangelogMessage(params, options, settings)](#module_Parse..formatChangelogMessage) ⇒ <code>string</code>
    * [~parseCommits(settings)](#module_Parse..parseCommits) ⇒ <code>Object</code>
    * [~semverBump(params, options, settings)](#module_Parse..semverBump) ⇒ <code>Object</code>

<a name="module_Parse..getCommitType"></a>

### Parse~getCommitType(options) ⇒ <code>Object</code>
Aggregate conventional commit types. Optionally allow non-conventional commit types.

**Kind**: inner method of [<code>Parse</code>](#module_Parse)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>options</td><td><code>object</code></td>
    </tr><tr>
    <td>options.isAllowNonConventionalCommits</td><td><code>boolean</code></td>
    </tr>  </tbody>
</table>

<a name="module_Parse..getComparisonCommitHashes"></a>

### Parse~getComparisonCommitHashes(settings) ⇒ <code>Object</code>
In the current context, get the first and last commits based on the last release commit message.

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
    <td>settings.getGit</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.getReleaseCommit</td><td><code>function</code></td>
    </tr>  </tbody>
</table>

<a name="module_Parse..parseCommitMessage"></a>

### Parse~parseCommitMessage(params, settings) ⇒ <code>Object</code> \| <code>Object</code>
Parse a commit message

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
    <td>params.message</td><td><code>string</code></td>
    </tr><tr>
    <td>params.isBreaking</td><td><code>boolean</code></td>
    </tr><tr>
    <td>settings</td><td><code>object</code></td>
    </tr><tr>
    <td>settings.getCommitType</td><td><code>function</code></td>
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
    <td>settings.getRemoteUrls</td><td><code>function</code></td>
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
    <td>settings.getCommitType</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.getGit</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.formatChangelogMessage</td><td><code>function</code></td>
    </tr><tr>
    <td>settings.parseCommitMessage</td><td><code>function</code></td>
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
    <td>settings.getCommitType</td><td><code>function</code></td><td></td>
    </tr>  </tbody>
</table>

