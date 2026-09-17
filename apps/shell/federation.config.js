import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'shell',

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  additionalShared: [
    ['@spartan-ng/brain', { singleton: true, strictVersion: true }], // Ensure single runtime instances
    ['@angular/cdk', { singleton: true, strictVersion: true }],
    ['@angular/core', { singleton: true, eager: false, requiredVersion: false }],
    ['@angular/platform-browser', { singleton: true, eager: false, requiredVersion: false }],
    ['@angular/common', { singleton: true, eager: false, requiredVersion: false }],
    ['@angular/common/http', { singleton: true, eager: false, requiredVersion: false }],
    ['@angular/router', { singleton: true, eager: false, requiredVersion: false }],
    ['@angular/core/rxjs-interop', { singleton: true, eager: false, requiredVersion: false }],
    // ['@auth0/auth0-angular', { singleton: true, eager: false, requiredVersion: false }],
    ['rxjs', { singleton: true, eager: false, requiredVersion: false }],
    ['rxjs/operators', { singleton: true, eager: false, requiredVersion: false }],
  ],

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    ignoreUnusedDeps: true,
  },
});
