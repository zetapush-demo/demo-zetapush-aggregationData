import { NgZone } from '@angular/core';
import { Api, ZetaPushClient, createApi } from 'zetapush-angular';
import { Observable } from 'rxjs/Observable';


export class DataApi extends Api {
    onShowTemperature: Observable<number>;
    onPushData: Observable<any>;


  showTemperature(parameters: { value: number }): Promise<number> {
    return this.$publish('showTemperature', parameters);
  }

  pushData( value: number ): Promise<any> {
    return this.$publish('pushData', { value });
  }

}

export function DataApiFactory(client: ZetaPushClient, zone: NgZone): DataApi {
  return createApi(client, zone, DataApi) as DataApi;
}

export const DataApiProvider = {
  provide: DataApi, useFactory: DataApiFactory, deps: [ ZetaPushClient, NgZone ]
};