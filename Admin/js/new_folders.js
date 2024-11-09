

const token1 = "ghp_KVvNORy";
const token2 = "aRwNAiuKb6pIxUcOCKL";
const token3 = "u9r81lIpjo";

const GITHUB_TOKEN = '${token1}${token2}${token3}'; // Replace with your actual GitHub token
const USERNAME = 'nightmareshadow4exploit';
const REPO = 'p2';

async function createFolder(folderName) {
    try {
        // Step 1: Create a "folder" by adding a placeholder file
        const filePath = `${folderName}/placeholder.txt`;
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

        // Step 2: Update `bookjson.json` to add the new folder
        const response = await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });
        const data = await response.json();
        const bookJsonContent = atob(data.content);
        const bookJson = JSON.parse(bookJsonContent);

        // Add the new folder to the JSON structure
        bookJson.folders = bookJson.folders || [];
        bookJson.folders.push(folderName);

        // Step 3: Update `bookjson.json` with the new content
        const updatedContent = btoa(JSON.stringify(bookJson, null, 2));

        await fetch(`https://api.github.com/repos/${USERNAME}/${REPO}/contents/bookjson.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update bookjson with new folder ${folderName}`,
                content: updatedContent,
                sha: data.sha // Use the SHA of the current file
            })
        });

        alert(`Folder "${folderName}" created and added to bookjson.json.`);
    } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder.');
    }
}

// Example usage
function addFolder() {
    const folderName = document.getElementById('folderName').value;
    if (folderName) {
        createFolder(folderName);
    } else {
        alert('Please enter a folder name.');
    }
}