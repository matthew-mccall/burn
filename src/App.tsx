import './App.css'
import {useEffect, useState} from "react";
import browser from "webextension-polyfill";
import {Alert, Button, ButtonGroup, Container, ListGroup, Stack} from "react-bootstrap";
import {Message} from "./Message.ts";
import BlobBackground from "./components/BlobBackground";

function getSelectedURLs(): string[] {
    const selection = window.getSelection();
    if (!selection) {
        return []
    }

    const selections = []
    const newURLs = []

    for (let i = 0; i < selection.rangeCount; i++) {
        const rangeText = selection.getRangeAt(i).toString();
        selections.push(rangeText);
    }

    for (const selectedText of selections) {
        console.log(selectedText)
        const urls = selectedText.split(/\s+/);
        newURLs.push(...urls);
    }

    console.log(newURLs);

    return newURLs.filter((url) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    });
}

interface PopupState {
    position: number
    urls: string[]
}

function App() {
    const [popupState, setPopupState] = useState<PopupState>({position: -1, urls: []})
    const {position, urls} = popupState

    function setPosition(newPosition: number) {
        const newState: PopupState = {position: newPosition, urls}
        browser.storage.local.set(newState).then(() => setPopupState(newState))
    }

    function setUrls(newURLs: string[]) {
        const newState: PopupState = {position, urls: newURLs}
        browser.storage.local.set(newState).then(() => setPopupState(newState))
    }

    function importUrls(str: string) {
        const strings = str.split(/\s+/);
        const newURLs = strings.filter((url) => {
            try {
                new URL(url);
                return true;
            } catch (_) {
                return false;
            }
        })
        setUrls(newURLs)
    }

    useEffect(() => {
        const popupReadyMessage: Message = {type: "popupReady", content: ""}
        browser.runtime.sendMessage(popupReadyMessage).then((response?: Message) => {
            if (response) {
                importUrls(response.content)
                return
            }

            browser.storage.local.get().then(({position, urls}) => {
                if (!position || !urls) { return }
                setPopupState({position, urls})
            })
        })
    })

    async function getCurrentTabId() {
        const openedTabs = await browser.tabs.query({active: true, highlighted: true, currentWindow: true});

        if (openedTabs.length < 1) {
            return;
        }
        return openedTabs[0].id;
    }

    async function importFromSelection() {
        const currentTabId = await getCurrentTabId()

        if (!currentTabId) {
            return;
        }
        const injectionResults = await browser.scripting.executeScript({
            func: getSelectedURLs,
            target: {tabId: currentTabId}
        })

        if (injectionResults.length < 1) {
            return;
        }
        const firstResult = injectionResults[0].result;
        setUrls(firstResult);
    }

    async function openLink(index: number) {
        const currentTabId = await getCurrentTabId();
        browser.tabs.update(currentTabId, {url: urls[index]})
            .then(() => {
                const saveData: PopupState = {position: index, urls}
                browser.storage.local.set(saveData)
            })
            .then(() => setPosition(index))
    }

    async function openNextLink() {
        const newPosition = position + 1;
        if (newPosition === urls.length) {
            return;
        }
        if (position === -1) {
            browser.tabs.create({active: true, url: urls[0]}).then(() => setPosition(newPosition))
        }
        await openLink(newPosition);
    }

    async function openPrevLink() {
        const newPosition = position - 1;
        if (newPosition === -1) {
            return;
        }
        await openLink(newPosition);
    }

    function clearState() { browser.storage.local.clear().then(() => setPopupState({position: -1, urls: []})) }

    return (
        <>
            <BlobBackground>
                <Container fluid>
                    <div className={"py-4"}>
                        <h1 className={"text-light font-monospace"}>Bulk URl Navigator</h1>
                    </div>
                </Container>
            </BlobBackground>
            <Container fluid className={"bg-body"}>
                <div className={"py-3"}>
                    <Stack gap={2}>
                        <Stack direction="horizontal" gap={2}>
                            <div>Import from...</div>
                            <ButtonGroup className="me-auto" aria-label="Import group">
                                <Button variant={"light"} className={"border"}
                                        onClick={importFromSelection}>Selection</Button>
                                {/*<Button variant={"light"} className={"border"} onClick={importFromSelection}>Clipboard</Button>*/}
                            </ButtonGroup>
                            <Button variant={"light"} className={"border"} onClick={clearState} disabled={urls.length < 1}>Clear</Button>
                            {position === -1
                                ? <Button onClick={openNextLink} disabled={urls.length < 1}>Begin Pagination...</Button>
                                : <ButtonGroup aria-label="Paginate group">
                                    <Button variant={"light"} className={"border"} disabled={position < 1}
                                            onClick={openPrevLink}>Previous</Button>
                                    <Button variant={"light"} className={"border"} disabled={position >= urls.length - 1}
                                            onClick={openNextLink}>Next</Button>
                                </ButtonGroup>}

                        </Stack>
                        <Alert variant={"info"}>Note: Importing from selection currently does not work on selected text
                            from <code>&lt;textarea&gt;</code>s. Use the context menu action instead.</Alert>
                        <ListGroup>
                            {urls.map((url, i) => <ListGroup.Item key={i} active={position === i} action onClick={() => openLink(i)}>{url}</ListGroup.Item>)}
                        </ListGroup>
                    </Stack>
                </div>
            </Container>
        </>
    )
}

export default App
