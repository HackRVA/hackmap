import {
  containers,
  items,
  addContainer,
  addItemToContainer,
  generateContainersCSV,
  generateItemsCSV,
  downloadCSV,
  setAddMode,
  isAddMode,
  getItemsInContainer,
  saveContainersToServer,
  saveItemsToServer,
} from "./store.js";

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const toggleModeButton = document.getElementById("toggleMode");
const createContainerButton = document.getElementById("createContainerButton");
const createItemButton = document.getElementById("createItemButton");
const downloadContainersCSVButton = document.getElementById("downloadContainersCSV");
const downloadItemsCSVButton = document.getElementById("downloadItemsCSV");
const containersCSVOutput = document.getElementById("containersCSVOutput");
const itemsCSVOutput = document.getElementById("itemsCSVOutput");
const zoomInButton = document.getElementById("zoomIn");
const zoomOutButton = document.getElementById("zoomOut");
const resetViewButton = document.getElementById("resetView");

const createContainerModal = document.getElementById("createContainerModal");
const createContainerConfirm = document.getElementById("createContainerConfirm");
const createContainerCancel = document.getElementById("createContainerCancel");
const containerLabelInput = document.getElementById("containerLabel");
const containerWidthInput = document.getElementById("containerWidth");
const containerHeightInput = document.getElementById("containerHeight");
const containerWikiPageInput = document.getElementById("containerWikiPage");
const containerDescriptionInput = document.getElementById("containerDescription");
const containerImageUrlInput = document.getElementById("containerImageUrl");

const createItemModal = document.getElementById("createItemModal");
const createItemConfirm = document.getElementById("createItemConfirm");
const createItemCancel = document.getElementById("createItemCancel");
const itemNameInput = document.getElementById("itemName");
const itemContainerSelect = document.getElementById("itemContainerSelect");
const itemWikiPageInput = document.getElementById("itemWikiPage");
const itemDescriptionInput = document.getElementById("itemDescription");
const itemImageUrlInput = document.getElementById("itemImageUrl");

const itemInfo = document.getElementById("itemInfo");
const itemNameInfo = document.getElementById("itemNameInfo");
const itemContainerInfo = document.getElementById("itemContainerInfo");
const itemWikiPageInfo = document.getElementById("itemWikiPageInfo");
const itemDescriptionInfo = document.getElementById("itemDescriptionInfo");
const itemImageInfo = document.getElementById("itemImageInfo");
const editItemButton = document.getElementById("editItemButton");

const editContainerModal = document.getElementById("editContainerModal");
const editContainerConfirm = document.getElementById("editContainerConfirm");
const editContainerCancel = document.getElementById("editContainerCancel");
const editContainerLabelInput = document.getElementById("editContainerLabel");
const editContainerWidthInput = document.getElementById("editContainerWidth");
const editContainerHeightInput = document.getElementById("editContainerHeight");
const editContainerWikiPageInput = document.getElementById("editContainerWikiPage");
const editContainerDescriptionInput = document.getElementById("editContainerDescription");
const editContainerImageUrlInput = document.getElementById("editContainerImageUrl");

const editItemModal = document.getElementById("editItemModal");
const editItemConfirm = document.getElementById("editItemConfirm");
const editItemCancel = document.getElementById("editItemCancel");
const editItemNameInput = document.getElementById("editItemName");
const editItemContainerSelect = document.getElementById("editItemContainerSelect");
const editItemWikiPageInput = document.getElementById("editItemWikiPage");
const editItemDescriptionInput = document.getElementById("editItemDescription");
const editItemImageUrlInput = document.getElementById("editItemImageUrl");

const containerInfo = document.getElementById("containerInfo");
const containerLabelInfo = document.getElementById("containerLabelInfo");
const containerWikiPageInfo = document.getElementById("containerWikiPageInfo");
const containerDescriptionInfo = document.getElementById("containerDescriptionInfo");
const containerImageInfo = document.getElementById("containerImageInfo");
const containerItemsInfo = document.getElementById("containerItemsInfo");
const editContainerButton = document.getElementById("editContainerButton");

const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");
const searchResultsList = document.getElementById("searchResultsList");

let isEditMode = false;
let selectedContainer = null;
let selectedItem = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

let scale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPan = { x: 0, y: 0 };
let lastPan = { x: 0, y: 0 };
let velocity = { x: 0, y: 0 };
let isMouseDown = false;

const backgroundImage = new Image();
backgroundImage.src = "2026_Dabney_Floor_Plan_blank.png";
backgroundImage.onload = () => {
  resizeCanvas();
  fitImageToCanvas();
  drawAllContainers();
};

toggleModeButton.addEventListener("click", toggleEditMode);

createContainerButton.addEventListener("click", showCreateContainerModal);
createItemButton.addEventListener("click", showCreateItemModal);
createContainerConfirm.addEventListener("click", confirmCreateContainer);
createContainerCancel.addEventListener("click", cancelCreateContainer);
createItemConfirm.addEventListener("click", confirmCreateItem);
createItemCancel.addEventListener("click", cancelCreateItem);
editContainerConfirm.addEventListener("click", confirmEditContainer);
editContainerCancel.addEventListener("click", cancelEditContainer);
editItemConfirm.addEventListener("click", confirmEditItem);
editItemCancel.addEventListener("click", cancelEditItem);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mouseleave", handleMouseUp);

document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);

//downloadContainersCSVButton.addEventListener("click", downloadContainersCSV);
//downloadItemsCSVButton.addEventListener("click", downloadItemsCSV);

zoomInButton.addEventListener("click", zoomIn);
zoomOutButton.addEventListener("click", zoomOut);
resetViewButton.addEventListener("click", resetView);

canvas.addEventListener("wheel", handleMouseWheelZoom);

canvas.addEventListener("mousedown", startPanning);

async function toggleEditMode() {
  if (isEditMode) {
    await saveContainersToServer();
    await saveItemsToServer();
  }
  isEditMode = !isEditMode;
  toggleModeButton.textContent = isEditMode ? "Switch to View Mode" : "Switch to Edit Mode";
  containerInfo.style.display = "none";
}

function showCreateContainerModal() {
  createContainerModal.classList.add("is-active");
}

function showCreateItemModal() {
  populateItemContainerSelect();
  createItemModal.classList.add("is-active");
}

function confirmCreateContainer() {
  const label = containerLabelInput.value;
  const width = parseInt(containerWidthInput.value, 10);
  const height = parseInt(containerHeightInput.value, 10);
  const wikiPage = containerWikiPageInput.value;
  const description = containerDescriptionInput.value;
  const imageUrl = containerImageUrlInput.value;
  if (label && width > 0 && height > 0) {
    addContainer(100, 100, width, height, label, wikiPage, description, imageUrl);
    drawAllContainers();
    createContainerModal.classList.remove("is-active");
  }
}

function cancelCreateContainer() {
  createContainerModal.classList.remove("is-active");
}

function confirmCreateItem() {
  const itemName = itemNameInput.value;
  const containerId = itemContainerSelect.value;
  const wikiPage = itemWikiPageInput.value;
  const description = itemDescriptionInput.value;
  const imageUrl = itemImageUrlInput.value;
  if (itemName && containerId) {
    addItemToContainer(itemName, containerId, wikiPage, description, imageUrl);
    drawAllContainers();
    createItemModal.classList.remove("is-active");
  }
}

function cancelCreateItem() {
  createItemModal.classList.remove("is-active");
}

function confirmEditContainer() {
  if (displayedContainer) {
    displayedContainer.rect.label = editContainerLabelInput.value;
    displayedContainer.rect.width = parseInt(editContainerWidthInput.value, 10);
    displayedContainer.rect.height = parseInt(editContainerHeightInput.value, 10);
    displayedContainer.wikiPage = editContainerWikiPageInput.value;
    displayedContainer.description = editContainerDescriptionInput.value;
    displayedContainer.imageUrl = editContainerImageUrlInput.value;
    drawAllContainers();
    editContainerModal.classList.remove("is-active");
    saveContainersToServer();
  }
}

function cancelEditContainer() {
  editContainerModal.classList.remove("is-active");
}

function confirmEditItem() {
  if (selectedItem) {
    selectedItem.name = editItemNameInput.value;
    selectedItem.containerId = editItemContainerSelect.value;
    selectedItem.wikiPage = editItemWikiPageInput.value;
    selectedItem.description = editItemDescriptionInput.value;
    selectedItem.imageUrl = editItemImageUrlInput.value;
    drawAllContainers();
    editItemModal.classList.remove("is-active");
    saveItemsToServer();
  }
}

function cancelEditItem() {
  editItemModal.classList.remove("is-active");
}

function downloadContainersCSV() {
  downloadCSV(generateContainersCSV(), "containers.csv");
}

function downloadItemsCSV() {
  downloadCSV(generateItemsCSV(), "items.csv");
}

function zoomIn() {
  scale *= 1.1;
  drawAllContainers();
}

function zoomOut() {
  scale /= 1.1;
  drawAllContainers();
}

function resetView() {
  fitImageToCanvas();
  drawAllContainers();
}

function handleMouseWheelZoom(event) {
  event.preventDefault();
  const zoomFactor = 1.1;
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  const wheel = event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;

  const newScale = scale * wheel;
  const dx = mouseX - panX;
  const dy = mouseY - panY;

  panX -= dx * (newScale - scale) / scale;
  panY -= dy * (newScale - scale) / scale;

  scale = newScale;
  drawAllContainers();
}

function startPanning(event) {
  if (event.button === 1 || (!isEditMode && !isAddMode())) {
    isPanning = true;
    isMouseDown = true;
    startPan = { x: event.clientX - panX, y: event.clientY - panY };
    lastPan = { x: event.clientX, y: event.clientY };
  }
}

function updateCSVOutputs() {
  //containersCSVOutput.value = generateContainersCSV();
  //itemsCSVOutput.value = generateItemsCSV();
}

let activeHandle = null;

function handleMouseDown(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - panX) / scale;
  const y = (event.clientY - rect.top - panY) / scale;

  if (event.button === 1) {
    startPanning(event);
    return;
  }

  if (isAddMode()) {
    const label = prompt("Enter a label for the rectangle:");
    if (label) {
      addContainer(x, y, 100, 50, label);
      setAddMode(false);
      drawAllContainers();
    }
    return;
  }

  if (isEditMode) {
    selectedContainer = null;

    for (const container of containers) {
      const action = container.handleMouseDown(x, y);
      if (action) {
        selectedContainer = container;
        activeHandle = action;
        if (action === "drag") {
          isDragging = true;
          dragOffset = { x: x - container.rect.x, y: y - container.rect.y };
        }
        return;
      }
    }
  } else {
    selectedContainer = containers.find((c) => c.containsPoint(x, y));
    if (selectedContainer) {
      showContainerInfo(selectedContainer);
    } else {
      const selectedItem = items.find((item) => {
        const container = containers.find((c) => c.rect.id === item.containerId);
        return container && container.containsPoint(x, y);
      });
      if (selectedItem) {
        showItemInfo(selectedItem);
      } else {
        containerInfo.style.display = "none";
        itemInfo.style.display = "none";
      }
    }
    drawAllContainers();
  }
}

function handleMouseMove(event) {
  if (!selectedContainer || (!isDragging && !activeHandle)) {
    if (isPanning && isMouseDown) {
      const dx = event.clientX - lastPan.x;
      const dy = event.clientY - lastPan.y;
      panX += dx;
      panY += dy;
      velocity = { x: dx, y: dy };
      lastPan = { x: event.clientX, y: event.clientY };
      drawAllContainers();
    }
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - panX) / scale;
  const y = (event.clientY - rect.top - panY) / scale;

  selectedContainer.handleMouseMove(x, y, activeHandle, dragOffset);
  drawAllContainers();
}

function handleMouseUp() {
  if (isDragging || activeHandle) {
    updateCSVOutputs();
  }
  isDragging = false;
  activeHandle = null;
  selectedContainer = null;
  isMouseDown = false;
  isPanning = false;
}

export function drawAllContainers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fillCanvasBackground();
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);

  drawBackgroundImage();
  drawContainers();
  ctx.restore();
  updateCSVOutputs();
}

function fillCanvasBackground() {
  ctx.fillStyle = "#d3d3d3"; // Light gray color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackgroundImage() {
  ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
}

function drawContainers() {
  containers.forEach((container) => {
    const highlight = selectedContainer === container && !isEditMode;
    container.draw(ctx, highlight, isEditMode);
  });
}

function resizeCanvas() {
  const container = document.querySelector('.canvas-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  drawAllContainers();
}

window.addEventListener('resize', resizeCanvas);

function applyInertia() {
  if (!isMouseDown && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1)) {
    panX += velocity.x;
    panY += velocity.y;
    velocity.x *= 0.95;
    velocity.y *= 0.95;
    drawAllContainers();
  }
  requestAnimationFrame(applyInertia);
}

applyInertia();

function fitImageToCanvas() {
  const canvasAspect = canvas.width / canvas.height;
  const imageAspect = backgroundImage.width / backgroundImage.height;

  if (canvasAspect > imageAspect) {
    scale = canvas.height / backgroundImage.height;
  } else {
    scale = canvas.width / backgroundImage.width;
  }

  centerImage();
}

function centerImage() {
  panX = (canvas.width - backgroundImage.width * scale) / 2;
  panY = (canvas.height - backgroundImage.height * scale) / 2;
}

function populateItemContainerSelect() {
  itemContainerSelect.innerHTML = "";
  containers.forEach((container) => {
    const option = document.createElement("option");
    option.value = container.rect.id;
    option.textContent = container.rect.label;
    itemContainerSelect.appendChild(option);
  });
}

function populateEditItemContainerSelect() {
  editItemContainerSelect.innerHTML = "";
  containers.forEach((container) => {
    const option = document.createElement("option");
    option.value = container.rect.id;
    option.textContent = container.rect.label;
    editItemContainerSelect.appendChild(option);
  });
}

let displayedContainer = null;

function showContainerInfo(container) {
  displayedContainer = container;
  containerLabelInfo.textContent = container.rect.label;
  containerWikiPageInfo.textContent = container.wikiPage;
  containerDescriptionInfo.textContent = container.description;
  containerImageInfo.src = container.imageUrl;
  const items = getItemsInContainer(container.rect.id);
  containerItemsInfo.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    const span = document.createElement("span")
    span.textContent = item.name;
    span.addEventListener("click", () => {
      selectedItem = item;
      showItemInfo(item);
    })
    li.appendChild(span)
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("button", "is-small", "is-info");
    editButton.addEventListener("click", () => showEditItemModal(item.name));
    li.classList.add("container-item")
    li.appendChild(editButton);
    containerItemsInfo.appendChild(li);
  });
  containerInfo.style.display = "block";
}

function showEditContainerModal() {
  if (displayedContainer) {
    editContainerLabelInput.value = displayedContainer.rect.label;
    editContainerWidthInput.value = displayedContainer.rect.width;
    editContainerHeightInput.value = displayedContainer.rect.height;
    editContainerWikiPageInput.value = displayedContainer.wikiPage;
    editContainerDescriptionInput.value = displayedContainer.description;
    editContainerImageUrlInput.value = displayedContainer.imageUrl;
    editContainerModal.classList.add("is-active");
  }
}

function showEditItemModal(itemName) {
  selectedItem = items.find(item => item.name === itemName);
  if (selectedItem) {
    editItemNameInput.value = selectedItem.name;
    editItemContainerSelect.value = selectedItem.containerId;
    editItemWikiPageInput.value = selectedItem.wikiPage;
    editItemDescriptionInput.value = selectedItem.description;
    editItemImageUrlInput.value = selectedItem.imageUrl;
    populateEditItemContainerSelect();
    editItemModal.classList.add("is-active");
  }
}

searchBox.addEventListener("input", handleSearchInput);

function handleSearchInput() {
  const searchTerm = searchBox.value.toLowerCase();
  searchResultsList.innerHTML = "";

  if (searchTerm) {
    const results = searchContainersAndItems(searchTerm);
    displaySearchResults(results);
    searchResults.style.display = "block";
  } else {
    searchResults.style.display = "none";
  }
}

function searchContainersAndItems(searchTerm) {
  const results = [];

  containers.forEach((container) => {
    if (container.rect.label.toLowerCase().includes(searchTerm)) {
      results.push({ type: "container", label: container.rect.label, id: container.rect.id });
    }
  });

  items.forEach((item) => {
    if (item.name.toLowerCase().includes(searchTerm)) {
      results.push({ type: "item", label: item.name, containerId: item.containerId });
    }
  });

  return results;
}

function displaySearchResults(results) {
  results.forEach((result) => {
    const li = document.createElement("li");
    li.textContent = `${result.type === "container" ? "Container" : "Item"}: ${result.label}`;
    li.addEventListener("click", () => handleSearchResultClick(result));
    searchResultsList.appendChild(li);
  });
}

function showItemInfo(item) {
  const container = containers.find((c) => c.rect.id === item.containerId);
  itemNameInfo.textContent = item.name;
  itemContainerInfo.textContent = container ? container.rect.label : "Unknown";
  itemWikiPageInfo.textContent = item.wikiPage;
  itemDescriptionInfo.textContent = item.description;
  itemImageInfo.src = item.imageUrl;
  itemInfo.style.display = "block";
}

function handleSearchResultClick(result) {
  if (result.type === "container") {
    const container = containers.find((c) => c.rect.id === result.id);
    if (container) {
      selectedContainer = container;
      showContainerInfo(container);
      drawAllContainers();
    }
  } else if (result.type === "item") {
    const container = containers.find((c) => c.rect.id === result.containerId);
    if (container) {
      selectedContainer = container;
      showContainerInfo(container);
    }
    const item = items.find((t) => t.name === result.label);
    if (item) {
      selectedItem = item;
      showItemInfo(item);
    }
    drawAllContainers();
  }
  searchResults.style.display = "none";
}

editContainerButton.addEventListener("click", showEditContainerModal);
editItemButton.addEventListener("click", () => {
  if (selectedItem) {
    showEditItemModal(selectedItem.name);
  }
});
