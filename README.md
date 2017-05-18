This tutorial show how to create a data aggregation service with ZetaPush.

**aggregationData** : Web application to simulate sensor and to show output data aggregation service
**com.zetapush.tuto.data** : Server side for the aggregation data service


# Data aggregation with ZetaPush #

### Introduction ###

ZetaPush is a Realtime Baas (Backend As A Service) providing the server infrastructure when you develop your connected applications. We manage the server side and you are dealing with your mobile, web, server applications and your connected objects.

To illustrate the implementation of a real use case, we will create a web application based on *Angular 2* to show an average temperature every minute. The data are provided by a simulated sensor on the same web application.

##### Prerequisite #####

In this tutorial, we will need to use *Eclipse* and *Angular*. If necessary, install them.

* **Eclipse** : [Download](https://www.eclipse.org/downloads/)
* **Angular** : `npm install -g @angular/cli`  

### Development environment installation ###

As I said previously, we will use the ZetaPush platform for our server side. This concerns an utilization of a data aggregator service. For this, we will develop many *macroscripts* in *zms* ( language of the ZetaPush platform ) via an Eclipse plug-in. 

You need to begin with a *sandbox* on the ZetaPush platform : [Quickstart](https://doc.zetapush.com/quickstart/).


### ZetaPush side ###

##### Instructions #####

At this point, you need to have a *sandbox* installed on the ZetaPush platform. Now we will create two macroscripts :

*   A callback on the data aggregator service
*   Send a new value from simulated sensor

##### Create the recipe #####

In the first instance, we create a recipe in Eclipse like this :
`File -> New -> ZMS Recipe`

Type a name and add your *sandboxId* as below then click on *Finish* :

![CreateRecipeData](https://lh3.googleusercontent.com/-p30tqTbOuHY/WRwXUbsrfqI/AAAAAAAAADA/0gH7W3KCAysf365KBrPTyYGA0Hv_unaugCLcB/s0/Capture+du+2017-05-17+11-25-21.png "CreateRecipeData")

A new project is created with the following elements :

* `src` directory with an example file `welcome.zms`
* `init.zms` file that serves to init services once deployed
* `README.md` file
* `recipe.zms` file that allow to create services you need
* `zms.properties` to manage global properties of the project
* `zms.user.properties` to manage user's properties

We begin to add a data aggregator service. For this we modify `recipe.zms` like this :

##### **recipe.zms** #####


	recipe com.zetapush.tuto.data 1.0.0;

	/** a simple authentication service */
	service auth = simple(__default);

	/** our code is run by this service */
	service code = macro(__default) for 'src';

	/** Data aggregation service */
	service data = aggreg(__default);


Then, we need to create an user that will be used to call macroscripts from the JavaScript SDK.

##### **init.zms** #####

	auth.memauth_createUser({
	login:'user',
	password:'password',
	email:'user@zetapush.com'
	});

	data.aggreg_create({
		'type': AggregationItemType_MEAN,
		'periods': [1],
		'category': 'temperature',
		'deploymentId': code,
		'verb': Verb_macro_func,
		'parameter': {
			'name': #showTemperature,
			'parameters': {
				'value': AggregationCallbackField_value
			}
		},
		'loud': true
		});

The data aggregator service recovers the data and handles them. Then, on each period, the *showTemperature* macroscript is called to create a new average temperature.


Now we create the macroscripts. We create a `.zms` file in our `src` directory : `Right-click on this directory -> new -> File`. We create *pushData.zms* and *showTemperature.zms*

##### **pushData.zms** #####

	/**
		Called by the client to add a new temperature (simulate a sensor)
	*/
	macroscript pushData(number value) {
		
		data.push({items : [{'value': value, 'name': 'sensorTemperature', 'category': 'temperature'}]});
		
	} return { value } on channel __selfName


##### **showTemperature.zms** #####

	/**
		Callback of aggregation service to send the new average to the client
	*/
	macroscript showTemperature(number value) {
		
	} broadcast ( __userKey ) { value } on channel __selfName

To deploy, we need to configure `zms.user.properties`. We need to type the sandbox id, active the upload and type our credentials as below :


##### **zms.properties** #####

	# the ID of your sandbox (create a sandbox on admin.zpush.io)
	zms.businessId=<sandboxId>
	# by default, upload is disabled.
	# It is recommended not to change the value here, 
	# but rather in your overrides file, zms.user.properties
	zms.upload.enabled=true
	
	# Some properties to be used by this recipe. Name them as you want
	com.zetapush.tuto.webRTC.test.user.email=<email>
	
	# These two properties will be read by the eclipse plugin to automatically connect to a 
	# zetapush server when your run/debug a macro from this recipe.
	zms.test.login=user
	zms.test.password=password

##### **zms.user.properties** #####

	# the ID of your own sandbox
	zms.businessId=<sandboxId>
	# your developer login (the one YOU use on the web site http://admin.zpush.io)
	zms.username=<email>
	# your developer password
	zms.password=<password>
	# change that to true to start uploading code to your sandbox
	zms.upload.enabled=true


We deploy our code by launching the red rocket.

Afterwards, the server part being complete, we will create the web application. If you get deployment errors, check your credentials.


### JavaScript client ###

With this client, we simulate a temperature sensor and we list the average of the values each minute.

We begin to create an *Angular 2* project :

    $ ng new realtimeData


##### Management of dependencies#####

We need to add the ZetaPush dependencies :

	$ npm install zetapush-js --save 
	$ npm install zetapush-angular --save

The ZetaPush packages use *Angular 4*, so we need to update Angular.

	npm install @angular/{common,compiler,compiler-cli,core,forms,http,platform-browser,platform-browser-dynamic,platform-server,router,animations}@latest typescript@latest --save

We import this packages in our application :


##### **app.module.ts** #####
	
	import { AppComponent } from './app.component';
	import { ZetaPushClientConfig, ZetaPushModule } from 'zetapush-angular';
	
	@NgModule({
	  declarations: [
	    AppComponent
	  ],
	  imports: [
	    ..
	    ZetaPushModule
	  ],
	  providers: [
	    { provide: ZetaPushClientConfig, useValue: { sandboxId: '<sandboxId>' } },
	  ],
	  bootstrap: [AppComponent]
	})
	export class AppModule { }


##### Create an user interface #####

We create a basic page to send a new temperature value and show the averages each minute.

##### **src/app/app.component.html** #####
	
	
	<h1> Send value</h1>

	<input [(ngModel)]="valueTyped" placeholder="valueTyped">
	<button (click)="sendValue()">Send value</button> <span>{{info}}</span>

	<h1> Values :</h1>

	<li *ngFor="let value of values">
			<span> {{value}} °C</span>
	</li>


##### Add the ZetaPush API #####

To call our macroscripts, we need to configure the ZetaPush API.

We create `src/app/data-api.ts` and add it :

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
	
The *onShowTemperature* method is called when a new average is available and *pushData* allows us to send a new simulated value.

We import this API as provider in our application :

    import { DataApiProvider } from './data-api';
	
	@NgModule({
	  providers: [
	    DataApiProvider,
	  ],
	  bootstrap: [AppComponent]
	})
	export class AppModule { }

Finally, we need to create the main component :


##### **src/app/app.component.ts** #####

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
		info = "";

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
				this.info = "Value is sent";
				setTimeout(() => {
					this.info = "";
				}, 2000);
			}
		}
	}

We have a table of data (*values*) which contains the averages sent by the data aggregator. *valueTyped* is the value typed by the user to simulate the sensor.
Now we just need to launch the application with `$ ng serve` and our tutorial is running !
To see the result, you go to `localhost:4200` and you can send one or more values every minute and see the result.


### Conclusion ###

This is a very basic use case with the data aggregator service. Of course, we can configure our aggregator in *Eclipse* to make average on several periods. For example, we can imagine that the aggregator make an average every minute and a global average every day. For this, we modify the *periods* parameter of the data aggregator service like this : `[1, 1440]`.

##### Source code #####

The source code of this tutorial is available on GitGub : [zetapush-demo/demo-zetapush-aggregationData](https://github.com/zetapush-demo/demo-zetapush-aggregationData)

