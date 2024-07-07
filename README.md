# Bulk URl Navigator
This is a Manifest v3 Web Extension that allows you to paginate through a list of URLs. You may right click on a list of URLs and then click on `Paginate Through Selected Links...` to import the links into the extension. You can then use the `Next` and `Previous` buttons, to load the next or previous link respectively in the current tab. For the first link, a new tab will be opened.

### Building
1. First clone the repository
2. Install the dependencies with `npm install`
3. Build the extenstion with `npm run build`

### Testing
This extension has been tested in Firefox 127. This extension is still in development and has not been submitted to [addons.mozilla.org](addons.mozilla.org) just yet. To try it out for the time being, go to `about:debugging` and click `Load Temporary Add-on...`. Then select `dist/manifest.json` to load the extension.
