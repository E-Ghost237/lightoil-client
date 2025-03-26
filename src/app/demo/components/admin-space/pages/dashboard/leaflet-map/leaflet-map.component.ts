import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import LayersOptions = L.Control.LayersOptions;
import { CommonService } from '../../../services/common-services.service';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent implements OnChanges {
  @Input() sale_point_type!: string;
  @Input() stock_of_products!: any;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map!: L.Map;
  product_stock_date!: string;
  stock_per_tank_of_sale_points: any[] = [];
  stock_per_product_of_sale_points: any[] = [];
  layers: L.Layer[] = [];
  isFullScreen: boolean = false;
  company_id!: number;

  constructor(private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stock_of_products']) {
      this.updateStockData();
      this.initMapAndaddMarkers();
    }
  }

  // Options to bind to Leaflet Directive
  options = {
    center: L.latLng({ lat: 7.369722, lng: 12.354722 }),  // Center of Africa, Cameroon
    zoom: 6,
    layers: [ L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 18, attribution: 'by Light Group', subdomains: ['mt0', 'mt1', 'mt2', 'mt3']}) ]
  };

  // Base Layers to bind to Leaflet Directive
  baseLayers = {
    'Google Street': L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 18,
      attribution: 'by Light Group', subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }),
    'Open Street Map': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {  maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | by Light Group'
    }),
    'Stadia AlidadeSmoothDark': L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { maxZoom: 18,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/"'
        + ' target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | by Light Group'
    })
  };

  // Define position of Layer Controle
  layersControlOptions: LayersOptions = { position: 'bottomleft' };

  private initMapAndaddMarkers(): void {
    if (this.stock_per_tank_of_sale_points.length > 0) {
      // if (this.map) {
      //   this.layers.forEach(layer => this.map.removeLayer(layer));
      // }
      this.layers = [];

      for (const sale_point of this.stock_per_tank_of_sale_points) {
        let popup_content = '<span class="text-lg"><strong>' + sale_point.name + ', ' + sale_point.town + '</strong></span><br> <br>';
        let marker = L.marker([sale_point.latitude, sale_point.longitude], { 
          icon: L.icon({ iconUrl: 'assets/img/markers/geo-station-pin-black.svg', iconSize: [38, 95], iconAnchor: [18, 64], popupAnchor: [-0.3, -27]}), 
          title: sale_point.name + ' ' + sale_point.town, riseOnHover: true 
        });

        if (sale_point.tanks.length > 0) {
          for (const tank of sale_point.tanks) {
            // Add popoup content
            popup_content = popup_content + this.getPopupContent(tank.reference, tank.product);

            // Change marker's appearance
            marker.setIcon(this.changeMarkerAppearance(marker, tank.depotage_in_progress, tank.product.percentage));
          }
        }

        marker.bindPopup(popup_content);
        this.markerBehavior(marker, sale_point.id);
        this.layers.push(marker);
      }
    }
  }

  // red: #dc3545; orange: #fd7e14; yellow: #ffc107;
  private changeMarkerAppearance(marker: L.Marker, refueling: boolean, fuel_percentage: number): L.Icon {
    this.animateMarker(marker, 1);                  // Add animation to the marker

    if (refueling) {
      this.animateRipple(marker, '#ffc107');        // Add ripple animation
      return L.icon({ iconUrl: 'assets/img/markers/geo-station-pin-yellow.svg',
        iconSize: [38, 95], iconAnchor: [18, 64], popupAnchor: [-0.3, -27]
      });
    }

    if (fuel_percentage <= 20) {
      this.animateRipple(marker, '#ffc107');        // Add ripple animation
      return L.icon({ iconUrl: 'assets/img/markers/geo-station-pin-red.svg',
        iconSize: [38, 95], iconAnchor: [18, 64], popupAnchor: [-0.3, -27]
      });
    }
    else if (fuel_percentage > 20 && fuel_percentage <= 45) {
      this.animateRipple(marker, '#ffc107');        // Add ripple animation
      return L.icon({ iconUrl: 'assets/img/markers/geo-station-pin-orange.svg',
        iconSize: [38, 95], iconAnchor: [18, 64], popupAnchor: [-0.3, -27]
      });
    }
    else {
      return L.icon({ iconUrl: 'assets/img/markers/geo-station-pin-blue.svg',
        iconSize: [38, 95], iconAnchor: [18, 64], popupAnchor: [-0.3, -27]
      });
    }
  }

  // Ripple animation
  animateRipple(marker: L.Marker, color: string) {
    let ripple = L.circleMarker(marker.getLatLng(), 
      { color: color, opacity: 0.16, weight: 0.16, fillColor: color, fillOpacity: 0.16, radius: 10 }
    );

    ripple.bringToBack();
    ripple.bringToBack();
    this.layers.push(ripple);

    let radius = 10;
    let maxRadius = 40;

    setInterval(() => {
      radius += 10;
      if (radius > maxRadius) { radius = 10; }
      ripple.setRadius(radius);
    }, 100);
  }

  // Marker animation
  animateMarker(marker: L.Marker, opacity: number) {
    setInterval(() => {
      if (opacity == 1) {
        opacity = 0;
        marker.setOpacity(opacity);
      } else if (opacity == 0) {
        opacity = 1;
        marker.setOpacity(opacity);
      }
    }, 600);
  }
  
  private markerBehavior(marker: L.Marker, point_of_sale_id: number) {
    // Open Popup on mouse over
    marker.on('mouseover', function () { this.openPopup(); });

    // Close Popup on mouse out
    marker.on('mouseout', function () { this.closePopup(); });

    // Redirect to point of sale on double-click
    marker.on('dblclick', function () {
      let user_details = JSON.parse(localStorage.getItem('user_details'));
      user_details.service_station_id = point_of_sale_id;
      localStorage.setItem('user_details', JSON.stringify(user_details));

      // Navigate to point of sale dashboard
      // window.location.href = '/pages/dashboard';
      window.open('/pages/dashboard', '_blank');
    });
  }

  private getPopupContent(tank_ref: string, fuel: any): string {
    let popup_content: string = '';
    if (fuel.measured_at !== null && fuel.measured_at !== '') {
      if (new Date(fuel.measured_at).toString() !== 'Invalid Date') {
        fuel.measured_at = this.commonService.formatDateToMeduimFR(fuel.measured_at);
      }
    }
    
    if (fuel.percentage <= 0 || fuel.percentage == undefined) {
      popup_content = popup_content
        + '<strong>' + tank_ref + ' -- ' + fuel.name + ' :  ' + '</strong>  données du <strong>' + fuel.measured_at + '</strong><ul>'
        + '<li>Niveau : <span class="text-700 text-black-600 font-bold">...</span> cm</li>'
        + '<li>Volume : <span class="text-700 text-black-600 font-bold">...</span> L</li>'
        + '<li>Pourcentage : <span class="text-700 text-black-600 font-bold">...</span> %</li></ul>';
    } else {
      if (fuel.percentage > 0 && fuel.percentage <= 20) {
        popup_content = popup_content
          + '<strong>' + tank_ref + ' -- ' + fuel.name + ' :  ' + '</strong>  données du <strong>' + fuel.measured_at + '</strong><ul>'
          + '<li>Niveau : <span class="text-700 text-red-600 font-bold">' + fuel.level + '</span> cm</li>'
          + '<li>Volume : <span class="text-700 text-red-600 font-bold">' + fuel.volume + '</span> L</li>'
          + '<li>Pourcentage : <span class="text-700 text-red-600 font-bold">' + fuel.percentage + '</span> %</li></ul>';
      } else if (fuel.percentage > 20 && fuel.percentage <= 45) {
        popup_content = popup_content
          + '<strong>' + tank_ref + ' -- ' + fuel.name + ' :  ' + '</strong>  données du <strong>' + fuel.measured_at + '</strong><ul>'
          + '<li>Niveau : <span class="text-700 text-orange-400 font-bold">' + fuel.level + '</span> cm</li>'
          + '<li>Volume : <span class="text-700 text-orange-400 font-bold">' + fuel.volume + '</span> L</li>'
          + '<li>Pourcentage : <span class="text-700 text-orange-400 font-bold">' + fuel.percentage + '</span> %</li></ul>';
      } else {
        popup_content = popup_content
          + '<strong>' + tank_ref + ' -- ' + fuel.name + ' :  ' + '</strong>  données du <strong>' + fuel.measured_at + '</strong><ul>'
          + '<li>Niveau : <span class="text-700 text-blue-600 font-bold">' + fuel.level + '</span> cm</li>'
          + '<li>Volume : <span class="text-700 text-blue-600 font-bold">' + fuel.volume + '</span> L</li>'
          + '<li>Pourcentage : <span class="text-700 text-blue-600 font-bold">' + fuel.percentage + '</span> %</li></ul>';
      }
    }

    return popup_content;
  }

  toggleFullScreen(): void {
    const mapEl = this.mapContainer.nativeElement;
    if (!document.fullscreenElement) {
      mapEl.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
    // setTimeout(() => this.map.invalidateSize(), 300);
  }

  private updateStockData(): void {
    if (this.stock_of_products?.date) {
      const date = new Date(this.stock_of_products.date);
      const current_date = new Date();
      if (date.getDate() == current_date.getDate()) {
        this.stock_of_products.date = current_date;
        this.product_stock_date = this.commonService.formatDateToMeduimFR(date);
      } else {
        this.product_stock_date = this.commonService.formatDateToMeduimDateFR(date);
      }
    }

    this.stock_per_tank_of_sale_points = this.stock_of_products?.stock_per_tank_of_sale_points || [];
    this.stock_per_product_of_sale_points = this.stock_of_products?.stock_per_product_of_sale_points || [];

    for (const sale_point of this.stock_per_product_of_sale_points) {
      if (sale_point.products.length > 0) {
        for (const product of sale_point.products) {
          if (product.measured_at !== null && product.measured_at !== '') {
            if (new Date(product.measured_at).toString() !== 'Invalid Date') {
              product.measured_at = this.commonService.formatDateToMeduimFR(product.measured_at);
            }
          }
        }
      }
    }
  }

  getProductColor(fuel_name: string): string {
    switch (fuel_name.toLowerCase()) {
      case 'super': return '#014da4';
      case 'gasoil': return '#fdc401';
      case 'pétrole':
      case 'petrole': return '#007138';
      default: return 'inherit';
    }
  }
}
