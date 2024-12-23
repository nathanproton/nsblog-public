const components = {
    header: (isInPostsDirectory) => {
        const basePath = isInPostsDirectory ? '../../' : '../';
        return `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="style.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@5.3.8/dist/photoswipe.css">
            <script src="https://cdn.jsdelivr.net/npm/photoswipe@5.3.8/dist/umd/photoswipe.umd.min.js"></script>
            <link rel="icon" type="image/png" href="${basePath}nas-icon-198x198.png">
            <link rel="apple-touch-icon" href="${basePath}nas-icon-198x198.png">
            <link rel="shortcut icon" type="image/png" href="${basePath}nas-icon-198x198.png">
        `;
    },
    
    navigation: (isInPostsDirectory) => {
        const basePath = isInPostsDirectory ? '../../' : '../';
        return `
            <nav>
                <ul>
                    <li><a href="${basePath}index.html">Writing</a></li>
                    <li><a href="${basePath}about.html">About</a></li>
                    <li><a href="${basePath}work.html">Work</a></li>
                </ul>
            </nav>
        `;
    }
};

function initializePage(isInPostsDirectory) {
    // Initialize header
    document.head.innerHTML += components.header(isInPostsDirectory);
    
    // Preserve the title if it exists
    const existingTitle = document.querySelector('title');
    if (existingTitle) {
        document.head.appendChild(existingTitle);
    }
    
    // Initialize navigation
    const navContainer = document.querySelector('body');
    navContainer.insertAdjacentHTML('afterbegin', components.navigation(isInPostsDirectory));
}

function displayPost(post) {
    const postContent = document.querySelector('.post-content');
    
    if (post.type === 'gallery') {
        // Extract images from content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content;
        const images = Array.from(tempDiv.getElementsByTagName('img'));
        
        // Display text content without images
        images.forEach(img => img.remove());
        postContent.innerHTML = tempDiv.innerHTML;

        // Create gallery section
        const gallery = document.createElement('div');
        gallery.className = 'gallery';
        
        images.forEach((img, index) => {
            const galleryItem = document.createElement('a');
            galleryItem.className = 'gallery-item';
            galleryItem.href = img.src;
            galleryItem.dataset.pswpWidth = img.naturalWidth || 1200;
            galleryItem.dataset.pswpHeight = img.naturalHeight || 800;
            galleryItem.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
            gallery.appendChild(galleryItem);
        });
        
        postContent.appendChild(gallery);
        
        // Initialize PhotoSwipe
        initPhotoSwipe('.gallery');
    } else if (post.type === 'post') {
        postContent.innerHTML = post.content;
    } else if (post.type === 'pdf') {
        postContent.innerHTML = post.content;
    }
}

function initPhotoSwipe(gallerySelector) {
    const gallery = document.querySelector(gallerySelector);
    const items = Array.from(gallery.querySelectorAll('a')).map(anchor => ({
        src: anchor.href,
        width: parseInt(anchor.dataset.pswpWidth, 10),
        height: parseInt(anchor.dataset.pswpHeight, 10),
        alt: anchor.querySelector('img').alt
    }));

    gallery.addEventListener('click', (e) => {
        e.preventDefault();
        const clickedItem = e.target.closest('a');
        if (!clickedItem) return;

        const options = {
            gallery: gallery,
            children: 'a',
            pswpModule: PhotoSwipe
        };

        const lightbox = new PhotoSwipe(options);
        const index = Array.from(gallery.children).indexOf(clickedItem);
        lightbox.init();
        lightbox.loadAndOpen(index);
    });
} 