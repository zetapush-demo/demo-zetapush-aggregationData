import { Component, OnInit } from '@angular/core';
import { DataApi } from './data-api';
import { ZetaPushConnection } from 'zetapush-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  values: Array<number> = [];
  valueTyped: number;

  constructor(private api: DataApi, private zpConnection: ZetaPushConnection){

    api.onShowTemperature.subscribe((msg) => {
      console.log("show temperature", msg);
      this.values.push(msg['value']);
    });

    api.onPushData.subscribe((msg) => {
      console.log("push data", msg);
    })
  }

  ngOnInit(): void {

    this.zpConnection.connect({'login':'user', 'password':'password'}).then(() => {
        console.debug("ZetaPushConnection:OK");
    })

  }

  sendValue(): void {

    if (this.valueTyped != null) {
      this.api.pushData(+this.valueTyped);
    }
  }
}
