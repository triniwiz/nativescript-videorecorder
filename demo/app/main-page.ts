import * as observable from 'data/observable';
import * as pages from 'ui/page';
import {HelloWorldModel} from './main-view-model';
import fs = require("file-system");
let page
let vm = new HelloWorldModel();
// Event handler for Page "loaded" event attached in main-page.xml
export function loaded(args: pages.NavigatedData) {
    // Get the event sender
    page = <pages.Page>args.object;
    page.bindingContext = vm;
}


export function recordVideo() {
    page.bindingContext.recorder({ saveToGallery: false })
        .then((data) => {
            page.bindingContext.set("selectedVideo", fs.path.join(fs.knownFolders.documents().path, data.file));
        })
        .catch((err) => {
            console.log(err)
        })
}


