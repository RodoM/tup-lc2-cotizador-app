emailjs.init({
  publicKey: 'MFQakOTKUeCds7ViI',
});

function enviarMensaje() {
  const name = document.getElementById('name');
  name.style.border = '1px solid transparent';
  if (!name.value) {
    name.style.border = '1px solid red';
  }

  const email = document.getElementById('email');
  email.style.border = '1px solid transparent';
  if (!validarEmail(email.value)) {
    email.style.border = '1px solid red';
  }

  const message = document.getElementById('message');
  message.style.border = '1px solid transparent';
  if (!message.value) {
    message.style.border = '1px solid red';
  }

  if (name.value && validarEmail(email.value) && message.value) {
    const parametros = {
      from_name: name.value,
      user_email: email.value,
      message: message.value,
    };

    emailjs.send('service_4jma3ng', 'template_sus24wg', parametros)
      .then(() => {
          console.log('SUCCESS!');
      }, (error) => {
          console.log('FAILED...', error);
      });

    name.style.border = '1px solid transparent';
    email.style.border = '1px solid transparent';
    message.style.border = '1px solid transparent';
  }
}