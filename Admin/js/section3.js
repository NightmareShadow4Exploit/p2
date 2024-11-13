// const repoOwner = 'NightmareShadow4Exploit'; // Your GitHub username
// const repoName = 'p2'; // Your repository name
// const branch = 'main'; // Branch you want to upload to

// const token1 = "ghp_KVvNORy";
// const token2 = "aRwNAiuKb6pIxUcOCKL";
// const token3 = "u9r81lIpjo";
// const GITHUB_TOKEN = `${token1}${token2}${token3}`; // Full GitHub token

const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const folderSelect = document.getElementById('folderSelect');
// Fetch the bookjson.json dynamically and populate the folder dropdown
async function fetchFolders() {
  try {
    const response = await fetch('../../bookjson.json'); // Adjust path if necessary
    if (!response.ok) throw new Error('Failed to fetch folder data');

    const data = await response.json();
    console.log('Fetched data:', data); // Debug: log fetched data

    // Clear any existing options in the dropdown (in case the function is called multiple times)
    folderSelect.innerHTML = '';

    // Populate the folder select dropdown
    data.folders.forEach(folder => {
      console.log('Adding folder to dropdown:', folder.name); // Debug: log each folder name
      const option = document.createElement('option');
      option.value = folder.name;
      option.textContent = folder.name;
      folderSelect.appendChild(option);
    });

    // Confirm that options were added
    console.log('Dropdown options:', folderSelect.innerHTML); // Debug: log dropdown content
  } catch (error) {
    console.error('Error fetching folder data:', error);
  }
}

// Call the function to fetch folders when the page loads
fetchFolders();

// Upload file when the upload button is clicked
uploadButton.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const selectedFolder = folderSelect.value;

  if (!file) {
    alert('Please select a file to upload.');
    return;
  }

  if (!selectedFolder) {
    alert('Please select a folder to upload the file.');
    return;
  }

  const fileName = file.name;
  const base64Content = await toBase64(file);

  // Construct file path in the selected folder
  const filePath = `${selectedFolder}/${fileName}`; 
  console.log("Uploading to path:", filePath); // Debug: check the file path

  // GitHub API endpoint for uploading the file
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  const payload = {
    message: `Upload ${fileName} to folder ${selectedFolder}`,
    committer: {
      name: 'Nightmare',
      email: 'your_email@example.com' // Replace with your email
    },
    content: base64Content,
    branch: branch
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`, // Use GITHUB_TOKEN directly here
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert(`File uploaded successfully: ${fileName} to folder ${selectedFolder}`);
    } else {
      const errorData = await response.json();
      console.error('Error:', errorData);
      alert(`Failed to upload file: ${errorData.message}`);
    }
  } catch (error) {
    console.error("Upload error:", error);
  }
});

// Helper function to encode file as base64 (handles UTF-8 and other encodings)
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the Data URL prefix ("data:*/*;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
}
