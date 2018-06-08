var db = require("../server/db")();
var excelJs = require("exceljs");
var fs = require("fs");
var path = require('path');

module.exports = () => {

  var coverHeader = {
    line1: {
      text: "State of Illinois - Department of Innovation & Technology (DoIT)",
      underline: true,
      bold: true,
      italic: true
    },
    line2: {
      text: "Wireless Equipment Order Form",
      underline: false,
      bold: false,
      italic: true
    }
  };

  var baseCover = `[
    [
      "DOIT REQUEST #:", "", "", "", "{{DOIT REQUEST #}}", "", "", "", "SHIPPING ADDRESS"
    ],
    [
      "DATE:", "", "", "", "{{DATE}}", "", "", "ADDRESS:", "", "", "{{ADDRESS}}"
    ],
    [
      "DOIT CONTACT:", "", "", "", "{{DOIT CONTACT}}", "", "", "SUITE/ROOM:", "", "", "{{SUITE/ROOM}}"
    ],
    [
      "CONTACT PHONE:", "", "", "", "{{CONTACT PHONE}}", "", "", "CIY, STATE, ZIP:", "", "", "{{CIY, STATE, ZIP}}"
    ],
    [
      "AGENCY:", "", "", "", "{{AGENCY}}", "", "", "ATTN.:", "", "", "{{ATTN.}}"
    ],
    [
      "COST CENTER:", "", "", "", "{{COST CENTER}}", "", "", "CONTACT PHONE:", "", "", "{{CONTACT PHONE}}"
    ],
    [
      "REQUESTOR:", "", "", "", "{{REQUESTOR}}"
    ],
    [
      "PHONE:", "", "", "", "{{PHONE}}"
    ],
    [
      "AGENCY CONTROL:", "", "", "", "{{AGENCY CONTROL}}"
    ],
    [
      "SR QTY:", "", "", "", "{{SR QTY}}"
    ],
    [
      "NEW LINE ACTIVATION:", "", "", "", "{{NEW LINE ACTIVATION}}"
    ],
    [
      "UPGRADE:", "", "", "", "{{UPGRADE}}"
    ],
    [
      "WARRANTY CLNR:", "", "", "", "{{WARRANTY CLNR}}"
    ],
    [
      "AREA CODE REQUESTED:","","","{{AREA CODE REQUESTED}}"
    ],
    [
      "MTN:","","","{{MTN}}"
    ]
  ]`;

  var detailPageHeaders = ["SR #", "MTN", "ACTION", "USER NAME", "DESCRIPTION", "CODE", "RECURRING COST", "NON-RECURRING COST"];
  var detailPageSubHeaders = ["#", "Existing 'Inventory #' or 'NEW'", "", "price plan, features, device, accessory", "", "feature or plan cost", "equipment or accessory cost"];

  function get(req, res) {
    var r = req.query;
    if (r.request_no) {
      var options = db.getQueryObj({
        db: "it-api",
        mongoUrl: "mongodb://Justinkdeveloper:SilverBells2017$$@itasandbox-shard-00-00-51evd.mongodb.net:27017/",
        collection: "converted_fileobject",
        q: {
          "contents": new RegExp([r.request_no].join(""), "i")
        },
        p: {
          "contents": 1
        }
      });

      db.findOne(options, function (r1) {
        if (r1) {
          try {
            var c = JSON.parse(r1.contents)[0];
            var fileoptions = initliazeFile();

            var workbook = new excelJs.stream.xlsx.WorkbookWriter(fileoptions);
            var sheetCover = workbook.addWorksheet("Cover");
            var sheetDetail = workbook.addWorksheet("Detail");

            var cover = prepareCover(c, res);
            // set headers for cover 
            sheetCover.addRow([coverHeader.line1.text]);
            sheetCover.addRow([coverHeader.line2.text]);
            sheetCover.addRow(['']);
            sheetCover.addRow(['']);
            cover.forEach(function (element) {
              sheetCover.addRow(element);
            });

            var rows = sheetCover.lastRow.number;
            for (var i = 1; i <= rows; i++) {
              var row = sheetCover.getRow(i);
              row.border = {
                top: {
                  style: 'thick ',
                  color: {
                    argb: 'FF000000 '
                  }
                },
                left: {
                  style: 'thick ',
                  color: {
                    argb: 'FF000000 '
                  }
                },
                bottom: {
                  style: 'thick ',
                  color: {
                    argb: 'FF000000 '
                  }
                },
                right: {
                  style: 'thick ',
                  color: {
                    argb: 'FF000000 '
                  }
                }
              };
              //}
              // for (var j = 1; j <= row.cellCount; j++) {
              //   if (j == 1) {
              //     var col = sheetCover.getCell(_getCell(i, j));
              //   }

              //   sheetCover.getCell(_getCell(i, j)).border = {
              //     top: {
              //       style: 'thick ',
              //       color: {
              //         argb: 'FF000000 '
              //       }
              //     },
              //     left: {
              //       style: 'thick ',
              //       color: {
              //         argb: 'FF000000 '
              //       }
              //     },
              //     bottom: {
              //       style: 'thick ',
              //       color: {
              //         argb: 'FF000000 '
              //       }
              //     },
              //     right: {
              //       style: 'thick ',
              //       color: {
              //         argb: 'FF000000 '
              //       }
              //     }
              //   };
              // }
              row.commit();
              console.log(row);
            }
            // first row detail sheet
            sheetDetail.addRow(["REQUEST #:", c.request_no]).commit();
            // two blank lines
            sheetDetail.addRow(['']).commit();
            sheetDetail.addRow(['']).commit();

            // adding headers
            sheetDetail.addRow(detailPageHeaders).commit();

            // adding sub headers
            sheetDetail.addRow(detailPageSubHeaders).commit();

            // add data to this sheet
            var data = [];
            if (c.orders == undefined)
              c.orders = [];
            c.orders.forEach(function (element, index) {
              var username = element.user_name;
              var inventory = element.inventory_no || '';
              var no = element.sr_no.split('-').length > 1 ? element.sr_no.split('-')[1] : index + 1;
              element.line_items.forEach(function (el) {
                var a = [];
                a.push(no);
                a.push(inventory);
                a.push(el.Action);
                a.push(username);
                a.push(el.Description);
                a.push(el.Description.includes('-') ? el.Description.split('-')[el.Description.split('-').length - 1].trim() : '');
                a.push(el['Rc Amt']);
                a.push(el['NRC Amt']);
                data.push(a);
              })
            });

            data.forEach(function (el) {
              sheetDetail.addRow(el).commit();
            })
            // mark ready to file

            workbook.commit()
              .then(function () {
                res.download(path.resolve(__dirname, '.' + fileoptions.filename));
                setTimeout(function () {
                  fs.unlink(path.resolve(__dirname, '.' + fileoptions.filename));
                }, 10 * 1000);
              })
          } catch (err) {
            console.log(err);
            console.log('err handled');
            res.send('Incomplete Order! Unable to write file');
          }
        } else {
          res.json({
            err: "Request Number Not Found"
          })
        }
      })
    } else {
      res.json({
        err: "Request Number Required"
      });
    }
  }

  function initliazeFile() {
    var excelPath = "./_temp/";
    var excelFile = "data" + new Date().getTime().toString().substr(5, 5) + ".xlsx";
    if (!fs.existsSync(excelPath)) {
      fs.mkdirSync(excelPath);
    }
    return {
      filename: excelPath + excelFile
    };
  }

  function prepareCover(d, res) {
    var cover = baseCover;
    cover = cover.replace("{{DOIT REQUEST #}}", d.request_no);
    cover = cover.replace("{{DATE}}", d.requested_due || "");
    cover = cover.replace("{{DOIT CONTACT}}", "");
    cover = cover.replace("{{CONTACT PHONE}}", "");
    cover = cover.replace("{{AGENCY}}", d.agency || "");
    cover = cover.replace("{{COST CENTER}}", d.cost_center || "");
    cover = cover.replace("{{REQUESTOR}}", d.requestor | "");
    cover = cover.replace("{{PHONE}}", d.phone || "");
    cover = cover.replace("{{AGENCY CONTROL}}", d.agency_control || "");
    cover = cover.replace("{{SR QTY}}", _getCoverSub(d).sr);
    cover = cover.replace("{{NEW LINE ACTIVATION}}", _getCoverSub(d).newA);
    cover = cover.replace("{{UPGRADE}}", _getCoverSub(d).upgrade);
    cover = cover.replace("{{WARRANTY CLNR}}", "");
    cover = cover.replace("{{ADDRESS}}", "");
    cover = cover.replace("{{SUITE/ROOM}}", "");
    cover = cover.replace("{{CIY, STATE, ZIP}}", "");
    cover = cover.replace("{{ATTN.}}", "");
    cover = cover.replace("{{CONTACT PHONE}}", "");
    cover = cover.replace("{{AREA CODE REQUESTED}}", "");
    cover = cover.replace("{{MTN}}", "");

    try {
      cover = JSON.parse(cover);
      return cover;
    } catch (e) {
      res.json({
        err: "Unable to write file :-("
      });
    }
  }

  function _getCoverSub(d) {
    var sr = 0;
    var newA = 0;
    var upgrade = 0;
    try {
      d.orders.forEach(function (el) {
        el.line_items.forEach(function (el1) {
          sr = sr + (1 * el1['NRC Qty'] + 1 * el1['RC Qty']);
          if (el1.Action == 'Add') {
            newA = newA + (1 * el1['NRC Qty'] + 1 * el1['RC Qty']);
          }

          if (el1.Action == 'Upgrades') {
            upgrade = upgrade + (1 * el1['NRC Qty'] + 1 * el1['RC Qty'])
          }
        })
      });
    } catch (err) {
      console.log('Unable to Write Report');
    }

    return {
      sr: sr,
      newA: newA,
      upgrade: upgrade
    }
  }

  function _getCell(i, j) {
    j = j.toString();
    var a = {
      "1": "A",
      "2": "B",
      "3": "C",
      "4": "D",
      "5": "E",
      "6": "F",
      "7": "G",
      "8": "H",
      "9": "I",
      "10": "J",
      "11": "K",
      "12": "L"
    }
    return a[j] + i;
  }

  return {
    get: get
  }
}
