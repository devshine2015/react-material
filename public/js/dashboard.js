function dashboard() {
  console.log('--->>> Initializing Dashboard');
  $('.mainContainer .dashboard .header').html('Dashboard<span class="sub-text">View all Sales</span>');
  $('.mainContainer .menus .menu .text i.active').removeClass('active');
  $('[data-id=dashboard] i').addClass('active');
  loader('s', 'Please wait while dashboard is loading data...');
  execute('getDashboardData', {
    "cux": "verizon"
  }, function (data) {
    if (data) {
      console.log(data);
      var _d = processData(data);
      _g._d = _d;
      console.log(_d);
      render('.dashboard', 'dashboard', _d);
      renderCharts();
      bindDownloads();
      
      bind('.mainContainer .dashboard .sales .usersContainer .ucHeader .filter.week', function () {
        $('.mainContainer .dashboard .sales .usersContainer .ucHeader .filter').removeClass('selected');
        $(this).addClass('selected');
        _g.susers = _g._d.users.tw;
        renderUsers(_g._d.users.tw);
      })
      
      bind('.mainContainer .dashboard .sales .usersContainer .ucHeader .filter.month', function () {
        $('.mainContainer .dashboard .sales .usersContainer .ucHeader .filter').removeClass('selected');
        $(this).addClass('selected');
        _g.susers = _g._d.users.tm;
        renderUsers(_g._d.users.tm);
      });
      
      bind('.mainContainer .dashboard .header .sub-text', function () {
        sales();
      })
      
      $('.mainContainer .dashboard .sales .usersContainer .ucHeader .filter.week').trigger(eventToUse);
      
      // start searching
      $('.mainContainer .dashboard .sales .usersContainer .ucHeader .search').keyup(function () {
        try {
          var val = $(this).val().trim().toLowerCase();
          console.log('---> ' + val);
          if (val == '') {
            renderUsers(_g.susers)
          } else {
            var t = _g.susers.filter(function (el) {
              return el.name.toLowerCase().includes(val) || el.phone.includes(val);
            });
            
            if (t == undefined)
              t = [];
            renderUsers(t);
          }
        } catch (err) {
          console.log(err);
          renderUsers(_g.susers)
        }
      })
    } else {
      loader('e', 'Can not connect to server');
    }
  })
  
}

function bindDownloads() {
  bind('.mainContainer .dashboard .reports .report .buttons .button.download', function () {
    var type = $(this).parent().data('id');
    console.log('download --> ' + type);
    switch (type) {
      case 'mts':
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + parseInt(moment().format('YYYYMM')) + '&access_token=' + access_token);
        break;
      case 'qts':
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + 0 + '&access_token=' + access_token);
        break;
      case 'ats':
        window.open(appUrl + 'api/get_sales/downloadAccessorySales/{month}?nMonth=' + parseInt(moment().format('YYYYMM')) + '&access_token=' + access_token);
        break
      case 'qas':
        window.open(appUrl + 'api/get_sales/downloadAccessorySales/{month}?nMonth=' + 0 + '&access_token=' + access_token);
        break;
    }
  })
  
  bind('.mainContainer .dashboard .reports .report .buttons .button.email', function () {
    var type = $(this).parent().data('id');
    console.log('email --> ' + type);
  });
  
  
  bind('.mainContainer .dashboard .reports .downloadAll', function () {
    $.notify('Please wait...', 'info');
    $.notify('Allow Pop Ups to download multiple request', 'info');
    setTimeout(function () {
      window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + parseInt(moment().format('YYYYMM')) + '&access_token=' + access_token);
      setTimeout(function () {
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + 0 + '&access_token=' + access_token);
      }, 500)
      setTimeout(function () {
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + parseInt(moment().format('YYYYMM')) + '&access_token=' + access_token);
      }, 1000)
      setTimeout(function () {
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + 0 + '?access_token=' + access_token);
      }, 1500)
    }, 5000);
  })
}

function renderUsers(d) {
  render('.mainContainer .dashboard .sales .usersContainer .users', 'user', d);
}

var weeks = [];

function renderCharts() {
  Chart.defaults.global.elements.line.fill = false;
  for (var i = 1; i <= _g._d.totalSales.cd.length; i++) {
    weeks.push(i);
  }
  
  Chart.Scale.prototype.buildYLabels = function () {
    this.yLabelWidth = 0;
  };
  
  var bar_ctx = document.getElementById("first").getContext('2d');
  var gradient = bar_ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, '#4e0308');
  gradient.addColorStop(1, '#91050f');
  
  try {
    new Chart(document.getElementById("first"), {
      type: 'line',
      data: {
        labels: weeks.slice(0, 10),
        datasets: [{
          data: _g._d.totalSales.cd.slice(0, 10),
          backgroundColor: gradient,
          fill: 'start'
        }]
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: "white"
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks',
              fontColor: "white"
            },
            ticks: {
              fontColor: "white",
              fontSize: 10
            }
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: 'white'
            },
            scaleLabel: {
              display: true,
              labelString: 'Sales',
              fontColor: "white"
            },
            position: 'left',
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              userCallback: function (tick) {
                return '$ ' + parseInt(tick).toString();
              },
              fontColor: "white",
              fontSize: 10
            }
          }]
        },
        plugins: {
          filler: {
            propagate: false
          }
        },
        legend: {
          display: false
        },
        title: {},
        elements: {
          arc: {},
          point: {
            radius: 0,
            borderWidth: 1
          },
          line: {
            tension: 1,
            borderWidth: 1,
          },
          rectangle: {},
        },
        tooltips: {},
        hover: {},
      }
    });
  } catch (e) {
  
  }
  try {
    new Chart(document.getElementById("second"), {
      type: 'line',
      data: {
        labels: weeks.slice(0, 10),
        datasets: [{
          data: _g._d.accessorySales.cd.slice(0, 10),
          backgroundColor: gradient,
          fill: 'start'
        }]
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            stacked: false,
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: "white"
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks',
              fontColor: "white"
            },
            ticks: {
              fontColor: "white",
              fontSize: 10
            }
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: 'white'
            },
            scaleLabel: {
              display: true,
              labelString: 'Sales',
              fontColor: "white"
            },
            position: 'left',
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              userCallback: function (tick) {
                return '$ ' + parseInt(tick).toString();
              },
              fontColor: "white",
              fontSize: 10
            }
          }]
        },
        plugins: {
          filler: {
            propagate: false
          }
        },
        legend: {
          display: false
        },
        title: {},
        elements: {
          arc: {},
          point: {
            radius: 0,
            borderWidth: 1
          },
          line: {
            tension: 1,
            borderWidth: 1,
          },
          rectangle: {},
        },
        tooltips: {},
        hover: {},
      }
    });
  } catch (e) {
  
  }
  
  try {
    
    new Chart(document.getElementById("third"), {
      type: 'line',
      data: {
        labels: weeks.slice(0, 10),
        datasets: [{
          data: _g._d.devicesales.cd.slice(0, 10),
          backgroundColor: gradient,
          fill: 'start'
        }]
      },
      options: {
        responsive: false,
        scales: {
          xAxes: [{
            stacked: false,
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: "white"
            },
            scaleLabel: {
              display: true,
              labelString: 'Weeks',
              fontColor: "white"
            },
            ticks: {
              fontColor: "white",
              fontSize: 10
            }
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: 'white'
            },
            scaleLabel: {
              display: true,
              labelString: 'Sales',
              fontColor: "white"
            },
            position: 'left',
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              userCallback: function (tick) {
                return '$ ' + parseInt(tick).toString();
              },
              fontColor: "white",
              fontSize: 10
            }
          }]
        },
        plugins: {
          filler: {
            propagate: false
          }
        },
        legend: {
          display: false
        },
        title: {},
        elements: {
          arc: {},
          point: {
            radius: 0,
            borderWidth: 1
          },
          line: {
            tension: 1,
            borderWidth: 1,
          },
          rectangle: {},
        },
        tooltips: {},
        hover: {},
      }
    });
  } catch (e) {
  
  }
  try {
    var bar_ctx = document.getElementById("fourth").getContext('2d');
    var gradient1 = bar_ctx.createLinearGradient(0, 0, 0, 100);
    gradient1.addColorStop(0, '#4e0308');
    gradient1.addColorStop(1, '#91050f');
    
    new Chart(document.getElementById("fourth"), {
      type: 'bar',
      data: {
        labels: weeks.slice(0, 10),
        datasets: [{
          data: _g._d.totalSales.cd.slice(0, 10),
          backgroundColor: gradient1,
          hoverBackgroundColor: gradient1,
          fill: 'start'
        }]
      },
      options: {
        responsive: true,
        scaleShowLabels: false,
        scales: {
          xAxes: [{
            stacked: false,
            display: true,
            gridLines: {
              display: false,
              drawBorder: true,
              color: "black",
              offsetGridLines: true
            },
            ticks: {
              userCallback: function(tick) {
                return 'Product Name '
              },
              fontColor: "black",
              fontSize: 10
            }
          }],
          yAxes: [{
            type: 'linear',
            display: true,
            gridLines: {
              display: true,
              drawBorder: true,
              color: 'black'
            },
            ticks: {
              beginAtZero: true,
              stepSize: 2,
              userCallback: function(tick) {
                return '$ ' + parseInt(tick).toString();
              },
              fontColor: "black",
              fontSize: 10
            }
          }]
        },
        plugins: {
          datalabels: {
            display: true
          },
        },
        legend: {
          display: false
        },
        title: {},
        elements: {
          arc: {},
          point: {
            radius: 0,
            borderWidth: 0,
          },
          line: {
            tension: 1,
            borderWidth: 5,
          },
          rectangle: {},
        },
        tooltips: {},
        hover: {},
      }
    });
  } catch (e) {
  
  }
  // new Chart(document.getElementById("second"), {
  //   type: 'line',
  //   data: {
  //     labels: weeks,
  //     datasets: [{
  //       data: _g._d.accessorySales.cd,
  //       borderColor: "gary",
  //       backgroundColor: 'gray',
  //       color: 'gray',
  //       fill: 'start',
  //       label: 'Accessory'
  //     }]
  //   },
  //   options: {
  //     title: {
  //       display: false,
  //       text: 'World population per region (in millions)'
  //     }
  //   }
  // });
  
  // new Chart(document.getElementById("third"), {
  //   type: 'line',
  //   data: {
  //     labels: weeks,
  //     datasets: [{
  //       data: _g._d.devicesales.cd,
  //       borderColor: "black",
  //       backgroundColor: 'black',
  //       color: 'black',
  //       fill: 'start',
  //       label: 'Device'
  //     }]
  //   },
  //   options: {
  //     title: {
  //       display: false,
  //       text: 'World population per region (in millions)'
  //     }
  //   }
  // });
  
  bind('.mainContainer .dashboard .charts .chart .download', function () {
    var id = $(this).data('id');
    switch (id) {
      case 't':
        window.open(appUrl + 'api/get_sales/downloadCSV/{month}?nMonth=' + 1 + '&access_token=' + access_token);
        break;
      case 'a':
        window.open(appUrl + 'api/get_sales/downloadAccessorySales/{month}?nMonth=' + 1 + '&access_token=' + access_token);
        break;
      case 'd':
        window.open(appUrl + 'api/get_sales/downloadDeviceSales/{month}?nMonth=' + 1 + '&access_token=' + access_token);
        break;
    }
  })
}


function loader(type, text) {
  if (text == undefined)
    text = 'Please wait while dashboard is loading data...';
  switch (type) {
    case 's':
      render('.dashboard', 'loader', {
        text: text,
        icon: 'pulse.png'
      });
      break;
    case 'h':
      break;
    case 'e':
      render('.dashboard', 'loader', {
        text: text,
        icon: 'icon-nc.png'
      });
      break;
  }
}

function processData(d) {
  var _d = {};
  for (var key in d) {
    switch (key) {
      case 'accessorySales':
        try {
          var t = 0;
          var cd = [];
          var w = {};
          d['accessorySales'].forEach(function (el) {
            t = t + el.nrc + el.rc;
            w[el._id] = el.nrc + el.rc;
          });
          for (var i = 1; i <= weeksInYear(new Date().getFullYear()); i++) {
            s = w[i];
            cd.push(s == undefined ? 0 : s);
          }
          _d['accessorySales'] = {
            t: t.toFixed(2),
            cd: cd
          };
        } catch (e) {
          console.log(e)
          _d['accessorySales'] = {}
        }
        break;
      case 'accressoryST':
        try {
          var diff = 0;
          var tm = 0;
          var lm = 0;
          var _s;
          d['accressoryST'].forEach(function (el) {
            if (el._id.toString().slice(-2) == (new Date().getMonth() + 1)) {
              tm = el.total;
            } else {
              lm = el.total
            }
          });
          diff = Math.abs(tm - lm);
          tm >= lm ? _s = 'up' : _s = 'down';
          var p;
          if (tm == 0 && lm == 0)
            p = 0;
          else
            p = ((tm - lm) / lm) * 100;
          if (p == Infinity)
            p = 100 * tm;
          _d['accressoryST'] = {
            diff: diff,
            tm: tm,
            _s: _s,
            p: p
          }
        } catch (e) {
          _d['accressoryST'] = {}
        }
        break;
      case 'devicesales':
        try {
          var t = 0;
          var cd = [];
          var w = {};
          d['devicesales'].forEach(function (el) {
            t = t + el.nrc + el.rc;
            w[el._id] = el.nrc + el.rc;
          });
          for (var i = 1; i <= weeksInYear(new Date().getFullYear()); i++) {
            s = w[i];
            cd.push(s == undefined ? 0 : s);
          }
          _d['devicesales'] = {
            t: t.toFixed(2),
            cd: cd
          };
        } catch (e) {
          console.log(e);
          _d['devicesales'] = {}
        }
        break;
      case 'newST':
        try {
          var diff = 0;
          var tm = 0;
          var lm = 0;
          var _s;
          d['newST'].forEach(function (el) {
            if (el._id.toString().slice(-2) == (new Date().getMonth() + 1)) {
              tm = el.total;
            } else {
              lm = el.total
            }
          });
          diff = Math.abs(tm - lm);
          tm >= lm ? _s = 'up' : _s = 'down';
          var p;
          if (tm == 0 && lm == 0)
            p = 0;
          else
            p = ((tm - lm) / lm) * 100;
          if (p == Infinity)
            p = 100 * tm;
          _d['newST'] = {
            diff: diff,
            tm: tm,
            _s: _s,
            p: p
          }
        } catch (e) {
          _d['newST'] = {}
        }
        break;
      case 'totalSales':
        try {
          var t = 0;
          var cd = [];
          var w = {};
          d['totalSales'].forEach(function (el) {
            t = t + el.nrc + el.rc;
            w[el._id] = el.nrc + el.rc;
          });
          for (var i = 1; i <= weeksInYear(new Date().getFullYear()); i++) {
            s = w[i];
            cd.push(s == undefined ? 0 : s);
          }
          _d['totalSales'] = {
            t: t.toFixed(2),
            cd: cd
          };
        } catch (e) {
          console.log(e);
          _d['totalSales'] = {}
        }
        break;
      case 'upgradeST':
        try {
          var diff = 0;
          var tm = 0;
          var lm = 0;
          var _s;
          d['upgradeST'].forEach(function (el) {
            if (el._id.toString().slice(-2) == (new Date().getMonth() + 1)) {
              tm = el.total;
            } else {
              lm = el.total
            }
          });
          diff = Math.abs(tm - lm);
          tm >= lm ? _s = 'up' : _s = 'down';
          var p;
          if (tm == 0 && lm == 0)
            p = 0;
          else
            p = ((tm - lm) / lm) * 100;
          if (p == Infinity)
            p = 100 * tm;
          _d['upgradeST'] = {
            diff: diff,
            tm: tm,
            _s: _s,
            p: p
          }
        } catch (e) {
          _d['upgradeST'] = {}
        }
        break;
      case 'users':
        try {
          var tm = [];
          var tw = [];
          d['users'].forEach(function (el) {
            var u = {};
            u.name = el.requestor;
            u.phone = el._id;
            u.s = 0;
            u.l = u.name.match(/\b(\w)/g).join('')
            el.nrc.forEach(function (el1) {
              u.s = u.s + (1 * el1.toString().replace('$', ''));
            });
            el.rc.forEach(function (el1) {
              u.s = u.s + (1 * el1.toString().replace('$', ''));
            });
            
            u.s = u.s.toFixed(2);
            if (el.nWeek == (new Date()).getWeek()) {
              tw.push(u);
            }
            tm.push(u);
          });
          _d['users'] = {
            tm: tm,
            tw: tw
          }
        } catch (e) {
          console.log(e);
          _d['users'] = {}
        }
        break;
    }
  }
  ;
  return _d;
}

Date.prototype.getWeek = function () {
  return moment(this).isoWeek();
}

function weeksInYear(year) {
  var month = 11,
    day = 31,
    week;
  do {
    d = new Date(year, month, day--);
    week = getWeekNumber(d)[1];
  } while (week == 1);
  
  return week;
}

function getWeekNumber(d) {
  d = new Date(+d);
  d.setHours(0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  var yearStart = new Date(d.getFullYear(), 0, 1);
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return [d.getFullYear(), weekNo];
}
