# React Global Local State

[![NPM badge](https://img.shields.io/npm/v/react-global-local-state)](https://www.npmjs.com/package/react-global-local-state)
[![Dependabot badge](https://badgen.net/github/dependabot/iamogbz/react-global-local-state/?icon=dependabot)](https://app.dependabot.com)
[![Dependencies](https://img.shields.io/librariesio/github/iamogbz/react-global-local-state)](https://libraries.io/github/iamogbz/react-global-local-state)
[![Build Status](https://github.com/iamogbz/react-global-local-state/workflows/Build/badge.svg)](https://github.com/iamogbz/react-global-local-state/actions)
[![Coverage Status](https://coveralls.io/repos/github/iamogbz/react-global-local-state/badge.svg?branch=refs/heads/main)](https://coveralls.io/github/iamogbz/react-global-local-state)

Solves the problem of updating an internal component based on values passed in from a different source that can be updated independently.

## Usage

You have an initial text value of "John Doe" loaded and kept in sync with the source of the value e.g. web API, and need the field holding that value updated to "Jane Doe" without affecting the parent but also be reset to the parent value when it's changed to a newer version like "John M. Doe".

[Example code](https://stackblitz.com/edit/react-global-local-state?file=src%2FApp.tsx,src%2Fcomponents%2FSourceTargetInput.tsx)

### Demo

![synced input values](./docs/imgs/Screen%20Recording%202022-11-30%20at%207.51.05%20AM.gif)

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/react-global-local-state)
