import browser from "webextension-polyfill";
import {Message} from "./Message.ts";

// const openAllID = browser.contextMenus.create({
//     id: "openAll",
//     title: "Open All Links",
//     contexts: ["selection"]
// })

const openPaginatedID = browser.contextMenus.create({
    id: "openPaginated",
    title: "Paginate Through Selected Links...",
    contexts: ["selection"]
})

let pendingMessage: Message | undefined

function popUpListener(message: Message, _sender: browser.Runtime.MessageSender, sendResponse: (message1: Message) => void) {
    if (message.type === "popupReady" && pendingMessage) {
        sendResponse(pendingMessage);
        pendingMessage = undefined;
    }
}

browser.runtime.onMessage.addListener(popUpListener)

browser.contextMenus.onClicked.addListener(info => {
    switch (info.menuItemId) {
        // case openAllID:
        //     if (!info.selectionText) return
        //     pendingMessage = {type: "openContentBulk", content: info.selectionText}
        //     browser.action.openPopup()
        //     break;
        case openPaginatedID:
            if (!info.selectionText) return
            pendingMessage = {type: "openContentBulk", content: info.selectionText}
            browser.action.openPopup()
            break;
    }
});