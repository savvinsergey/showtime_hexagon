import { initFederation } from '@angular-architects/native-federation';

try {
  await initFederation('federation.manifest.json');
  import('./bootstrap');
} catch (error) {
  console.error(error);
}
