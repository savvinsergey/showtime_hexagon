nx g @nx/angular:app apps/shell

# Initialize the Host app (e.g., listening on port 4200)
nx g @angular-architects/native-federation:init --project shell --port 4200 --type dynamic-host

# Initialize the Remote app (e.g., listening on port 4201)
nx g @angular-architects/native-federation:init --project mfe1 --port 4201 --type remote

sudo npx nx g nx-stylelint:configuration --project shared-styles
