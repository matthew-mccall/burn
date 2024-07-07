import './App.css'
import {useEffect, useState} from "react";
import browser from "webextension-polyfill";
import {Alert, Button, ButtonGroup, Container, ListGroup, Stack} from "react-bootstrap";
import {Message} from "./Message.ts";

function getSelectedURLs(): string[] {
    const selection = window.getSelection();
    if (!selection) { return [] }

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

function App() {
    const [urls, setUrls] = useState<string[]>([])
    const [selected, setSelected] = useState<number>(-1)

    function importUrls(urls: string) {
        const strings = urls.split(/\s+/);
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
        const popupReadyMessage: Message = { type: "popupReady", content: "" }
        browser.runtime.sendMessage(popupReadyMessage).then((response?: Message) => {
            if (response) {
                importUrls(response.content)
                return
            }
        })
    }, [])

    async function getCurrentTabId() {
        const openedTabs = await browser.tabs.query({ active: true, highlighted: true, currentWindow: true });

        if (openedTabs.length < 1) { return; }
        return  openedTabs[0].id;
    }

    async function importFromSelection() {
        const currentTabId = await getCurrentTabId()

        if (!currentTabId) { return; }
        const injectionResults = await browser.scripting.executeScript({
            func: getSelectedURLs,
            target: {tabId: currentTabId}
        })

        if (injectionResults.length < 1) { return; }
        const firstResult = injectionResults[0].result;
        setUrls(firstResult);
    }

    async function openNextLink()
    {
        if (selected + 1 === urls.length) { return; }
        if (selected === -1) { browser.tabs.create({ active: true, url: urls[0] }).then(() => setSelected(selected + 1))}
        const currentTabId = await getCurrentTabId();
        browser.tabs.update(currentTabId, { url: urls[selected + 1] }).then(() => setSelected(selected + 1));
    }

    async function openPrevLink()
    {
        if (selected - 1 === -1) { return; }
        setSelected(selected - 1)
        const currentTabId = await getCurrentTabId();
        browser.tabs.update(currentTabId, { url: urls[selected - 1] }).then(() => setSelected(selected - 1));
    }

    return (
        <Container fluid>
            <div className={"py-3"}>
                <Stack gap={2}>
                    <h1 className={"font-monospace"}>Bulk URl Navigator</h1>
                    <Stack direction="horizontal" gap={2}>
                        <div>Import from...</div>
                        <ButtonGroup aria-label="Import group">
                            <Button variant={"light"} className={"border"} onClick={importFromSelection}>Selection</Button>
                            {/*<Button variant={"light"} className={"border"} onClick={importFromSelection}>Clipboard</Button>*/}
                        </ButtonGroup>
                        <ButtonGroup className="ms-auto" aria-label="First group">
                            <Button variant={"light"} className={"border"} disabled={selected < 0} onClick={openPrevLink}>Previous</Button>
                            <Button variant={"light"} className={"border"} disabled={selected >= urls.length - 1} onClick={openNextLink}>Next</Button>
                        </ButtonGroup>
                    </Stack>
                    <Alert variant={"info"}>Note: Importing from selection currently does not work on selected text from <code>&lt;textarea&gt;</code>s. Use the context menu action instead.</Alert>
                    <ListGroup>
                        {urls.map((url, i) => <ListGroup.Item key={i} active={selected === i}>{url}</ListGroup.Item>)}
                    </ListGroup>
                </Stack>
            </div>
        </Container>
    )
}

export default App
