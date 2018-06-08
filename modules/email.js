var api_key = '';
var domain = '';
var mailFrom = '';

var mailgun = require('mailgun-js')({
  apiKey: 'key-7951c32e980a2a319c04edf60df3299a',
  domain: 'theitarchitect.support'
});

module.exports = () => {

  // data ->
  // to, subject, text
  function send(data) {
    return new Promise(function (res, rej) {
      var obj = {};
      obj['from'] = 'postmaster@theitarchitect.support';
      obj['subject'] = 'test';
      obj['text'] = 'Test Mail';
      obj['to'] = 'sb4singh@gmail.com';

      mailgun.messages().send(obj, function (error, body) {
        // if (error) {
        //   res(false)
        // } else {
        //   console.log(obj.subject + '  ->  ' + obj.text);
        //   console.log('Email Sent to ' + obj.to);
        //   res(true);
        // }
      });
    })
  }

  send();

  return {
    send: send
  }
}
