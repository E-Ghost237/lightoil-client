// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  pusher: {
    key: "b24aa1aa6d69044fe88f",
    cluster: "eu",
  },
  
  apiUrl: "http://localhost:8000/api/",
  apiAuthUrl : "http://localhost:8000/api/",
  authUrl: "http://localhost:4200/auth/login",

  
  oauth: "http://localhost:8000/oauth/token",
  client_id: "9ff1d596-7f13-4075-84f8-ab0080700642",
  client_secret: "SbttAGexm7zHjO2sZilBShRuF1ODxYgLJRZUtqcc",
  redirect_uri_path: "http://localhost:4200/auth/login",
  admin_view: "http://localhost:4202/",
  light_oil:  "http://localhost:4200/",
  super_admin_view: "http://localhost:4203/"
};

/*
 * For easier debugging in development mode, you can import the following file i am
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
    //...pusher.service.ts

