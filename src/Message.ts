export interface Message {
     type: "openContentBulk" | "openContentPaginated" | "popupReady"
     content: string;
}