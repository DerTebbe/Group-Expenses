import {Component, OnInit, ViewChild} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {MapService} from "../../services/map.service";
import {environment} from "../../../environments/environment";
import {AlertController} from "@ionic/angular";
@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
map: mapboxgl.Map;
style ='mapbox://styles/mapbox/outdorrs-v10';
lat= 73;
lng= 100;


source:any;
markers: any;


  constructor(private mapsservice: MapService, private alert: AlertController) {
    mapboxgl.accessToken = environment.mapbox.accessToken
  }

  /**
   * Alert - Userinfo
   */
 async infoAlert(){
    const alert = await this.alert.create({

      message: 'Hier entsteht gerade eine Funktionalität für Sie!',
    });
    await alert.present();
  }


  /**
   * init Mapbox
   * @accessToken personal AcessToken
   */
  buildMap(){
  /*this.map = new mapboxgl.Map({
    accessToken: 'pk.eyJ1IjoibWdsZDM1IiwiYSI6ImNqeXNjcG1rNTBqMDAzYnF5NDB4MTl4NDgifQ.HnWy-Gnh_1ZCmkxCH48UYA',
    container: 'map',
    style: this.style,
    zoom: 13,
    center: [this.lng, this. lat]

  });*/
  mapboxgl.accessToken = 'pk.eyJ1IjoibWdsZDM1IiwiYSI6ImNqeXNjcG1rNTBqMDAzYnF5NDB4MTl4NDgifQ.HnWy-Gnh_1ZCmkxCH48UYA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
  });
}




  ngOnInit() {
// this.initMap()
    this.buildMap();
    this.infoAlert();
  }


}
