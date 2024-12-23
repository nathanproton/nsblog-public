function createHeader(isInPostsDirectory) {
    const basePath = isInPostsDirectory ? '../../' : '../';
    
    const headerHtml = `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${basePath}styles.css">
        <link rel="icon" type="image/png" href="${basePath}nas-icon.png">
        <link rel="apple-touch-icon" href="${basePath}nas-icon.png">
        <link rel="shortcut icon" type="image/png" href="${basePath}nas-icon.png">
    </head>
    `;
    
    document.head.innerHTML = headerHtml;
    
    // Preserve the title if it exists
    const existingTitle = document.querySelector('title');
    if (existingTitle) {
        document.head.appendChild(existingTitle);
    }
} 