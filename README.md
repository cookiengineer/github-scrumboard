# GitHub Scrum Board (v0.0.1)

## The minimalistic GitHub-integrated Scrum Board

brought to you as libre software with joy and pride by [Cookie Engineer](https://cookie.engineer).


## Features

- GitHub Scrum Board Chrome/Chromium/Opera Browser Extension
- No third-party Server API, only uses `api.github.com` (via HTTPS and proper CORS)
- Free Libre Open Source Software (FLOSS)
- GitHub labels integration (`todo`, `in-progress`, `in-testing`)
- GitHub assignee integration
- GitHub milestones integration
- Open Issues are defaulted into `Backlog`
- Closed Issues are defaulted into `Done`
- Intuitive Drag and Drop support
- Overrides `https://github.com/*/*/issues` URLs of each GitHub Repository


## Overview

This Browser extension replaces the `https://github.com/<orga>/<repo>/issues` URL
and shows them as a Scrum Board while keeping the integration of `milestone` and
`assignee` search alive.

The Scrum Board uses Github's Issue labels (`todo`, `in-progress` and `in-testing`)
and everything is integrated via the official GitHub API only. There are no third-party
servers, accounts, or any kind of paid services involved here.


## Installation: Chrome

I could not submit it for free into the Chrome App Store, because I do not own a credit card.
Yes, you are allowed to wonder about WTF is going on there.

There are two ways to install this extension:

**Local Installation**

1. Go to `chrome://extensions`
2. Drag the CRX file from the [releases section](https://github.com/cookiengineer/github-scrumboard/releases) onto the Browser window.

**Developer Mode Installation**

1. Clone this repository to your hard drive via git.
2. Go to `chrome://extensions` and point it to the `github-scrumboard/chrome` folder.


## Configuration

Right Click the Extension icon and select `Options` in order to see
the Settings of the Extension.

The extension requires a so-called GitHub `Personal Access Token`
in order to work. This is required, because there's no server or
any API hosted by us - so authentication will only work via those
tokens.

Don't worry. The extension can only read your repository's issues
and modify the issue labels. Nothing else is touched and you can't
break repositories you don't have access to.

On the [Tokens](https://github.com/settings/tokens) Page, create a
new token called `github-scrumboard` and allow only `repo` access
rights.

Now copy/paste the token to the `Options` Page and click `Save`.


## Offline Usage

Right Click the Extension icon and select `Options`.

In the `Available Scrumboards` list, click on the `offline` link
that will open a new window with a fullscreen Scumboard and the
Issues gathered from the Extension's local storage.


## Contributing

Feel free to fork this project, Pull-Requests are always welcome!

