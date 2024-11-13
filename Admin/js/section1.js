// Constants
const USERNAME = 'NightmareShadow4Exploit'; // Replace with your GitHub username
const REPO = 'p2'; // Replace with your repository name
// const GITHUB_TOKEN = `${token1}${token2}${token3}`; // Replace with your actual GitHub token

// Function to create a folder and assign an ID
async function createFolder(folderName) {
    try {
        // Double-encode the folder name for API compatibility
        const encodedFolderName = encodeURIComponent(encodeURIComponent(folderName));
        const filePath = `${encodedFolderName}/placeholder.txt`;

        // Create a placeholder file for the folder
        const content = btoa('This is a placeholder file for folder creation.');
        await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Create folder ${folderName} with placeholder file`,
                content: content
            })  
        });

        // Fetch the current bookjson.json file
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        let bookJson = { folders: [] };
        let sha = null;

        if (response.ok) {
            const data = await response.json();
            sha = data.sha; // Get the current SHA for the file
            const bookJsonContent = atob(data.content);
            bookJson = JSON.parse(bookJsonContent);
        } else if (response.status === 404) {
            console.log('bookjson.json not found. Creating a new one.');
        }

        // Assign a unique ID to the new folder
        const newId = bookJson.folders.length > 0
            ? Math.max(...bookJson.folders.map(folder => folder.id)) + 1
            : 1;

        // Add the folder details to bookjson.json
        bookJson.folders.push({ id: newId, name: folderName, path: encodedFolderName });

        // Update the bookjson.json file
        const updatedContent = btoa(JSON.stringify(bookJson, null, 2));
        const body = {
            message: `Update bookjson with new folder ${folderName}`,
            content: updatedContent
        };

        if (sha) {
            body.sha = sha;
        }

        await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        alert(`Folder "${folderName}" created with ID ${newId} and added to bookjson.json.`);
    } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder.');
    }
}

// Function to delete a folder by name
async function deleteFolder(folderName) {
    try {
        // Fetch the current bookjson.json file
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        let bookJson = { folders: [] };
        let sha = null;

        if (response.ok) {
            const data = await response.json();
            sha = data.sha; // Get the current SHA for the file
            const bookJsonContent = atob(data.content);
            bookJson = JSON.parse(bookJsonContent);
        } else {
            alert('bookjson.json not found.');
            return;
        }

        // Remove the folder entry from bookjson.json
        const folder = bookJson.folders.find(folder => folder.name === folderName);
        if (!folder) {
            alert(`Folder "${folderName}" not found.`);
            return;
        }

        bookJson.folders = bookJson.folders.filter(f => f.name !== folderName);

        // Reassign IDs starting from 1
        bookJson.folders.forEach((folder, index) => {
            folder.id = index + 1;
        });

        // Update the bookjson.json file
        const updatedContent = btoa(JSON.stringify(bookJson, null, 2));
        const body = {
            message: `Update bookjson after deleting folder ${folderName}`,
            content: updatedContent
        };

        if (sha) {
            body.sha = sha;
        }

        await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        // Delete all files in the folder
        const folderPath = encodeURIComponent(encodeURIComponent(folderName));
        const folderContentsResponse = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${folderPath}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        const folderContents = await folderContentsResponse.json();
        if (Array.isArray(folderContents)) {
            for (const file of folderContents) {
                await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/${file.path}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Delete file ${file.name}`,
                        sha: file.sha
                    })
                });
            }
        }

        alert(`Folder "${folderName}" deleted and bookjson.json updated.`);
    } catch (error) {
        console.error('Error deleting folder:', error);
        alert('Failed to delete folder.');
    }
}

// Event listeners for HTML forms
document.getElementById('createFolderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const folderName = document.getElementById('folderName').value;
    createFolder(folderName);
});

document.getElementById('deleteFolderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const folderNameToDelete = document.getElementById('folderNameToDelete').value;
    deleteFolder(folderNameToDelete);
});
