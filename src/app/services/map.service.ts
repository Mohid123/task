import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiResponse } from '../models/repsonse.model';
import { MapModel } from '../models/map.model';

type map = MapModel

@Injectable({
  providedIn: 'root'
})
export class MapService extends BaseApiService<map> {

constructor(protected override http: HttpClient) {
  super(http)
}

getAllGraves(): Observable<ApiResponse<map>> {
  return this.get(`/friedhof`);
}

getAllGravesById(friedhofId: string): Observable<ApiResponse<map>> {
  return this.get(`/grab?friedhofId=${friedhofId}`);
}

getAllGravePlots(friedhofId: string): Observable<ApiResponse<map>> {
  return this.get(`/grabstelle?friedhofId=${friedhofId}`)
}

getUnmarkedGrave(): Observable<ApiResponse<map>> {
  return this.get(`/grabstelle/unverknuepft`);
}

}
