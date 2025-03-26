// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  pusher: {
    key: "b24aa1aa6d69044fe88f",
    cluster: "eu",
  },
  
  apiUrl: "http://localhost:8001/api/",
  apiAuthUrl : "http://localhost:8001/api/",
  authUrl: "http://localhost:4201/auth/login",

  
  oauth: "http://localhost:8000/oauth/token",
  client_id: "9deb2f64-c310-4f43-9dcb-2c99213800dd",
  client_secret: "xqNbktj94DlMTtswPOI00PmkB3qy6Rv9XNfgkGpI",
  redirect_uri_path: "http://localhost:4201/auth/login",
  admin_view: "http://localhost:4202/",
  light_oil:  "http://localhost:4201/",
  super_admin_view: "http://localhost:4203/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
    //...pusher.service.ts

