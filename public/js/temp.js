function renderCharts() {
  for (var i = 1; i <= _g._d.totalSales.cd.length; i++) {
    weeks.push('W ' + i);
  }
  // Highcharts.chart('first', {
  //   chart: {
  //     type: 'area'
  //   },
  //   title: {
  //     text: ''
  //   },
  //   xAxis: {
  //     allowDecimals: false,
  //     labels: {
  //       formatter: function () {
  //         return this.value; // clean, unformatted number for year
  //       }
  //     }
  //   },
  //   yAxis: {
  //     title: {
  //       text: 'Total Sale'
  //     },
  //     labels: {
  //       formatter: function () {
  //         return this.value / 1000 + 'k';
  //       }
  //     }
  //   },
  //   tooltip: {
  //     pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/> in week {point.x}'
  //   },
  //   plotOptions: {
  //     area: {
  //       pointStart: 1,
  //       marker: {
  //         enabled: false,
  //         symbol: 'circle',
  //         radius: 2,
  //         states: {
  //           hover: {
  //             enabled: true
  //           }
  //         }
  //       },
  //       color: 'red'
  //     }
  //   },
  //   series: [{
  //     name: 'Total Sales',
  //     data: _g._d.totalSales.cd
  //   }]
  // })

  $('#first').highcharts({
    exporting: {
      enabled: false
    },
    chart: {
      renderTo: 'container',
      backgroundColor: 'rgba(0,0,0,0)',
      plotBorderColor: 'rgb(0,0,0)',
      borderColor: 'rgb(0,0,0)',
      alignTicks: false,
      plotBackgroundColor: 'blue',
      plotBackgroundImage: null,
      selectionMarkerFill: 'rgb(150, 27, 27)',
      style: {
        color: 'rgb(150, 27, 27)'
      }
    },
    title: {
      text: ''
    },

    xAxis: {
      categories: weeks,
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickmarkPlacement: 'on',
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0,
      tickLength: 0,
      align: "left",
      type: 'area',
      title: {
        text: ''
      },
      labels: {
        enabled: true,
        style: {
          color: 'rgb(150, 27, 27)'
        }
      },

    },

    yAxis: {
      gridLineWidth: 0,
      tickInterval: 5,
      labels: {
        enabled: false,
        style: {
          color: 'rgb(150, 27, 27)'
        }
      },
      minorGridLineWidth: 0,
      title: {
        text: ''
      }
    },

    tooltip: {
      crosshairs: false,
      shared: true
    },

    legend: {},
    series: [{
      name: ' ',
      data: _g._d.totalSales.cd,
      zIndex: 1,
      color: 'rgb(150, 27, 27)',
      marker: {
        fillColor: 'rgb(150, 27, 27)',
        lineWidth: 2,
        lineColor: Highcharts.getOptions().colors[0]
      }
    }, {
      name: 'Range',
      data: _g._d.totalSales.cd,
      type: 'area',
      lineWidth: 0,
      color: 'rgb(150, 27, 27)',
      linkedTo: ':previous',
      color: Highcharts.getOptions().colors[0],
      fillOpacity: 0.3,
      zIndex: 0
    }]
  });

  Highcharts.chart('second', {
    chart: {
      type: 'area'
    },
    title: {
      text: ''
    },
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function () {
          return this.value; // clean, unformatted number for year
        }
      }
    },
    yAxis: {
      title: {
        text: 'Accessory Sale'
      },
      labels: {
        formatter: function () {
          return this.value / 1000 + 'k';
        }
      }
    },
    tooltip: {
      pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/> in week {point.x}'
    },
    plotOptions: {
      area: {
        pointStart: 1,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        },
        color: 'yellow'
      }
    },
    series: [{
      name: 'Accessory Sales',
      data: _g._d.accessorySales.cd
    }]
  })

  Highcharts.chart('third', {
    chart: {
      type: 'area'
    },
    title: {
      text: ''
    },
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function () {
          return this.value; // clean, unformatted number for year
        }
      }
    },
    yAxis: {
      title: {
        text: 'Device Sale'
      },
      labels: {
        formatter: function () {
          return this.value / 1000 + 'k';
        }
      }
    },
    tooltip: {
      pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/> in week {point.x}'
    },
    plotOptions: {
      area: {
        pointStart: 1,
        marker: {
          enabled: false,
          symbol: 'circle',
          radius: 2,
          states: {
            hover: {
              enabled: true
            }
          }
        },
        color: 'black'
      }
    },
    series: [{
      name: 'Device Sales',
      data: _g._d.devicesales.cd
    }]
  });

  $('.highcharts-credits').hide();
  $('.highcharts-legend-item').hide()
}


`<!-- <script src="https://code.highcharts.com/highcharts.js"></script> -->
  <!-- <script src="https://code.highcharts.com/modules/exporting.js"></script> -->
  <script src="https://code.highcharts.com/highcharts.js "></script>
  <script src="https://code.highcharts.com/highcharts-more.js "></script>
  <script src="https://code.highcharts.com/modules/exporting.js "></script>`
