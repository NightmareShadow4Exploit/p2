document.addEventListener('DOMContentLoaded', () => {
    // GitHub API settings
    const githubRepo = 'NightmareShadow4Exploit/p2';
    const jsonFile = 'bookjson.json';

    const token1 = "ghp_0cO03kopAEZoa";
    const token2 = "3Abprg4X7ETgu1UGl3HZswy";

    const token = `${token1}${token2}`;

    // Function to fetch JSON file from GitHub
    async function fetchJSON() {
        const url = `https://api.github.com/repos/${githubRepo}/contents/${jsonFile}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();
        const jsonContent = atob(data.content); // Decode Base64 content
        return JSON.parse(jsonContent);
    }

    // Function to create navbar dynamically, sorted by recent updates
    async function createNavbar() {
        const data = await fetchJSON();
        const navbar = document.getElementById('navbar');

        // Sort folders by recent updates (if available)
        const sortedFolders = data.folders.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        sortedFolders.forEach(folder => {
            const link = document.createElement('a');
            link.textContent = folder.name;
            link.href = '#';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                fetchFolderImages(folder.name); // Fetch images for the clicked folder
            });
            navbar.appendChild(link);
        });

        // Fetch all images by default on page load (if no section clicked)
        fetchAllImages(); // Automatically fetch all images from all folders
    }

    // Function to fetch all images across all folders
    async function fetchAllImages() {
        const data = await fetchJSON();
        const allFiles = [];

        // Fetch files from each folder
        for (const folder of data.folders) {
            const folderFiles = await fetchFolderImages(folder.name);
            allFiles.push(...folderFiles); // Add files to the allFiles array
        }

        // Sort the files by date (most recent first)
        const sortedFiles = allFiles
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        // Display the files
        displayFiles(sortedFiles);
    }

    // Function to fetch images for a specific folder
    async function fetchFolderImages(folderName) {
        const url = `https://api.github.com/repos/${githubRepo}/contents/${folderName}`;
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${folderName}: ${response.statusText}`);
            }

            const files = await response.json();

            // Check if files is an array before filtering
            if (Array.isArray(files)) {
                // Filter only image files (jpg, jpeg, png)
                const imageFiles = files.filter(file => file.type === 'file' && /\.(jpg|jpeg|png)$/i.test(file.name));
                
                // Clear the gallery before showing new images
                displayFiles(imageFiles);
                return imageFiles;
            } else {
                console.error(`Expected an array of files for folder: ${folderName}`);
                return [];
            }
        } catch (error) {
            console.error(`Error fetching folder ${folderName}:`, error);
            return [];
        }
    }

    // Function to display images in the gallery
    function displayFiles(files) {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = ''; // Clear the gallery

        if (files.length === 0) {
            gallery.innerHTML = '<p>No images found in this folder.</p>';
        }

        files.forEach(file => {
            const img = document.createElement('img');
            img.src = file.download_url;
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => showFullImage(file.download_url));
            gallery.appendChild(img);
        });
    }

    // Initialize the navbar and fetch all images
    createNavbar();

    // Function to show the full image when clicked
    function showFullImage(imageUrl) {
        // Hide all elements except the full-screen view
        document.body.childNodes.forEach(node => {
            if (node.id !== 'full-screen-view' && node.style) {
                node.style.display = 'none';
            }
        });

        const fullScreenView = document.getElementById('full-screen-view');
        const fullImage = document.getElementById('full-image');
        const controls = document.getElementById('controls');
        const downloadBtn = document.getElementById('download-btn');
        const shareBtn = document.getElementById('share-btn');

        // Set image source
        fullImage.src = imageUrl;

        // Show full-screen view
        fullScreenView.style.display = 'flex';

        // Adjust button position based on image aspect ratio
        fullImage.onload = () => {
            const isPortrait = fullImage.naturalHeight > fullImage.naturalWidth;
            controls.classList.toggle('flex-column', isPortrait);
        };

        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.setAttribute('download', imageUrl.split('/').pop());
        
            // Check if the URL is from GitHub, and if so, fetch the image data before triggering download
            if (imageUrl.startsWith('https://raw.githubusercontent.com/')) {
                fetch(imageUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(error => {
                        console.error('Download failed:', error);
                    });
            } else {
                // If the image is not from GitHub, just trigger download directly
                a.click();
            }
        };
        
        // Share button functionality
        shareBtn.onclick = async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Image',
                        text: 'Check out this image!',
                        url: imageUrl
                    });
                } catch (err) {
                    alert('Share failed: ' + err.message);
                }
            } else {
                alert('Sharing not supported on this browser.');
            }
        };
    }

    // Close the full-screen view and restore the page content
    document.getElementById('full-screen-view').addEventListener('click', (e) => {
        if (e.target.id === 'full-screen-view') {
            // Hide full-screen view
            e.target.style.display = 'none';

            // Restore all elements
            document.body.childNodes.forEach(node => {
                if (node.id !== 'full-screen-view' && node.style) {
                    node.style.display = '';
                }
            });
        }
    });

    // Toggle navbar open/close
    const toggleBtn = document.getElementById('toggle-btn');
    const navbarContainer = document.getElementById('navbar-container');

    toggleBtn.addEventListener('click', () => {
        const isClosed = navbarContainer.classList.toggle('closed');
        toggleBtn.textContent = isClosed ? '☰' : '✖';
    });

    // Toggle theme between light and dark mode
    document.querySelector('.toggle-theme').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Scroll progress bar functionality
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        document.querySelector('.scroll-progress').style.width = `${scrolled}%`;
    });
});
