import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { ZetaPushClientConfig, ZetaPushModule } from 'zetapush-angular';
import { DataApiProvider } from './data-api';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ZetaPushModule
  ],
  providers: [
    DataApiProvider,
    { provide: ZetaPushClientConfig, useValue: { sandboxId: '<sandboxId>' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
