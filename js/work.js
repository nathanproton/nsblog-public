const API_BASE = "https://blog-api.nasimpson.workers.dev";

async function loadWork() {
    try {
        const response = await fetch(`${API_BASE}/public/work`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const workItems = await response.json();
        workItems.sort((a, b) => b.year - a.year);
        renderWorkList(workItems);
    } catch (error) {
        console.error('Error loading work:', error);
    }
}

function renderWorkList(workItems) {
    const workList = document.querySelector('.work-list');
    workList.innerHTML = ''; // Clear existing content
    
    workItems.forEach(item => {
        const workItem = document.createElement('div');
        workItem.className = 'work-item';
        
        // If URL exists, make the entire item clickable
        if (item.url) {
            workItem.dataset.url = item.url;
            workItem.onclick = () => window.open(item.url, '_blank', 'noopener,noreferrer');
        }
        
        workItem.innerHTML = `
            <span class="work-title">${item.name}</span>
            <span class="work-description">${item.organization || ''}</span>
            <span class="work-role">${item.role || ''}</span>
            <span class="work-year">${item.year}</span>
        `;
        
        workList.appendChild(workItem);
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadWork); 