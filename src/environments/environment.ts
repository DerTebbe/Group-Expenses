// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCNxHhetvYwMqLgT9vGqK0v2RZBluN0_ks',
    authDomain: 'group-expenses-8c46e.firebaseapp.com',
    databaseURL: 'https://group-expenses-8c46e.firebaseio.com',
    projectId: 'group-expenses-8c46e',
    storageBucket: 'group-expenses-8c46e.appspot.com',
    messagingSenderId: '445638191744',
    appId: '1:445638191744:web:ba6af51435e498c3'
  },
  mapbox: {
    accessToken: 'pk.eyJ1IjoibWdsZDM1IiwiYSI6ImNqeXNjcG1rNTBqMDAzYnF5NDB4MTl4NDgifQ.HnWy-Gnh_1ZCmkxCH48UYA'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
