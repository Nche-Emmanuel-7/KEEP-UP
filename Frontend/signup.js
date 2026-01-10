document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault(); //stops redirection

    registerUser();
});
function registerUser() {
    const full_name = document.getElementById('full_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( {
            full_name: full_name,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    });
}
