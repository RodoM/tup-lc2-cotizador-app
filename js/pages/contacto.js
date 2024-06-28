emailjs.init({
  publicKey: 'MFQakOTKUeCds7ViI',
});

document.getElementById('contact-form').addEventListener('submit', function(event) {
  event.preventDefault();
  // these IDs from the previous steps
  emailjs.sendForm('service_4jma3ng', 'template_sus24wg', this)
    .then(() => {
        console.log('SUCCESS!');
    }, (error) => {
        console.log('FAILED...', error);
    });
});