# Bulk URl Navigator
<img width="1609" alt="Screenshot 2024-07-07 at 4 44 52 PM" src="https://github.com/matthew-mccall/burn/assets/46231996/7cb66d6b-58de-488d-82ab-b4a04308e11c">
This is a Manifest v3 Web Extension that allows you to paginate through a list of URLs. You may right click on a list of URLs and then click on `Paginate Through Selected Links...` to import the links into the extension. You can then use the `Next` and `Previous` buttons, to load the next or previous link respectively in the current tab. For the first link, a new tab will be opened.

### Building
Building this extension requires [Node.JS](https://nodejs.org/en/download/package-manager). (This extension has been built with Node 22.3 and newer, and NPM 10.7 and newer.)
1. First clone the repository
2. Install the dependencies with `npm install`
3. Build the extenstion with `npm run build`

### Testing
This extension has been tested in Firefox 127 and newer. To try it out locally, go to `about:debugging` and click `Load Temporary Add-on...`. Then select `dist/manifest.json` to load the extension.
