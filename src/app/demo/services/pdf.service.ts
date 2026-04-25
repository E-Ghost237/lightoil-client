import { Injectable } from '@angular/core';
import * as Utility from '../../../../src/app/demo/utilities/utility';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private pdfMake: any;

  constructor() {}

  /**
   * Dynamically loads pdfMake only when needed.
   */
  private async loadPdfMake() {
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFonts = await import('pdfmake/build/vfs_fonts');

      pdfMakeModule.default.vfs = pdfFonts.vfs;
      this.pdfMake = pdfMakeModule.default;
    }
  }

  /**
   * Return the gas station object that corresponds to the service_station_id
   * in the user_details object.
   * @param user_details The user details object.
   * @returns The gas station object.
   */
  getTheCorrectGasStationData(user_details: any) {
    for (const gas_station of user_details["service_stations"]) {
      if (gas_station.id == user_details.service_station_id) {
        return gas_station;
      }
    }
  }

  //generate zone reconciliation pdf OK
  async generateReconciliationsPdf(usefullData:any, action = 'open') {
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionReconciliations(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionReconciliations(usefullData:any){

    let today = new Date();
    let listOutputs = usefullData.data['allTankByDay'];
    let station = usefullData.station;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name+" "+station.city+" "+station.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Liste des reconciliations de: '+usefullData.user_details.company.name+" "+station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service ",
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 8,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: "Du "+Utility.toLocalDate(usefullData.dateStart)+
                        " au "+Utility.toLocalDate(usefullData.dateEnd)+
                        " quart "+usefullData.quartWorking.time_start+
                        " -- "+usefullData.quartWorking.time_close,
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Produit",
                  style: "tableHeader"
                },
                {
                  text: "Type de perte",
                  style: "tableHeader"
                },
                {
                  text: "Stock initial",
                  style: "tableHeader"
                },
                {
                  text: "Dépotage",
                  style: "tableHeader"
                },
                {
                  text: "Sorties",
                  style: "tableHeader"
                },
                {
                  text: "Pertes",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableReconciliations(listOutputs)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Liste des reconciliations",
        author: "Light Group",
        subject: 'Reconciliation stock et index',
        keywords: 'Index, Pompe, LightOil',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableReconciliations(periodRecords:any[]){
    let lines:any[]=[];
    for (let i = 0; i < periodRecords.length; i++) {
      let output = periodRecords[i];
      lines.push([
        {
          rowSpan: 2,
          text: (i+1)+"",
          style: "tableLine"
        },
        {
          rowSpan: 2,
          text: "Du "+this.getToLocalDateTime(output.start)+" au "+this.getToLocalDateTime(output.end),
          style: "tableLine"
        },
        {
          rowSpan: 2,
          text: output.product.name,
          style: "tableLine"
        },
        {

          text: "Stock",
          style: "tableLine"
        },
        {
          rowSpan: 2,
          text: this.getRoundValue(output.initialStock),
          style: "tableLine"
        },
        {
          rowSpan: 2,
          text: this.getRoundValue(output.input),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(output.outputTank),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(output.lossTank),
          style: "tableLine"
        }
      ]);
      lines.push([
        "",
        "",
        "",
        {

          text: "Index",
          style: "tableLine"
        },
        "",
        "",
        {
          text: this.getRoundValue(output.outputIndices),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(output.lossIndex),
          style: "tableLine"
        }
      ]);
    }
    return lines;
  }

  //generate zone indices pdf OK
  async generatePumpIndicesPdf(usefullData:any, action = 'open') {
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionPumpIndices(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionPumpIndices(usefullData:any){

    let today = new Date();
    let listOutputs = usefullData.data;
    let station = usefullData.station;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name+" "+station.city+" "+station.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Liste des index de: '+usefullData.user_details.company.name+" "+station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service ",
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 9,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: "Du "+Utility.toLocalDate(usefullData.dateStart)+
                        " au "+Utility.toLocalDate(usefullData.dateEnd),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Pompiste",
                  style: "tableHeader"
                },
                {
                  text: "Produit",
                  style: "tableHeader"
                },
                {
                  text: "Pompe-pistolet",
                  style: "tableHeader"
                },
                {
                  text: "Quart",
                  style: "tableHeader"
                },
                {
                  text: "Index de depart",
                  style: "tableHeader"
                },
                {
                  text: "Index de fin",
                  style: "tableHeader"
                },
                {
                  text: "Difference",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableIndices(listOutputs)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Liste des index",
        author: "Light Group",
        subject: 'Index de pompe',
        keywords: 'Index, Pompe, LightOil',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableIndices(periodRecords:any[]){
    let lines:any[]=[];
    for (let i = periodRecords.length-1; i >= 0; i--) {
      let output = periodRecords[i];
      lines.push([
        {
          text: (i+1)+"",
          style: "tableLine"
        },
        {
          text: this.getToLocalDateTime(output.created_at),
          style: "tableLine"
        },
        {
          text: output.user.first_name+' '+output.user.last_name,
          style: "tableLine"
        },
        {
          text: output.gun_pump.product.name,
          style: "tableLine"
        },
        {
          text: output.gun_pump.pump.name +"--"+ output.gun_pump.name,
          style: "tableLine"
        },
        {
          text: output.quart_working.time_start +"--"+ output.quart_working.time_close,
          style: "tableLine"
        },
        {
          text: output.index_start,
          style: "tableLine"
        },
        {
          text: output.index_end,
          style: "tableLine"
        },
        {
          text: (output.index_end - output.index_start)+"",
          style: "tableLine"
        },

      ]);
    }
    return lines;
  }

  //generate zone tank pdf
  //outputs OK
  async generateTankOutputsPdf(usefullData:any, action = 'open') {
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankOutputs(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankOutputs(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listOutputs = usefullData.dataOuptuts;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);
    const timezone = this.resolvePdfTimezone(usefullData);
    const outputPeriodRecords = this.getOutputPeriodRecords(listOutputs);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Quantite de produit sortie de la cuve: '+usefullData.tank.sensor_reference+" "+
                usefullData.tank.product_service_station.product.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 7,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: this.getPeriodHeaderLabel(listOutputs, timezone),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de depart (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Quantité sortie (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de fin (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankOutup(outputPeriodRecords, timezone)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Quantité de produit sortie par cuve",
        author: "Light Group",
        subject: 'Sorties de cuve',
        keywords: 'Sorties, Cuve',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankOutup(periodRecords:any[], timezone: string){
    let lines:any[]=[];
    const rows = this.getOutputDataRows(periodRecords);
    const summary = this.getOutputSummaryRow(periodRecords);

    for (let i = 0; i < rows.length; i++) {
      const output = rows[i];
      const dateLabel = this.getRowDateLabel(output, output?.start, timezone);
      const timeRangeLabel = this.getRowTimeRangeLabel(output, output?.start, output?.end, timezone);
      const startVolume = this.getOutputVolumeDisplay(output?.firstPeriodRecord);
      const startTemperature = this.formatRoundedValue(output?.firstPeriodRecord?.liquid_temperature);
      const totalOutput = this.formatRoundedValue(output?.outputs ?? output?.output);
      const endVolume = this.getOutputVolumeDisplay(output?.lastPeriodRecord);
      const endTemperature = this.formatRoundedValue(output?.lastPeriodRecord?.liquid_temperature);

      lines.push([
        {
          text: (i+1)+"",
          style: "tableLine"
        },
        {
          text: this.composeDateAndRange(dateLabel, timeRangeLabel),
          style: "tableLine"
        },
        {
          text: startVolume,
          style: "tableLine"
        },
        {
          text: startTemperature,
          style: "tableLine"
        },
        {
          text: totalOutput,
          style: "tableLine",
          fillColor: '#87CEFA'
        },
        {
          text: endVolume,
          style: "tableLine"
        },
        {
          text: endTemperature,
          style: "tableLine"
        },

      ]);
    }

    if(summary){
      const summaryValue = this.formatRoundedValue(summary?.outputs ?? summary?.output);
      lines.push([
        {
          text: "Total sur la période",
          style: "tableLine",
          colSpan: 4,
          fillColor: '#ffffff',
        },
        "",
        "",
        "",
        {
          text: summaryValue,
          style: "tableLine",
          colSpan: 3,
          fillColor: '#87CEFA',
        },
        "",
        ""
      ]);
    }
    return lines;
  }

  //inputs OK
  async generateTankInputsPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankInputs(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankInputs(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listInputs = usefullData.dataInputs;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Dépotage de la cuve: '+usefullData.tank.sensor_reference+" "+
                usefullData.tank.product_service_station.product.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 7,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: this.getPeriodHeaderLabel(listInputs),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de depart (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Quantité depotée (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de fin (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankInput(listInputs.periodInputs)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Dépotage par cuve",
        author: "Light Group",
        subject: 'Dépotage de cuve',
        keywords: 'Dépotage, Cuve',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankInput(periodInputs:any[]){
    let lines:any[]=[];
    for (let i = 0; i < periodInputs.length; i++) {
      let income = periodInputs[i];
      if(! income?.isTheLast){
        lines.push([
          {
            text: (i+1)+"",
            style: "tableLine"
          },
          {
            text: this.composeDateAndRange(
                  this.getRowDateLabel(income, income?.takedDay),
                  this.getRowTimeRangeLabel(income, income?.takedDay, income?.endedDay)
            ),
            style: "tableLine"
          },
          {
            text: income?.start_volume ?
                  this.getRoundValue(income?.start_volume):"--",
            style: "tableLine"
          },
          {
            text: income?.start_liquid_temperature ?
                  this.getRoundValue(income?.start_liquid_temperature): "--",
            style: "tableLine"
          },
          {
            text: income?.totalInput ? this.getRoundValue(income?.totalInput): "0",
            style: "tableLine",
            fillColor: '#FF7F7F'
          },
          {
            text: income?.end_volume ?
                  this.getRoundValue(income?.end_volume) : "--",
            style: "tableLine"
          },
          {
            text: income?.end_liquid_temperature ?
                  this.getRoundValue(income?.end_liquid_temperature) : "--",
            style: "tableLine"
          },

        ]);
      }else if(income?.isTheLast){
        lines.push([
          {
            text: "Total sur la période",
            style: "tableLine",
            colSpan: 4,
            fillColor: '#ffffff',
          },
          "",
          "",
          "",
          {
            text: this.getRoundValue(income?.totalInput)+" litres",
            style: "tableLine",
            colSpan: 3,
            fillColor: '#FF7F7F',
          },
          "",
          ""
        ]);
      }

    }
    return lines;
  }

  //reports OK
  async generateTankReportsPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankReports(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankReports(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listReports = usefullData.dataReports;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Rapport de la cuve: '+usefullData.tank.sensor_reference+" "+
                usefullData.tank.product_service_station.product.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },
        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 8,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: this.getPeriodHeaderLabel(listReports),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de depart (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Quantité sortie (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Quantité depotée (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de fin (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankReport(listReports.listDayRecord)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Rapport par cuve",
        author: "Light Group",
        subject: 'Rapport de cuve',
        keywords: 'Rapport, Cuve',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankReport(listDayRecord :any[]){
    let lines:any[]=[];
    for (let i = 0; i < listDayRecord.length; i++) {
      let report = listDayRecord[i];
      if(! report?.isTheLast){
        lines.push([
          {
            text: (i+1)+"",
            style: "tableLine"
          },
          {
            text: this.composeDateAndRange(
                  this.getRowDateLabel(report, report.start),
                  this.getRowTimeRangeLabel(report, report.start, report.end)
            ),
            style: "tableLine"
          },
          {
            text: report?.firstPeriodRecord?.id ?
                  this.getRoundValue(report?.firstPeriodRecord?.volume):"--",
            style: "tableLine"
          },
          {
            text: report?.firstPeriodRecord?.id ?
                  this.getRoundValue(report?.firstPeriodRecord?.liquid_temperature): "--",
            style: "tableLine"
          },
          {
            text: report?.output ? this.getRoundValue(report?.output): "0",
            style: "tableLine",
            fillColor: '#87CEFA'
          },
          {
            text: report?.input ? this.getRoundValue(report?.input): "0",
            style: "tableLine",
            fillColor: '#FF7F7F'
          },
          {
            text: report?.lastPeriodRecord?.id ?
                  this.getRoundValue(report?.lastPeriodRecord?.volume) : "--",
            style: "tableLine"
          },
          {
            text: report?.lastPeriodRecord?.id ?
                  this.getRoundValue(report?.lastPeriodRecord?.liquid_temperature) : "--",
            style: "tableLine"
          },

        ]);
      }else if(report?.isTheLast){
        lines.push([
          {
            text: "Total sur la période",
            style: "tableLine",
            colSpan: 4,
            fillColor: '#ffffff',
          },
          "",
          "",
          "",
          {
            text: this.getRoundValue(report?.output)+" litres",
            style: "tableLine",
            colSpan: 1,
            fillColor: '#87CEFA',
          },

          {
            text: this.getRoundValue(report?.input)+" litres",
            style: "tableLine",
            colSpan: 1,
            fillColor: '#FF7F7F',
          },
          "",
          "",
        ]);
      }

    }
    return lines;
  }

  //tank records OK
  async generateTankDataPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankRecords(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankRecords(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listRecords = usefullData.listRecords;
    let period = usefullData.period;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Historique de la cuve: '+usefullData.tank.sensor_reference+" "+
                usefullData.tank.product_service_station.product.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },
        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 7,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: period,
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Relevé à",
                  style: "tableHeader"
                },
                {
                  text: "Niveau(cm)",
                  style: "tableHeader"
                },
                {
                  text: "Volume carburant à T ambiant",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T 15",
                  style: "tableHeader"
                },
                {
                  text: "Quantité sortie (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Densité",
                  style: "tableHeader"
                },

              ],
              ...this.lineTableTankRecord(listRecords)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Historique par cuve",
        author: "Light Group",
        subject: 'Historique de cuve',
        keywords: 'Historique, Cuve',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankRecord(listRecords :any[]){
    const lines:any[] = [];
    const orderedRecords = [...listRecords].reverse();

    for (let i = 0; i < orderedRecords.length; i++) {
      const record = orderedRecords[i];
      const previousRecord = orderedRecords[i - 1];
      const fuelVolume = record?.fuel_volume ?? record?.volume;
      const fuelVolumeAtFift = this.getFuelVolumeAtFift(record);
      const storedOutputVolume = this.parseMetric(record?.output_volume);
      const previousFuelVolume = this.parseMetric(previousRecord?.fuel_volume ?? previousRecord?.volume);
      const currentFuelVolume = this.parseMetric(record?.fuel_volume ?? record?.volume);

      let outputVolume = storedOutputVolume;
      if (outputVolume === null && previousFuelVolume !== null && currentFuelVolume !== null) {
        outputVolume = Math.max(previousFuelVolume - currentFuelVolume, 0);
      }

      lines.push([
        {
          text: (i + 1) + "",
          style: "tableLine"
        },
        {
          text: this.getToLocalDateTime(record.updated_at),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(record.liquid_height),
          style: "tableLine"
        },
        {
          text: this.getFuelVolumeDisplay(fuelVolume),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(fuelVolumeAtFift),
          style: "tableLine",
          fillColor: '#87CEFA'
        },
        {
          text: this.getRoundValue(outputVolume ?? 0),
          style: "tableLine",
          fillColor: '#A7CEFB'
        },
        {
          text: this.getRoundValue(record.liquid_temperature),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(record.density),
          style: "tableLine"
        },
      ]);
    }
    return lines;
  }

  //product exportation

  //outputs OK
  async generateTankProductOutputsPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankProductOutputs(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankProductOutputs(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listOutputs = usefullData.dataOuptuts;
    let period = usefullData.period;
    let stationProduct = usefullData.stationProduct;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);
    const timezone = this.resolvePdfTimezone(usefullData);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Historiques des Sorties du: '+stationProduct?.product?.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 3,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: "Recapitulatif des sorties "+this.getPeriodHeaderLabel(listOutputs, timezone),
                  alignment: 'left',
                },
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Cuve",
                  style: "tableHeader"
                },
                {
                  text: "Quantité sortie (litres)",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankProductOutup(listOutputs?.totalOnPeriod)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Quantité de produit sortie des cuves",
        author: "Light Group",
        subject: 'Sorties de produit',
        keywords: 'Sorties, produit',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankProductOutup(totalOnPeriod:any[]){
    let lines:any[]=[];
    for (let i = 0; i < totalOnPeriod.length; i++) {
      let output = totalOnPeriod[i];
      if( output?.tank != 'total'){
        const outputValue = this.formatRoundedValue(output?.outputs);
        lines.push([
          {
            text: (i+1)+"",
            style: "tableLine"
          },
          {
            text: output?.tank?.sensor_reference,
            style: "tableLine"
          },
          {
            text: outputValue,
            style: "tableLine",
            fillColor: '#87CEFA'
          }
        ]);
      }else if( output?.tank == 'total'){
        const totalValue = this.formatRoundedValue(output?.outputs);
        lines.push([
          {
            text: "Totaux",
            style: "tableLine",
            colSpan: 2,
            fillColor: '#ffffff',
          },
          "",
          {
            text: totalValue,
            style: "tableLine",
            colSpan: 1,
            fillColor: '#87CEFA',
          }
        ]);
      }

    }
    return lines;
  }

  //inputs OK
  async generateTankProductInputsPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankProductInputs(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankProductInputs(usefullData:any){

    let today = new Date();
    let listInputs = usefullData.dataInputs;
    let period = usefullData.period;
    let stationProduct = usefullData.stationProduct;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Historiques des dépotages du: '+stationProduct?.product?.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },

        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 8,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: this.getPeriodHeaderLabel(listInputs),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Cuve",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de depart (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Quantité depotée (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de fin (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankProductInput(listInputs.periodInputs)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Dépotage par produit",
        author: "Light Group",
        subject: 'Dépotage de produit',
        keywords: 'Dépotage, Produit',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankProductInput(periodInputs:any[]){
    let lines:any[]=[];
    for (let i = 0; i < periodInputs.length; i++) {
      let income = periodInputs[i];
      if(! income?.isTheLast){
        lines.push([
          {
            text: (i+1)+"",
            style: "tableLine"
          },
          {
            text: this.composeDateAndRange(
                  this.getRowDateLabel(income, income?.takedDay),
                  this.getRowTimeRangeLabel(income, income?.takedDay, income?.endedDay)
            ),
            style: "tableLine"
          },
          {
            text: income?.tank?.sensor_reference,
            style: "tableLine"
          },
          {
            text: income?.start_volume ?
                  this.getRoundValue(income?.start_volume):"--",
            style: "tableLine"
          },
          {
            text: income?.start_liquid_temperature ?
                  this.getRoundValue(income?.start_liquid_temperature): "--",
            style: "tableLine"
          },
          {
            text: income?.totalInput ? this.getRoundValue(income?.totalInput): "0",
            style: "tableLine",
            fillColor: '#FF7F7F'
          },
          {
            text: income?.end_volume ?
                  this.getRoundValue(income?.end_volume) : "--",
            style: "tableLine"
          },
          {
            text: income?.end_liquid_temperature ?
                  this.getRoundValue(income?.end_liquid_temperature) : "--",
            style: "tableLine"
          },

        ]);
      }else if(income?.isTheLast){
        lines.push([
          {
            text: "Total sur la période",
            style: "tableLine",
            colSpan: 5,
            fillColor: '#ffffff',
          },
          "",
          "",
          "",
          "",
          {
            text: this.getRoundValue(income?.totalInput)+" litres",
            style: "tableLine",
            colSpan: 3,
            fillColor: '#FF7F7F',
          },
          "",
          ""
        ]);
      }

    }
    return lines;
  }


  //reports OK
  async generateTankProductReportsPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankProductReports(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankProductReports(usefullData:any){

    let today = new Date();
    let listReports = usefullData.dataReports;
    let period = usefullData.period;
    let stationProduct = usefullData.stationProduct;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: "Rapport des données du "+stationProduct?.product?.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },
        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 8,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: this.getPeriodHeaderLabel(listReports),
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Date",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de depart (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Quantité sortie (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Quantité depotée (litres)",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T de fin (litres)",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                }
              ],
              ...this.lineTableTankProductReport(listReports.listDayRecord)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },
      ],
      info: {
        title: "Rapport par produit",
        author: "Light Group",
        subject: 'Rapport de produit',
        keywords: 'Rapport, Produit',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },
    };
  }

  // OK
  lineTableTankProductReport(listDayRecord:any[]){
    let lines:any[]=[];
    for (let i = 0; i < listDayRecord.length; i++) {
      let report = listDayRecord[i];
      if(! report?.isTheLast){
        lines.push([
          {
            text: (i+1)+"",
            style: "tableLine"
          },
          {
            text: this.composeDateAndRange(
                  this.getRowDateLabel(report, report.start),
                  this.getRowTimeRangeLabel(report, report.start, report.end)
            ),
            style: "tableLine"
          },
          {
            text: report?.firstPeriodRecord?.id ?
                  this.getRoundValue(report?.firstPeriodRecord?.volume):"--",
            style: "tableLine"
          },
          {
            text: report?.firstPeriodRecord?.id ?
                  this.getRoundValue(report?.firstPeriodRecord?.liquid_temperature): "--",
            style: "tableLine"
          },
          {
            text: report?.output ? this.getRoundValue(report?.output): "0",
            style: "tableLine",
            fillColor: '#87CEFA'
          },
          {
            text: report?.input ? this.getRoundValue(report?.input): "0",
            style: "tableLine",
            fillColor: '#FF7F7F'
          },
          {
            text: report?.lastPeriodRecord?.id ?
                  this.getRoundValue(report?.lastPeriodRecord?.volume) : "--",
            style: "tableLine"
          },
          {
            text: report?.lastPeriodRecord?.id ?
                  this.getRoundValue(report?.lastPeriodRecord?.liquid_temperature) : "--",
            style: "tableLine"
          },

        ]);
      }else if(report?.isTheLast){
        lines.push([
          {
            text: "Total sur la période",
            style: "tableLine",
            colSpan: 4,
            fillColor: '#ffffff',
          },
          "",
          "",
          "",
          {
            text: this.getRoundValue(report?.output)+" litres",
            style: "tableLine",
            colSpan: 1,
            fillColor: '#87CEFA',
          },

          {
            text: this.getRoundValue(report?.input)+" litres",
            style: "tableLine",
            colSpan: 1,
            fillColor: '#FF7F7F',
          },
          "",
          "",
        ]);
      }

    }
    return lines;
  }

  // tank OK
  async generateTankProductPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionTankProductRecords(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionTankProductRecords(usefullData:any){
    //("date: ", Date.now().toLocaleString());

    let today = new Date();
    let listRecords = usefullData.listRecords;
    let period = usefullData.period;
    let stationProduct = usefullData.stationProduct;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: 'Historiques des données du: '+stationProduct?.product?.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },
        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 7,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: period,
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Relevé à",
                  style: "tableHeader"
                },
                {
                  text: "Cuve",
                  style: "tableHeader"
                },
                {
                  text: "Niveau(cm)",
                  style: "tableHeader"
                },
                {
                  text: "Volume carburant à T ambiant",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T 15",
                  style: "tableHeader"
                },
                {
                  text: "T(C) liquide",
                  style: "tableHeader"
                },
                {
                  text: "Densité",
                  style: "tableHeader"
                },

              ],
              ...this.lineTableTankProductRecord(listRecords)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Historique par produit",
        author: "Light Group",
        subject: 'Historique de produit',
        keywords: 'Historique, produit',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableTankProductRecord(listRecords:any){
    let lines:any[]=[];
    for (let i = (listRecords.length-1); i >= 0; i--) {
      let record = listRecords[i];
      const fuelVolume = record?.fuel_volume ?? record?.volume;
      const fuelVolumeAtFift = this.getFuelVolumeAtFift(record);
      lines.push([
        {
          text: (listRecords.length-i)+"",
          style: "tableLine"
        },
        {
          text: this.getToLocalDateTime(record.updated_at),
          style: "tableLine"
        },
        {
          text: record.tank.sensor_reference,
          style: "tableLine"
        },
        {
          text: this.getRoundValue(record.liquid_height),
          style: "tableLine"
        },
        {
          text: this.getFuelVolumeDisplay(fuelVolume),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(fuelVolumeAtFift),
          style: "tableLine",
          fillColor: '#87CEFA'
        },
        {
          text: this.getRoundValue(record.liquid_temperature),
          style: "tableLine"
        },
        {
          text: this.getRoundValue(record.density),
          style: "tableLine"
        },
      ]);
    }
    return lines;
  }

  //notification OK
  async generateProductNotificationPdf(usefullData:any, action = 'open'){
    await this.loadPdfMake();
    const documentDefinition = this.getDocumentDefinitionProductNotification(usefullData);

    switch (action) {
      case 'open': this.pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': this.pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': this.pdfMake.createPdf(documentDefinition).download(); break;

      default: this.pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // OK
  getDocumentDefinitionProductNotification(usefullData:any){

    let today = new Date();
    let listNotifications = usefullData.listNotifications;
    let period = usefullData.period;
    let stationProduct = usefullData.stationProduct;
    let service_station = this.getTheCorrectGasStationData(usefullData.user_details);

    return {
      header: [
        {
          columns:[
            {
              width: '25%',
              text: usefullData.user_details.company.name,
              alignment: 'center',
              fontSize: 8,
              margin: [0, 10, 0, 10]
            },
            {
              width: '75%',
              text: Utility.toLocalDateTime(today),
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 10]
            }
          ],
          columnGap: 10
        },
      ],

      footer: function(currentPage, pageCount) {
        return [
          {
            text: currentPage.toString() + ' sur ' + pageCount,
            bold: true,
            fontSize: 8,
            alignment: 'center',
          }
        ] ;
      },

      content: [
        {
          columns:[
            {
              width: '50%',
              text: "Historiques des notifications du "+stationProduct?.product?.name,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 0, 10]
            },
            {
              width: '50%',
              text: service_station.name+"  Station service: "+
                    service_station.city,
              bold: true,
              fontSize: 10,
              alignment: 'center',
              margin: [0, 10, 10, 10]
            }
          ],

        },
        {
          style: 'tableExample',
          headerRows: 2,
          keepWithHeaderRows: 2,
          dontBreakRows: true,
          table: {
            body: [
              [
                {
                  //rowSpan: 3,
                  style:"tableHeader",
                  colSpan: 7,
                  border: [false, true, false, true],
                  fillColor: '#ffffff',
                  text: period,
                  alignment: 'left',
                },
                "",
                "",
                "",
                "",
                "",
                ""
              ],
              [
                {
                  text: "#",
                  style: "tableHeader"
                },
                {
                  text: "Relevé à",
                  style: "tableHeader"
                },
                {
                  text: "Cuve",
                  style: "tableHeader"
                },
                {
                  text: "Type",
                  style: "tableHeader"
                },
                {
                  text: "Pourcentage",
                  style: "tableHeader"
                },
                {
                  text: "Volume à T ambiant",
                  style: "tableHeader"
                },
                {
                  text: "Jours",
                  style: "tableHeader"
                }

              ],
              ...this.lineTableProductNotification(listNotifications)
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },

      ],
      info: {
        title: "Historique des alertes",
        author: "Light Group",
        subject: 'Historique des alertes',
        keywords: 'Historique, alertes',
      },
      styles: {

        name: {
          fontSize: 16,
          bold: true
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },

        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableExample: {
          margin: [5, 5, 5, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          margin:[5, 0, 5, 0]
        },
        tableLine: {
          bold: false,
          fontSize: 8,
          color: 'black',
          alignment: 'center',
          margin:[5, 0, 5, 0],
          border: [false, true, false, true]
        }
      },

    };
  }

  // OK
  lineTableProductNotification(listNotifications:any[]){
    let lines:any[]=[];
    for (let i = (listNotifications.length-1); i >= 0; i--) {
      let noti = listNotifications[i];
      lines.push([
        {
          text: (listNotifications.length-i)+"",
          style: "tableLine"
        },
        {
          text: this.getToLocalDateTime(noti?.updated_at),
          style: "tableLine"
        },
        {
          text: noti?.tank?.sensor_reference,
          style: "tableLine"
        },
        {
          text: noti?.type_notification?.wording,
          style: "tableLine"
        },
        {
          text: this.getRoundValue(noti.percent)+"%",
          style: "tableLine"
        },
        {
          text: this.getRoundValue(noti.volume),
          style: "tableLine",
          fillColor: '#87CEFA'
        },
        {
          text: this.getRoundValue(noti.remaining_day),
          style: "tableLine"
        }
      ]);
    }
    return lines;
  }


  //utilities
  getToLocalDateTime(date1:string){
    return Utility.toLocalDateTime(date1)??"";
  }

  getToLocalDate(date1:string){
    return Utility.toLocalDate(date1)??"";
  }

  getToLocalTime(date1:string){
      return Utility.toLocalTime(date1)??"";
  }

  private parseMetric(value: any): number | null {
      if (value === null || value === undefined || value === '') {
          return null;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
  }

  private isValidTimezone(timezone: string): boolean {
      try {
          Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
          return true;
      } catch {
          return false;
      }
  }

  private resolvePdfTimezone(usefullData: any): string {
      const fallback = 'Africa/Douala';
      const station = this.getTheCorrectGasStationData(usefullData?.user_details) ?? null;
      const candidates = [
          usefullData?.timezone,
          usefullData?.user_details?.timezone,
          usefullData?.user_details?.time_zone,
          station?.timezone,
          station?.time_zone
      ];

      for (const candidate of candidates) {
          if (typeof candidate !== 'string') {
              continue;
          }

          const timezone = candidate.trim();
          if (!timezone) {
              continue;
          }

          if (this.isValidTimezone(timezone)) {
              return timezone;
          }
      }

      return fallback;
  }

  private getPeriodHeaderLabel(periodData: any, timezone: string = 'Africa/Douala'): string {
      const explicit = typeof periodData?.periodLabel === 'string' ? periodData.periodLabel.trim() : '';
      if (explicit) {
          return Utility.normalizeDateTokens(explicit);
      }

      const startDate = this.formatDateWithTimezone(periodData?.dateStart, timezone);
      const endDate = this.formatDateWithTimezone(periodData?.dateEnd, timezone);
      const startTime = this.formatTimeWithTimezone(periodData?.dateStart, timezone);
      const endTime = this.formatTimeWithTimezone(periodData?.dateEnd, timezone);

      return `Du ${startDate} au ${endDate} entre ${startTime} et ${endTime}`;
  }

  private getRowDateLabel(row: any, fallbackDateValue: any, timezone: string = 'Africa/Douala'): string {
      const explicit = typeof row?.dateLabel === 'string' ? row.dateLabel.trim() : '';
      if (explicit) {
          return this.formatDateWithTimezone(explicit, timezone);
      }

      return this.formatDateWithTimezone(fallbackDateValue, timezone);
  }

  private getRowTimeRangeLabel(row: any, fallbackStart: any, fallbackEnd: any, timezone: string = 'Africa/Douala'): string {
      const explicit = typeof row?.timeRangeLabel === 'string' ? row.timeRangeLabel.trim() : '';
      if (explicit) {
          return Utility.normalizeDateTokens(explicit);
      }

      return this.formatOutputPeriodRange(fallbackStart, fallbackEnd, timezone);
  }

  private formatDateWithTimezone(value: any, timezone: string): string {
      void timezone;
      if (value === null || value === undefined || value === '') {
          return '-';
      }

      return Utility.toLocalDate(String(value)) || '-';
  }

  private formatTimeWithTimezone(value: any, timezone: string): string {
      void timezone;
      if (value === null || value === undefined || value === '') {
          return '-';
      }

      return Utility.toLocalTime(String(value)) || '-';
  }

  private formatDateTimeWithTimezone(value: any, timezone: string): string {
      void timezone;
      if (value === null || value === undefined || value === '') {
          return '-';
      }

      return Utility.toLocalDateTime(String(value)) || '-';
  }

  private formatRoundedValue(value: any): string {
      const parsed = this.parseMetric(value);
      return parsed === null ? '-' : `${this.getRoundValue(parsed)}`;
  }

  private formatOutputPeriodRange(start: any, end: any, timezone: string): string {
      const startTime = this.formatTimeWithTimezone(start, timezone);
      const endTime = this.formatTimeWithTimezone(end, timezone);

      if (startTime === '-' || endTime === '-') {
          return '-';
      }

      return `de ${startTime} à ${endTime}`;
  }

  private composeDateAndRange(dateLabel: string, rangeLabel: string): string {
      if (dateLabel === '-' && rangeLabel === '-') {
          return '-';
      }

      return `${dateLabel}\n${rangeLabel}`;
  }

  private getOutputPeriodRecords(listOutputs: any): any[] {
      if (Array.isArray(listOutputs?.listDayRecord)) {
          return listOutputs.listDayRecord;
      }

      if (Array.isArray(listOutputs?.periodRecord)) {
          return listOutputs.periodRecord;
      }

      return [];
  }

  private getOutputSummaryRow(periodRecords: any[] = []): any | null {
      return periodRecords.find((record: any) => record?.isTheLast) ?? null;
  }

  private getOutputDataRows(periodRecords: any[] = []): any[] {
      return periodRecords.filter((record: any) => !record?.isTheLast);
  }

  private getOutputVolumeDisplay(record: any): string {
      if (!record) {
          return '-';
      }

      return this.formatRoundedValue(this.getFuelVolumeAtFift(record));
  }

  private getFuelVolumeAtFift(record: any): number {
      const normalizedVolumeAtFift = this.parseMetric(record?.fuel_volume_at_fift);
      if (normalizedVolumeAtFift !== null) {
          return normalizedVolumeAtFift;
      }

      const legacyVolumeAtFift = this.parseMetric(record?.volume_at_fift);
      return legacyVolumeAtFift ?? 0;
  }

  private getFuelVolumeDisplay(value: any): string {
      const parsed = this.parseMetric(value);
      return parsed === null ? '---' : parsed.toFixed(5);
  }

  getRoundValue(num:number){
      return Math.round(num*100)/100;
  }


}
