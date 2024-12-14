import { Container } from "./canvas/container.js";
import { drawAllContainers } from "./map.js";

export let containers = [];
export let items = [];
let addMode = false;
let useServer = true;

export function setAddMode(mode) {
  addMode = mode;
}

export function isAddMode() {
  return addMode;
}

export function setUseServer(mode) {
  useServer = mode;
}

export async function generateId() {
  const response = await fetch("/generateUUID");
  if (response.ok) {
    const data = await response.json();
    return data.uuid;
  } else {
    console.error("Failed to generate UUID from server");
    return "_" + Math.random().toString(36).substr(2, 9);
  }
}

export async function addContainer(
  x,
  y,
  width,
  height,
  label,
  wikiPage = "",
  description = "",
  imageUrl = "",
  rotation = 0,
) {
  const id = await generateId();
  const newContainer = new Container(
    id,
    x,
    y,
    width,
    height,
    label,
    rotation,
    wikiPage,
    description,
    imageUrl,
  );
  containers.push(newContainer);
  if (useServer) {
    await saveContainersToServer();
  }
  return newContainer;
}

export async function addItemToContainer(
  itemName,
  containerId,
  wikiPage = "",
  description = "",
  imageUrl = "",
) {
  const id = await generateId();
  items.push({
    id,
    name: itemName,
    containerId,
    wikiPage,
    description,
    imageUrl,
  });
  if (useServer) {
    await saveItemsToServer();
  }
}

export function getItemsInContainer(containerId) {
  return items.filter((item) => item.containerId === containerId);
}

export function generateContainersCSV() {
  const rows = [
    "id,x,y,width,height,label,rotation,wikiPage,description,imageUrl",
  ];
  containers.forEach((container) => {
    const rect = container.rect;
    rows.push(
      `${rect.id},${rect.x},${rect.y},${rect.width},${rect.height},${rect.label},${rect.rotation},${container.wikiPage},${container.description},${container.imageUrl}`,
    );
  });
  return rows.join("\n");
}

export function generateItemsCSV() {
  const rows = ["name,containerId,wikiPage,description,imageUrl"];
  items.forEach((item) => {
    rows.push(
      `${item.name},${item.containerId},${item.wikiPage},${item.description},${item.imageUrl}`,
    );
  });
  return rows.join("\n");
}

export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function saveContainersToServer() {
  const containersData = containers.map((container) => ({
    id: container.rect.id,
    x: container.rect.x,
    y: container.rect.y,
    width: container.rect.width,
    height: container.rect.height,
    label: container.rect.label,
    rotation: container.rect.rotation,
    wikiPage: container.wikiPage,
    description: container.description,
    imageUrl: container.imageUrl,
  }));

  const response = await fetch("/container", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(containersData),
  });
  if (!response.ok) {
    console.error("Failed to save containers to server");
  }
}

export async function saveItemsToServer() {
  const response = await fetch("/item", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(items),
  });
  if (!response.ok) {
    console.error("Failed to save items to server");
  }
}

export async function loadContainersFromServer() {
  const response = await fetch("/container");
  if (response.ok) {
    const data = await response.json();
    containers = data.map(
      (container) =>
        new Container(
          container.id,
          container.x,
          container.y,
          container.width,
          container.height,
          container.label,
          container.rotation,
          container.wikiPage,
          container.description,
          container.imageUrl,
        ),
    );
    drawAllContainers();
  } else {
    console.error("Failed to load containers from server");
  }
}

export async function loadItemsFromServer() {
  const response = await fetch("/item");
  if (response.ok) {
    items = await response.json();
  } else {
    console.error("Failed to load items from server");
  }
}

if (useServer) {
  loadContainersFromServer();
  loadItemsFromServer();
}
if (!useServer) {
  const container1 = addContainer(200, 200, 150, 100, "Workbench");
  const container2 = addContainer(
    1165.6989130434783,
    118.90108695652177,
    200,
    150,
    "Storage Cabinet",
  );
  const container3 = addContainer(
    990.7923913043478,
    536.6184782608696,
    100,
    100,
    "Itembox",
  );
  const container4 = addContainer(
    1962.845652173913,
    144.15652173913043,
    250,
    200,
    "Shelving Unit",
  );
  const container5 = addContainer(
    2023.05,
    676.2521739130434,
    300,
    150,
    "Workstation",
  );

  addItemToContainer("Hammer", container1.rect.id);
  addItemToContainer("Screwdriver Set", container1.rect.id);
  addItemToContainer("Wrench", container1.rect.id);

  addItemToContainer("Drill", container2.rect.id);
  addItemToContainer("Saw", container2.rect.id);
  addItemToContainer("Pliers", container2.rect.id);

  addItemToContainer("Tape Measure", container3.rect.id);
  addItemToContainer("Utility Knife", container3.rect.id);
  addItemToContainer("Level", container3.rect.id);

  addItemToContainer("Paint Cans", container4.rect.id);
  addItemToContainer("Sandpaper", container4.rect.id);
  addItemToContainer("Brushes", container4.rect.id);

  addItemToContainer("Laptop", container5.rect.id);
  addItemToContainer("Multimeter", container5.rect.id);
  addItemToContainer("Soldering Iron", container5.rect.id);
}
