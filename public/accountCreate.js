/**
 * Account create form behaviour
 */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('accountCreate');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = Array.from(e.currentTarget)
        .reduce((obj, item) => {
          if (item.name) {
            obj[item.name] = item.value;
          }
          return obj;
        }, {});

      console.log(data);

      fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);


    });
  } else {
    console.error('Form not found')
  }
});
