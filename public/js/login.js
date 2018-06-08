$(document).ready(function () {
  if (window.location.search == '?invalid=1') {
    $('.login-error').show();
  }
  bind('.mainContainer .loginContainer .form .login-btn', function () {
    var email = $('.mainContainer .loginContainer .form .formInput .input.email').val();
    var pass = $('.mainContainer .loginContainer .form .formInput .input.pass').val();
    console.log(email, ' <--> ', pass);
    $(this).text('Please Wait...');
    if (email != '' && pass != '') {
      execute('api/users/login', {
        email: email,
        password: pass
      }, function (r) {
        if (r.id) {

          $.cookie('_it-api', r.id);
          delete r.id;
          delete r.ttl;
          r.email = email;
          sessionStorage.setItem('_currentUser', JSON.stringify(r));
          window.location.href = window.location.origin + '/dashboard';
        } else {
          window.location.href = window.location.origin + '/dashboard-login?invalid=1';
        }
      }, function () {
        // $.notify('Invalid Email or Password');
        // $.notify('Reloading...');
        // setTimeout(function () {
        window.location.href = window.location.origin + '/dashboard-login?invalid=1';
        //}, 1500)
      })
    } else {
      $.notify('Please enter Email and Password');
    }
  })
})

// {
//   "id": "pBIKlt9Z7eeFK732sFyA4y5nyYMSAYODFcZLrr8kmwYvX0DQqT7CzpRNp87de0gL",
//   "ttl": 1209600,
//   "created": "2018-01-11T21:03:17.704Z",
//   "userId": "5a57c8336b96cc209f3a21ca"
// }
