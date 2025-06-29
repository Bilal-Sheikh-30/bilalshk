const mediaInput = document.querySelector('input[name="media"]');
const previewContainer = document.getElementById('media-preview');

mediaInput.addEventListener('change', function () {
    previewContainer.innerHTML = ''; // clear previous previews

    Array.from(this.files).forEach(file => {
        const url = URL.createObjectURL(file);
        let element;

        if (file.type.startsWith('image/')) {
            element = document.createElement('img');
            element.src = url;
            element.style.maxWidth = '200px';
        } else if (file.type.startsWith('video/')) {
            element = document.createElement('video');
            element.src = url;
            element.controls = true;
            element.style.maxWidth = '200px';
        }

        previewContainer.appendChild(element);
    });
});