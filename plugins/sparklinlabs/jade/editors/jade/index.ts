import JadeAsset from "../../data/JadeAsset";

SupClient.setupHotkeys();

let socket: SocketIOClient.Socket;
let projectClient: SupClient.ProjectClient;
let editor: TextEditorWidget;
let asset: JadeAsset;
let clientId: number;

socket = SupClient.connect(SupClient.query.project);
socket.on("welcome", onWelcome);
socket.on("disconnect", SupClient.onDisconnected);

function onWelcome(theClientId: number) {
  clientId = theClientId;
  projectClient = new SupClient.ProjectClient(socket);
  setupEditor();

  let subscriber: SupClient.AssetSubscriber = {
    onAssetReceived, onAssetEdited,
    onAssetTrashed: SupClient.onAssetTrashed
  };

  projectClient.subAsset(SupClient.query.asset, "jade", subscriber);
}

function onAssetReceived(assetId: string, theAsset: JadeAsset) {
  asset = theAsset;
  editor.setText(asset.pub.draft);
}

function onAssetEdited(assetId: string, command: string, ...args: any[]) {
  if (command === "editText") {
    // errorPaneStatus.classList.add("has-draft");
    editor.receiveEditText(args[0]);
  } else if (command === "saveText") {
    // errorPaneStatus.classList.remove("has-draft");
  }
}

function setupEditor() {
  let textArea = <HTMLTextAreaElement>document.querySelector(".text-editor");
  editor = new TextEditorWidget(projectClient, clientId, textArea, {
    mode: "text/x-jade",
    editCallback: onEditText,
    sendOperationCallback: onSendOperation,
    saveCallback: onSaveText
  });
}

function onEditText(text: string, origin: string) { /* Ignore */ }

function onSendOperation(operation: OperationData) {
  socket.emit("edit:assets", SupClient.query.asset, "editText", operation, asset.document.getRevisionId(), (err: string) => {
    if (err != null) { alert(err); SupClient.onDisconnected(); }
  });
}

function onSaveText() {
  socket.emit("edit:assets", SupClient.query.asset, "saveText", (err: string) => { if (err != null) { alert(err); SupClient.onDisconnected(); }});
}