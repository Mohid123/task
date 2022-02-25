import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MapModel } from 'src/app/models/map.model';
import { ApiResponse } from 'src/app/models/repsonse.model';
import { MapService } from 'src/app/services/map.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Projection from 'ol/proj/Projection';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { constants } from '../../app.constants';
import { Subject, takeUntil } from 'rxjs';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import MultiPolygon from 'ol/geom/MultiPolygon';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  public map!: Map;
  allGraves?: Object;
  singleGrave?: Object;
  type?: any;
  gravePlot?: Object;
  unMarked?: Object;
  geojsonObject?: any;
  vectorSource?: any;
  expiredGrave?: any;
  expiryObject?: any;
  emptyGraves?: any;
  graveObject?: any;
  destroy$ = new Subject();

  constructor(private elementRef: ElementRef, private mapService: MapService) {

  }

  ngOnInit(): void {
  }

  async ngAfterViewInit() {
    this.getSingleGrave('440d1500-d5d5-4bf9-bf06-7725cf17170f');
    this.getGraveExpiry('440d1500-d5d5-4bf9-bf06-7725cf17170f');
    this.getGravePlot('440d1500-d5d5-4bf9-bf06-7725cf17170f');

    setTimeout(() => {
      this.geojsonObject = this.singleGrave
      console.log(this.geojsonObject)
    }, 3000)

    setTimeout(() => {
      this.expiryObject = this.expiredGrave
      console.log(this.geojsonObject)
    }, 3000)

    setTimeout(() => {
      this.graveObject = this.emptyGraves;
      console.log(this.graveObject)
    }, 3000)

    setTimeout(() => {
      const styles: any = { 'MultiPolygon': new Style({
        stroke: new Stroke({
          color: 'yellow',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 0, 0.1)',
        }),
      }),
      'Polygon': new Style({
        stroke: new Stroke({
          color: 'blue',
          lineDash: [4],
          width: 3,
        })}
      )
    }

    const secondStyles: any = {
      'MultiPolygon': new Style({
        stroke: new Stroke({
          color: 'red',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.1)',
        }),
      }),
      'Polygon': new Style({
        stroke: new Stroke({
          color: 'red',
          lineDash: [4],
          width: 3,
        })}
      )
    }

  const projection = new Projection({
    code: 'EPSG:25832',
    getPointResolution: (r) => {
      return r
    },
    units: 'm'
  })
  const styleFunction = function (feature: any) {
    return styles[feature.getGeometry().getType()];
  };
    this.vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(this.geojsonObject, { featureProjection: 'EPSG:3857' }),

    });
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: styleFunction,
    });

    this.map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 1,
        // projection: 'EPSG:25832',
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer
      ],
      target: 'ol-map'
    });
    var extent = vectorLayer.getSource().getExtent();
    this.map.getView().fit(extent);
  }, 3000)



}

  getGraves() {
    this.mapService.getAllGraves().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<MapModel>) => {
      this.allGraves = res.data;
    })
  }

  getSingleGrave(id: string) {
    this.mapService.getAllGravesById(id).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      this.singleGrave = res.data;
    })
  }

  getGraveExpiry(id: string) {
    this.mapService.getAllGravesById(id).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      res.data.features.forEach((sec: any, i: any) => {
        const date = new Date(res.data.features[i].properties.nutzungsfristende)
        const today = new Date();
        if(date > today) {
          this.expiredGrave = res.data
        }
        else {
          return;
        }
      });
    })
  }

  getGravePlot(id: string) {
    this.mapService.getAllGravePlots(id).pipe(takeUntil(this.destroy$)).subscribe((res:ApiResponse<any>) => {
      res.data.features.forEach((sec: any, i: any) => {
        const emptyGrave = res.data.features[i].properties.verstorbene;
        if(emptyGrave !== null) {
          this.emptyGraves = res.data;
        }
        else {
          return
        }
      })
    })
  }

  getUnmarked() {
    this.mapService.getUnmarkedGrave().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      this.unMarked = res.data;
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
