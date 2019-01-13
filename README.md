# Homebridge plugin for Miele appliances

This plugin will support Miele appliances. Doesn't do anything yet.

## Development

### Start homebridge server with plugin

```
yarn add global homebridge
DEBUG=* `yarn global bin homebridge`/homebridge -D -U $PWD/dev-dot-homebridge/ -P ../homebridge-miele/
```

### Transpilation watcher

```
yarn dev
```

### Format code

```
yarn fmt
```
