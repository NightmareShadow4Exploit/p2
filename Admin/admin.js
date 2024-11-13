document.addEventListener('DOMContentLoaded', function () {
    // Initially hide all sections except the first one
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
        section.style.display = 'none';
    });

    // Function to show a specific section and hide others
    function showSection(sectionId) {
        sections.forEach((section) => {
            // Hide all sections
            section.style.display = 'none';
        });

        // Show the selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }
    }

    // Event listeners for navigation links to show the relevant section
    const navLinks = document.querySelectorAll('.horizontal-nav a');
    navLinks.forEach((link) => {
        link.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default anchor behavior

            const sectionId = link.getAttribute('href').substring(1); // Get section ID from href (e.g., #section1)
            showSection(sectionId);
        });
    });

    // Show the first section by default
    showSection('section1');
});
