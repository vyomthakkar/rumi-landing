# Download

The DMG is no longer kept in this repository. It is published as a GitHub
release asset, which gives an exact public download count with no script on
the page:

```text
https://github.com/vyomthakkar/rumi-landing/releases/download/v1.0/Rumi-1.0.dmg
```

All three download links on the page point there. GitHub serves release
assets with `Content-Disposition: attachment`, so the file downloads rather
than opening, and the notarization ticket survives the trip (verified with
`stapler validate` on a downloaded copy).

## Read the count

```sh
gh release view v1.0 --json assets --jq '.assets[] | "\(.name): \(.downloadCount)"'
```

or, without the CLI, the public API at
`https://api.github.com/repos/vyomthakkar/rumi-landing/releases/latest`
(`assets[].download_count`).

## Ship a new version

Create a new release with the new DMG as its asset, then update the three
`href`s in `index.html` and the version in the footer. Do not re-zip or
modify the DMG; upload the signed, notarized, stapled file as-is.
