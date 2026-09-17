# Download

The DMG is no longer kept in this repository. It is published as a GitHub
release asset, which gives an exact public download count with no script on
the page:

```text
https://github.com/vyomthakkar/rumi-landing/releases/download/v1.1.1/Rumi-1.1.1.dmg
```

All three download links on the page point there. GitHub serves release
assets with `Content-Disposition: attachment`, so the file downloads rather
than opening, and the notarization ticket survives the trip (verified with
`stapler validate` on a downloaded copy).

## Read the count

```sh
gh release view v1.1.1 --json assets --jq '.assets[] | "\(.name): \(.downloadCount)"'
```

or, without the CLI, the public API at
`https://api.github.com/repos/vyomthakkar/rumi-landing/releases/latest`
(`assets[].download_count`).

## Ship a new version

The desktop agent leaves `Rumi-<version>.dmg`, `appcast.xml` and a
`HANDOVER.md` in `/Users/vyomthakkar/Downloads/rumi-desktop/release/`. Then:

```sh
scripts/release.sh <version> /Users/vyomthakkar/Downloads/rumi-desktop/release
```

It verifies the DMG (signature, stapled notarization, Gatekeeper), checks the
appcast points at the release it is about to create, creates the GitHub
release, confirms the served asset's sha256, copies `appcast.xml` to the site
root, and repoints the three download links and the footer version. It does
not commit: review `git diff`, fix any size copy it flags, then commit and
push. Do not re-zip or modify the DMG; publish the notarized file as-is.
