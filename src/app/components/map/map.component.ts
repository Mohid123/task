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
  destroy$ = new Subject();

  constructor(private elementRef: ElementRef, private mapService: MapService) {

  }

  ngOnInit(): void {
    this.getSingleGrave('440d1500-d5d5-4bf9-bf06-7725cf17170f');
    setTimeout(() => {
      this.geojsonObject = this.singleGrave
      console.log(this.geojsonObject)
    }, 5000)
  }

  ngAfterViewInit() {
    // this.getSingleGrave('440d1500-d5d5-4bf9-bf06-7725cf17170f');


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
  }, 5000)



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

  getGravePlot(id: string) {
    this.mapService.getAllGravePlots(id).pipe(takeUntil(this.destroy$)).subscribe((res:ApiResponse<MapModel>) => {
      this.gravePlot = res.data;
    })
  }

  getUnmarked() {
    this.mapService.getUnmarkedGrave().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<MapModel>) => {
      this.unMarked = res.data;
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
