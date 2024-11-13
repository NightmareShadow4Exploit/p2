

async function fetchFolderData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch the file from GitHub.');
        }

        const data = await response.json();
        
        let bookJson = { folders: [] };
        if (data.content) {
            const bookJsonContent = atob(data.content); // Decode base64 content
            bookJson = bookJsonContent ? JSON.parse(bookJsonContent) : { folders: [] };
        }

        console.log('Fetched bookJson:', bookJson);

        if (bookJson.folders && Array.isArray(bookJson.folders)) {
            const folderList = document.getElementById('folderList');
            folderList.innerHTML = ''; // Clear existing list

            bookJson.folders.forEach(folder => {
                const li = document.createElement('li');
                li.classList.add('folderItem');
                li.setAttribute('draggable', 'true');
                li.setAttribute('data-id', folder.id);
                li.innerHTML = `ID: ${folder.id} - ${folder.name}`;
                folderList.appendChild(li);

                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragover', handleDragOver);
                li.addEventListener('drop', handleDrop);
                li.addEventListener('dragend', handleDragEnd);
            });
        } else {
            console.error('No folders found in bookJson:', bookJson);
        }
    } catch (error) {
        console.error('Error fetching folder data:', error);
    }
}

// Call the fetch function on page load
window.onload = fetchFolderData;


// Drag and Drop Handlers
let draggedItem = null;

function handleDragStart(event) {
    draggedItem = event.target;
    draggedItem.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.clientY);
    if (afterElement == null) {
        event.target.parentElement.appendChild(draggedItem);
    } else {
        event.target.parentElement.insertBefore(draggedItem, afterElement);
    }
}

function handleDrop(event) {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.clientY);
    if (afterElement == null) {
        event.target.parentElement.appendChild(draggedItem);
    } else {
        event.target.parentElement.insertBefore(draggedItem, afterElement);
    }
}

function handleDragEnd() {
    draggedItem.classList.remove('dragging');
    updateFolderIds();  // Reassign IDs after drag
}

function getDragAfterElement(clientY) {
    const elements = [...document.querySelectorAll('#folderList .folderItem:not(.dragging)')];
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Update folder IDs after drag
function updateFolderIds() {
    const folderList = document.getElementById('folderList');
    const folders = [...folderList.querySelectorAll('.folderItem')];
    const updatedFolders = folders.map((folder, index) => {
        const id = index + 1;  // Reassign IDs based on new order
        return {
            id: id,
            name: folder.innerText.split(' - ')[1].trim()
        };
    });

    saveUpdatedFolderOrder(updatedFolders);
}

// Save updated folder order to GitHub
async function saveUpdatedFolderOrder(updatedFolders) {
    try {
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        const data = await response.json();
        const content = btoa(JSON.stringify({ folders: updatedFolders }, null, 2));

        await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update folder order',
                content: content,
                sha: data.sha  // SHA of the existing bookjson file
            })
        });

        alert('Folder order saved successfully!');
    } catch (error) {
        console.error('Error saving updated folder order:', error);
        alert('Failed to save folder order.');
    }
}

// Load folders when the page is loaded
window.onload = fetchFolderData;

// Save new order when the button is clicked
document.getElementById('saveOrderBtn').addEventListener('click', () => {
    const folderList = document.getElementById('folderList');
    const folders = [...folderList.querySelectorAll('.folderItem')];
    const updatedFolders = folders.map((folder, index) => {
        return {
            id: index + 1,  // Reassign IDs based on order
            name: folder.innerText.split(' - ')[1].trim()
        };
    });
    saveUpdatedFolderOrder(updatedFolders);
});