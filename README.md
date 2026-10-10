# Bike-Computer-App

Mobile App for the Bike Computer Project Senior Design @ UTK

## Build the App

Note: Use XCode for IOS and EAS Build for Android
Once in the BikeComputerApp run

```
```

npx expo run:ios

**NOTE:**
It might make you install the simulator for IOS

## Shared Dev Environment

This project uses a Makefile as a facade to mask lengthly
CLI commands. Common commands will be covered here. Refer
to the Makefile for additional commands.

- Build Docker container

``` bash
make docker-build
```

- Run docker container
  - This will drop you into the container at a bash prompt
    you should be in /workspace
  - All file interactions will also take effect outside the container
    in the repo.

```
``` bash
make docker-run
```

