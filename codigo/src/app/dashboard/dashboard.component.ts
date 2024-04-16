import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';

import {
  IMqttMessage,
  IMqttServiceOptions,
  MqttService,
  IPublishOptions,
} from 'ngx-mqtt';
import { IClientSubscribeOptions } from 'mqtt-browser';
import { Subscription } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private _mqttService: MqttService) {
    this.client = this._mqttService;
    this.opcion = 0;
  }

  opcion : number = 0;

  startAnimationForLineChart(chart){
      let seq: any, delays: any, durations: any;
      seq = 0;
      delays = 80;
      durations = 500;

      chart.on('draw', function(data) {
        if(data.type === 'line' || data.type === 'area') {
          data.element.animate({
            d: {
              begin: 600,
              dur: 700,
              from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
              to: data.path.clone().stringify(),
              easing: Chartist.Svg.Easing.easeOutQuint
            }
          });
        } else if(data.type === 'point') {
              seq++;
              data.element.animate({
                opacity: {
                  begin: seq * delays,
                  dur: durations,
                  from: 0,
                  to: 1,
                  easing: 'ease'
                }
              });
          }
      });

      seq = 0;
  };
  startAnimationForBarChart(chart){
      let seq2: any, delays2: any, durations2: any;

      seq2 = 0;
      delays2 = 80;
      durations2 = 500;
      chart.on('draw', function(data) {
        if(data.type === 'bar'){
            seq2++;
            data.element.animate({
              opacity: {
                begin: seq2 * delays2,
                dur: durations2,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
      });

      seq2 = 0;
  };
  ngOnInit() {
      /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

      const dataDailySalesChart: any = {
          labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          series: [
              [12, 17, 7, 17, 23, 18, 38]
          ]
      };

     const optionsDailySalesChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
      }

      var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

      this.startAnimationForLineChart(dailySalesChart);


      /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

      const dataCompletedTasksChart: any = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
              [230, 750, 450, 300, 280, 240, 200, 190]
          ]
      };

     const optionsCompletedTasksChart: any = {
          lineSmooth: Chartist.Interpolation.cardinal({
              tension: 0
          }),
          low: 0,
          high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0}
      }

      var completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

      // start animation for the Completed Tasks Chart - Line Chart
      this.startAnimationForLineChart(completedTasksChart);



      /* ----------==========     Emails Subscription Chart initialization    ==========---------- */

      var datawebsiteViewsChart = {
        labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        series: [
          [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]

        ]
      };
      var optionswebsiteViewsChart = {
          axisX: {
              showGrid: false
          },
          low: 0,
          high: 1000,
          chartPadding: { top: 0, right: 5, bottom: 0, left: 0}
      };
      var responsiveOptions: any[] = [
        ['screen and (max-width: 640px)', {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function (value) {
              return value[0];
            }
          }
        }]
      ];
      var websiteViewsChart = new Chartist.Bar('#websiteViewsChart', datawebsiteViewsChart, optionswebsiteViewsChart, responsiveOptions);

      //start animation for the Emails Subscription Chart
      this.startAnimationForBarChart(websiteViewsChart);
  }

  private curSubscription: Subscription | undefined;

  connection = {
    // Broker
    hostname: '3.138.175.17',
    port: 9001,
    path: '/mqtt',
    clean: true,
    connectTimeout: 4000,
    //reconnectPeriod: 1000*60*60,  // 1 hora
    reconnectPeriod: 4000, 
    // Credenciales de conexion
    clientId: 'a134664acfe1409ebcd9f1f43a0c8122',
    username: 'usermqttserver',
    password: 'mqttg2',
    protocol: 'ws',
  }

  TOPIC_TEMPERATURA = "temperatura";
  TOPIC_LUZ = "luz";
  TOPIC_CO2 = "co2";
  TOPIC_HUMEDAD = "humedad";
  TOPIC_DISTANCIA = "distancia";
  TOPIC_MOTOR = "motor";
  TOPIC_ALL = "allSensors";
  TOPIC_EEP = "memoria";

  QOS = 0;

  publish = {
    topic: '',
    qos: 0,
    payload: '',
  };

  datos = {
    tem : '',
    hum : '',
    co2 : '',
    luz : '',
    dis : '',
    desc_luz : ''   
  }

  datos_save = {
    tem : '',
    hum : '',
    co2 : '',
    luz : '',
    dis : '',
    desc_luz : ''   
  }

  client: MqttService | undefined;
  isConnection = false;
  subscribeSuccess = false;

  sensorTemperatura = 0;

  // Crear Conexion con el Broker 
  createConnection() {
    
    try {
      this.client?.connect(this.connection as IMqttServiceOptions)
    } catch (error) {
      console.log('mqtt.connect error', error);
    }

    this.client?.onConnect.subscribe(() => {
      this.isConnection = true
      console.log('¡La conexión se realizó correctamente!');
    });

    this.client?.onError.subscribe((error: any) => {
      this.isConnection = false
      console.log('La conexión falló', error);
    });

    this.client?.onMessage.subscribe((packet: any) => {
      console.log(`Mensaje recibido ${packet.payload.toString()} del topic ${packet.topic}`)

      /*if (packet.topic == this.TOPIC_TEMPERATURA){
        this.sensorTemperatura = packet.payload.toString()
      }
      if (packet.topic == this.TOPIC_ALL){
        this.sensorTemperatura = packet.payload.toString()
      }*/
    })
  }

  // Suscribirse a un Topic
  doSubscribe(topico:string) {

    let topic = topico;
    let qos = this.QOS;
      
    console.log("this.subscription", topic)

    this.curSubscription = this.client?.observe(topic, { qos } as IClientSubscribeOptions).subscribe((message: IMqttMessage) => {
      this.subscribeSuccess = true
      console.log('Suscripcion al Topic - Respuesta:', message.payload.toString());
      if(topic === this.TOPIC_ALL && this.opcion == 0){
        let valores = message.payload.toString().split(',');
        if(valores.length > 4){
          this.datos.tem = valores[0];
          this.datos.hum = valores[1];
          this.datos.co2 = valores[2];
          this.datos.luz = valores[3];
          this.datos.dis = valores[4];
          if(parseInt(this.datos.luz) > 900)
            this.datos.desc_luz = 'Luz Baja'
          if(parseInt(this.datos.luz) < 100)
            this.datos.desc_luz = 'Luz Alta'

        }
        //console.log(this.datos);
      }else{ 
        if(topic === this.TOPIC_EEP && this.opcion == 6){
          let valores = message.payload.toString().split(',');
          if(valores.length > 4){
            this.datos_save.tem = valores[0];
            this.datos_save.hum = valores[1];
            this.datos_save.co2 = valores[2];
            this.datos_save.luz = valores[3];
            this.datos_save.dis = valores[4];

            this.showNotification('top','center');
            this.opcion = 0;
          }
        }
        
        if(topic === this.TOPIC_TEMPERATURA && this.opcion == 1){
          this.limpiarDatos();
          this.datos.tem = message.payload.toString();
        }
        if(topic === this.TOPIC_HUMEDAD && this.opcion == 2){
          this.limpiarDatos();
          this.datos.hum = message.payload.toString();
        }
        if(topic === this.TOPIC_CO2 && this.opcion == 3){
          this.limpiarDatos();
          this.datos.co2 = message.payload.toString();
        }
        if(topic === this.TOPIC_LUZ && this.opcion == 4){
          this.limpiarDatos();
          this.datos.luz = message.payload.toString();
        }
        if(topic === this.TOPIC_DISTANCIA && this.opcion == 5){
          this.limpiarDatos();
          this.datos.dis = message.payload.toString();
        }
      }
    })
  }

  // Desuscribirse de un Topic
  doUnSubscribe() {
    this.curSubscription?.unsubscribe()
    this.subscribeSuccess = false
  }

  // Publicar un Topic
  doPublish(topico: string, action: string) {
    console.log("action", action)
    this.publish.payload = action;
    this.publish.topic = topico;
    this.publish.qos = this.QOS;

    const { topic, qos, payload } = this.publish
    console.log(this.publish)

    this.client?.unsafePublish(topic, payload, { qos } as IPublishOptions)
  }

  // Terminar Conexion con el Broker 
  destroyConnection() {
    try {
      this.client?.disconnect(true)
      this.isConnection = false
      console.log('¡Desconectado exitosamente!')
    } catch (error: any) {
      console.log('Falló la desconexión', error.toString())
    }
  }

  dataSensores(topico:string){
    let sensor = '';
    if(topico == this.TOPIC_TEMPERATURA){  sensor = 'Temp'; this.opcion = 1 }
    if(topico == this.TOPIC_HUMEDAD){ sensor = 'Hum'; this.opcion = 2}
    if(topico == this.TOPIC_CO2){ sensor = 'CO2';  this.opcion = 3}
    if(topico == this.TOPIC_LUZ){ sensor = 'Luz';  this.opcion = 4}
    if(topico == this.TOPIC_DISTANCIA){ sensor = 'Dist';  this.opcion = 5}
    if(topico == this.TOPIC_ALL){  this.opcion = 0; }

    this.curSubscription?.unsubscribe()
    this.subscribeSuccess = false

    
      this.doPublish(topico,sensor);
      this.doSubscribe(topico);

  }

  limpiarDatos(){
    this.datos.co2 = '';
    this.datos.dis = '';
    this.datos.hum = '';
    this.datos.luz = '';
    this.datos.tem = '';
  }


  showNotification(from, align){


    const type = ['','info','success','warning','danger'];

    const color = 1;

    if(this.datos_save.tem != '' && this.datos_save.hum!= '' && this.datos_save.co2 !=''){ 

    $.notify({
        icon: "notifications",
        message: "<h3>DATA EEPROM - Datos almacenados.</h3><br>"+
                 "<h3> Temperatura: "+this.datos_save.tem+" Grados C </h3><br>"+
                 "<h3>Humedad: "+this.datos_save.hum+" % </h3><br>"+
                 "<h3>CO2: "+this.datos_save.co2+" ppm </h3><br>"+
                 "<h3>Luz: "+this.datos_save.luz+" </h3><br>"+
                 "<h3>Distancia: "+this.datos_save.dis+" cm </h3><br>"

    },{
        type: type[color],
        timer: 4000,
        placement: {
            from: from,
            align: align
        },
        template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">save</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });

  }
}

showSaveData(from, align){


  const type = ['','info','success','warning','danger'];

  const color = 2;

  if(this.datos_save.tem != '' && this.datos_save.hum!= '' && this.datos_save.co2 !=''){ 

  $.notify({
      icon: "notifications",
      message: "<h3>DATA EEPROM - Datos almacenados.</h3><br>"
  },{
      type: type[color],
      timer: 4000,
      placement: {
          from: from,
          align: align
      },
      template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
        '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
        '<i class="material-icons" data-notify="icon">save</i> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
      '</div>'
  });

}
}

verDatosMemoria(){

  this.doPublish('memoria','READ'); 

  this.doSubscribe('memoria');

  this.opcion = 6;
}

}
