
brought to you as libre software with joy and pride by [Cookie Engineer](https://cookie.engineer).

# GitHub Scrum Board

This Web Extension is a Scrum Board for GitHub Issues that can be used
both Online and Offline, so that your workflow isn't interrupted when
you don't have Internet access.


## Usage

This Extension replaces the `https://github.com/<orga>/<repo>/issues`
URL and shows them as a Scrum Board while keeping the integration of
the `milestone` and `assignee` search alive.

Open Issues are moved into `Backlog`, Closed Issues are moved into `Done`.

Additionally, the Scrum Board uses GitHub's Issue Labels (`todo`,
`in-progress` and `in-testing`) to keep the issues integrated with
the official GitHub API (`https://api.github.com/`).

There are no third-party servers, accounts, or any kind of paid service
involved here.


## Screencast

![Screencast](https://i.imgur.com/pzcJDUF.mp4)


## Installation

I could not submit it for free into the Chrome App Store, because I do
not own a credit card and I don't intend to get one.

There are two ways to install this Extension:

**Local Installation**

1. Go to `chrome://extensions`
2. Drag the CRX file from the [releases section](https://github.com/cookiengineer/github-scrumboard/releases) onto the Browser window.

**Developer Mode Installation**

1. Clone this repository to your hard drive via git.
2. Go to `chrome://extensions` and point it to the `chrome` folder.


## Configuration

Right Click the Extension icon and select `Options` in order to see
the Settings of the Extension.

The extension requires a so-called GitHub `Personal Access Token`
in order to work. This is required, because there's no Server and
no App hosted anywhere - so authentication will only work via those
tokens.

- Go to the [Tokens](https://github.com/settings/tokens) Page
- Create a new token called `github-scrumboard` with `repo` access rights.
- Copy/paste the token to the `Options` Page and click `Save`.


## Offline Usage

Right Click the Extension icon and select `Options`.

In the `Available Scrumboards` list, click on the `offline` link
that will open a new window with a fullscreen Scumboard and the
Issues gathered from the Extension's local storage.


## License

This Web Extension is licensed under the [GNU AGPL 3.0](./AGPL-3.0.md) license.


## Sponsorship

If you like the work that I do and want me to continue working on things
like this; it would be awesome if you would sponsor this project:

https://github.com/sponsors/cookiengineer

