#!/usr/bin/env bash
# Publish a new Rumi version from the desktop repo's handover folder.
#
#   scripts/release.sh 1.1.1 /Users/vyomthakkar/Downloads/rumi-desktop/release
#
# What it does, stopping at the first problem:
#   1. verifies the DMG: Developer ID signature, stapled notarization, Gatekeeper
#   2. checks appcast.xml points at the release URL this script is about to create,
#      and that its length matches the DMG byte for byte
#   3. creates GitHub release v<version> with the DMG as its asset
#   4. re-downloads the published asset and confirms the sha256 matches
#   5. copies appcast.xml to the site root  (every 1.1.1+ install checks
#      https://rumithecat.com/appcast.xml for updates; that path is baked in)
#   6. repoints the three download links and the footer version in index.html
#
# It does NOT commit or push. Review `git diff`, update any size copy the
# script flags, then commit and push. The appcast is live only after the push.
set -euo pipefail

VERSION="${1:?usage: release.sh <version> <handover-dir>}"
SRC="${2:?usage: release.sh <version> <handover-dir>}"
REPO="vyomthakkar/rumi-landing"
DMG="$SRC/Rumi-$VERSION.dmg"
APPCAST="$SRC/appcast.xml"
TAG="v$VERSION"
URL="https://github.com/$REPO/releases/download/$TAG/Rumi-$VERSION.dmg"
SITE="$(cd "$(dirname "$0")/.." && pwd)"

say() { printf '\n== %s\n' "$*"; }
die() { printf '\nFAILED: %s\n' "$*" >&2; exit 1; }

[ -f "$DMG" ]     || die "no DMG at $DMG"
[ -f "$APPCAST" ] || die "no appcast at $APPCAST"

say "1. verifying $DMG"
codesign -dv --verbose=2 "$DMG" 2>&1 | grep -q "Developer ID Application: Vyom Thakkar (6966ZNQY4T)" || die "not signed by the expected Developer ID"
xcrun stapler validate "$DMG" >/dev/null 2>&1 || die "notarization ticket is not stapled"
spctl -a -t install "$DMG" 2>&1 | grep -q "accepted" || die "Gatekeeper does not accept it"
SIZE=$(stat -f %z "$DMG"); SHA=$(shasum -a 256 "$DMG" | cut -c1-64)
echo "   signed, stapled, accepted · $SIZE bytes · sha256 $SHA"

say "2. checking appcast.xml"
grep -q "url=\"$URL\"" "$APPCAST"   || die "appcast enclosure does not point at $URL"
grep -q "length=\"$SIZE\""  "$APPCAST" || die "appcast length does not match the DMG ($SIZE)"
python3 -c "import xml.etree.ElementTree as E,sys; E.parse(sys.argv[1])" "$APPCAST" || die "appcast is not well-formed XML"
echo "   enclosure and length match; XML well-formed"

say "3. creating release $TAG"
if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  die "release $TAG already exists; delete it first if this is intentional"
fi
gh release create "$TAG" "$DMG" --repo "$REPO" --title "Rumi $VERSION" \
  --notes "Rumi $VERSION for macOS 11 Big Sur or later. Universal (Apple Silicon and Intel), signed and notarized." >/dev/null
echo "   $URL"

say "4. verifying the published asset"
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
for i in 1 2 3 4 5 6; do curl -sfL --max-time 120 "$URL" -o "$TMP" && break; sleep 5; done
[ "$(shasum -a 256 "$TMP" | cut -c1-64)" = "$SHA" ] || die "served asset does not match the local DMG"
echo "   sha256 matches"

say "5. installing appcast.xml at the site root"
cp "$APPCAST" "$SITE/appcast.xml"
echo "   $SITE/appcast.xml"

say "6. repointing index.html"
OLD_COUNT=$(grep -c 'releases/download/v[0-9.]*/Rumi-[0-9.]*\.dmg' "$SITE/index.html" || true)
sed -i '' -E "s#releases/download/v[0-9.]+/Rumi-[0-9.]+\.dmg#releases/download/$TAG/Rumi-$VERSION.dmg#g" "$SITE/index.html"
sed -i '' -E "s#<p>Rumi [0-9.]+ · for macOS</p>#<p>Rumi $VERSION · for macOS</p>#" "$SITE/index.html"
echo "   $OLD_COUNT download link(s) and the footer now say $VERSION"

MB=$(python3 -c "print(round($SIZE/1048576,1))")
say "done. Not committed. Check these by hand, then commit and push:"
echo "   - the DMG is ${MB} MB; the hero says: $(grep -o '[0-9.]* MB · macOS' "$SITE/index.html")"
echo "   - step 1 says: $(grep -o 'One file, about [a-z ]*\.' "$SITE/index.html")"
echo "   - git diff"
