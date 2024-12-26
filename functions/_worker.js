export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle post pages
    if (url.pathname === '/post.html') {
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return Response.redirect('/', 302);
      }

      try {
        // Fetch post data from your API
        const response = await fetch(`${env.API_BASE}/posts/slug/${slug}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const post = await response.json();
        
        // Read the post.html template
        const htmlResponse = await fetch(new URL('/post.html', request.url));
        let html = await htmlResponse.text();
        
        // Server-side render the content
        html = html.replace('<div id="postTitle"></div>', `<div id="postTitle">${post.title}</div>`);
        html = html.replace('<div id="postMeta"></div>', 
          `<div id="postMeta">${new Date(post.published_at || post.updated_at).toLocaleDateString()}</div>`);
        
        if (post.type === 'gallery') {
          if (post.content && post.content.trim() !== '') {
            html = html.replace('<div id="postContent"></div>', 
              `<div id="postContent">${post.content}</div>`);
          }
          
          // Pre-render gallery items
          const galleryHTML = post.embeds.map(embed => `
            <div class="gallery-item">
              <img src="${embed.url}" alt="${embed.description || ''}" loading="lazy">
            </div>
          `).join('');
          
          html = html.replace('<div id="galleryContainer"></div>', 
            `<div id="galleryContainer" style="display: grid;">${galleryHTML}</div>`);
        } else {
          html = html.replace('<div id="postContent"></div>', 
            `<div id="postContent">${post.content}</div>`);
        }
        
        // Update the page title
        html = html.replace('<title>Post - Nathan Simpson</title>', 
          `<title>${post.title} - Nathan Simpson</title>`);
        
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // For other routes, serve static files as-is
    return env.ASSETS.fetch(request);
  }
} 