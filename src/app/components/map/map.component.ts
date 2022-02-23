import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { MapModel } from 'src/app/models/map.model';
import { ApiResponse } from 'src/app/models/repsonse.model';
import { MapService } from 'src/app/services/map.service';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { constants } from '../../app.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  public map!: Map;
  allGraves?: Object;
  singleGrave?: Object
  gravePlot?: Object;
  unMarked?: Object;
  destroy$ = new Subject();

  constructor(private elementRef: ElementRef, private mapService: MapService) { }

  ngOnInit(): void {
    this.getGraves();
    this.getSingleGrave('440d1500-d5d5-4bf9-bf06-7725cf17170f')
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
      ],
      target: 'ol-map'
    });
}

  getGraves() {
    this.mapService.getAllGraves().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<MapModel>) => {
      this.allGraves = res;
      console.log(this.allGraves);
    })
  }

  getSingleGrave(id: string) {
    this.mapService.getAllGravesById(id).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<MapModel>) => {
      this.singleGrave = res;
      console.log(res);
    })
  }

  getGravePlot(id: string) {
    this.mapService.getAllGravePlots(id).pipe(takeUntil(this.destroy$)).subscribe((res:ApiResponse<MapModel>) => {
      this.gravePlot = res;
    })
  }

  getUnmarked() {
    this.mapService.getUnmarkedGrave().pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<MapModel>) => {
      this.unMarked = res;
      console.log(res);
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
