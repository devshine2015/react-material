function showPopUp(type) {
  return new Promise(function (res) {
    $('.mainContainer .pop-up-container .pop-up .pop-up-header').text(popups[type].header);
    $('.mainContainer .pop-up-container .pop-up .pop-up-area .pop-up-input').attr('placeholder', popups[type].placeholder);
    $('.mainContainer .pop-up-container .pop-up .pop-up-area .pop-up-input').val('')
    if (popups[type].btn1.show) {
      $('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn2').text(popups[type].btn1.text);
    } else {
      $('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn2').show();
    }

    if (popups[type].btn2.show) {
      $('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn1').text(popups[type].btn2.text);
    } else {
      $('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn1').show();
    };

    $('.mainContainer .pop-up-container').show();

    bind('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn2', function () {
      $('.mainContainer .pop-up-container').hide();
      res(false);
    });

    bind('.mainContainer .pop-up-container .pop-up .pop-up-footer .pop-up-btn.btn1', function () {
      var val = $('.mainContainer .pop-up-container .pop-up .pop-up-area .pop-up-input').val();
      var ref = this;
      if (val && val != '') {
        if (popups[type].passwordApproval) {
          $(this).text('Please Wait..');
          execute('api/users/login', {
            email: JSON.parse(sessionStorage.getItem('_currentUser')).email,
            password: val.trim()
          }, function (r) {
            if (r) {
              delete r.id;
              delete r.ttl;
              r.email = JSON.parse(sessionStorage.getItem('_currentUser')).email;
              $('.mainContainer .pop-up-container').hide();
              res(r)
            } else {
              $.notify('Invalid Password');
              $('.mainContainer .pop-up-container .pop-up .pop-up-area .pop-up-input').val('')
            }
          })
        } else {
          $('.mainContainer .pop-up-container').hide();
          res({
            val: val
          });
        }
      }
    })
  })
}


var popups = {
  "rc-input": {
    header: 'Enter New RC Amount',
    placeholder: 'enter amount',
    btn1: {
      show: true,
      text: 'Back'
    },
    btn2: {
      show: true,
      text: 'Next'
    }
  },
  "nrc-input": {
    header: 'Enter New NRC Amount',
    placeholder: 'enter amount',
    btn1: {
      show: true,
      text: 'Back'
    },
    btn2: {
      show: true,
      text: 'Next'
    }
  },
  "approve": {
    header: 'Enter Password to Process',
    placeholder: 'enter password',
    btn1: {
      show: false,
      text: 'Cancel'
    },
    btn2: {
      show: true,
      text: 'Next'
    },
    passwordApproval: true
  }
}
