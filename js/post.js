let lightbox = null;

document.addEventListener('DOMContentLoaded', () => {
  loadPost();
});

async function loadPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    window.location.href = '/';
    return;
  }

  try {
    console.log('Fetching post data for slug:', slug);
    const response = await fetch(`${API_BASE}/posts/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const post = await response.json();
    console.log('Post data received:', post);

    // Set post title and metadata
    document.title = `${post.title} - Nathan Simpson`;
    document.getElementById('postTitle').textContent = post.title;
    document.getElementById('postMeta').textContent = new Date(post.published_at || post.updated_at).toLocaleDateString();

    // Clear any existing content
    document.getElementById('postContent').innerHTML = '';
    document.getElementById('galleryContainer').innerHTML = '';

    // Handle different post types
    if (post.type === 'gallery') {
      console.log('Setting up gallery with embeds:', post.embeds);
      if (post.embeds && Array.isArray(post.embeds) && post.embeds.length > 0) {
        // Show post content if it exists
        if (post.content && post.content.trim() !== '') {
          document.getElementById('postContent').innerHTML = post.content;
          document.getElementById('postContent').style.display = 'block';
        } else {
          document.getElementById('postContent').style.display = 'none';
        }

        // Setup gallery
        await setupGallery(post.embeds);
        document.getElementById('galleryContainer').style.display = 'grid';
      } else {
        console.log('No embeds found for gallery post');
        document.getElementById('postContent').innerHTML = post.content || '<p>No images found in this gallery.</p>';
        document.getElementById('galleryContainer').style.display = 'none';
      }
    } else {
      console.log('Rendering regular post content');
      document.getElementById('galleryContainer').style.display = 'none';
      document.getElementById('postContent').style.display = 'block';
      document.getElementById('postContent').innerHTML = post.content;
    }
  } catch (error) {
    console.error('Error loading post:', error);
    document.getElementById('postContent').innerHTML = `<p>Error loading post: ${error.message}</p>`;
    document.getElementById('galleryContainer').style.display = 'none';
  }
}

async function setupGallery(embeds) {
  console.log('Setting up gallery with embeds:', embeds);
  const galleryContainer = document.getElementById('galleryContainer');
  
  // Create gallery items
  const imageLoadPromises = embeds.map(embed => {
    console.log('Processing embed:', embed);
    return new Promise((resolve, reject) => {
      const galleryItem = document.createElement('a');
      const fullUrl = `https://cdn.nasimpson.com/${embed.path}`;
      galleryItem.href = fullUrl;
      galleryItem.className = 'gallery-item';
      
      console.log('Creating image with URL:', fullUrl);
      
      // Create thumbnail
      const img = document.createElement('img');
      img.src = fullUrl;
      img.alt = embed.name || '';
      img.className = 'gallery-thumbnail';
      
      // Wait for image to load to get dimensions
      img.onload = function() {
        console.log('Image loaded:', fullUrl);
        galleryItem.dataset.pswpWidth = this.naturalWidth;
        galleryItem.dataset.pswpHeight = this.naturalHeight;
        
        // Add metadata for PhotoSwipe
        if (embed.name) galleryItem.dataset.title = embed.name;
        if (embed.caption) galleryItem.dataset.caption = embed.caption;
        
        // Add caption if exists
        if (embed.caption) {
          const caption = document.createElement('div');
          caption.className = 'gallery-caption';
          caption.textContent = embed.caption;
          galleryItem.appendChild(caption);
        }
        
        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);
        resolve();
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', fullUrl);
        reject(new Error(`Failed to load image: ${embed.path}`));
      };
    });
  });

  // Wait for all images to load
  try {
    await Promise.all(imageLoadPromises);
    console.log('All gallery images loaded');
    
    // Initialize PhotoSwipe
    lightbox = new PhotoSwipe.Lightbox({
      gallery: '#galleryContainer',
      children: 'a',
      pswpModule: PhotoSwipe,
      showHideAnimationType: 'fade',
      
      // Custom options
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
      bgOpacity: 0.9,
      
      // Customize the caption
      ui: {
        caption: {
          type: 'auto'
        }
      }
    });

    // Add custom caption
    lightbox.on('uiRegister', function() {
      lightbox.pswp.ui.registerElement({
        name: 'custom-caption',
        order: 9,
        isButton: false,
        appendTo: 'root',
        html: 'Caption text',
        onInit: (el, pswp) => {
          lightbox.pswp.on('change', () => {
            const currSlideElement = lightbox.pswp.currSlide.data.element;
            let captionHTML = '';
            
            if (currSlideElement.dataset.title) {
              captionHTML += `<div class="pswp__caption__title">${currSlideElement.dataset.title}</div>`;
            }
            if (currSlideElement.dataset.caption) {
              captionHTML += `<div class="pswp__caption__text">${currSlideElement.dataset.caption}</div>`;
            }
            
            el.innerHTML = captionHTML;
          });
        }
      });
    });

    // Initialize the lightbox
    lightbox.init();
    console.log('PhotoSwipe initialized');
  } catch (error) {
    console.error('Error setting up gallery:', error);
    galleryContainer.innerHTML = '<p>Error loading gallery images.</p>';
  }
} 