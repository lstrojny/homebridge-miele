import Chalk from 'chalk'
let Accessory, Service, Characteristic, UUIDGen

const PLUGIN_NAME = 'homebridge-miele'
const PLATFORM_NAME = 'Miele'

export default function(homebridge) {
    Accessory = homebridge.platformAccessory

    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    UUIDGen = homebridge.hap.uuid

    homebridge.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, MielePlatform, true)
}

class Logger {
    constructor(log, prefixes = []) {
        this._log = log
        this._prefixes = prefixes
    }

    invocation(cls, method, args) {
        const symbol = `${cls.constructor.name}.${method}()`
        this.log(`${Chalk.red(symbol)} invoked with ` + JSON.stringify(Array.from(args)))
    }

    log(message) {
        this._log(`[${Chalk.blue(this._prefixes.join(' '))}] ${message}`)
    }
}

class WashingMachine {
    constructor(accessory, log) {
        this.logger = new Logger(log, [accessory.UUID, accessory.displayName])
        this.logger.invocation(this, 'constructor', arguments)

        this.accessory = accessory
        this.accessory.on('identify', this.identify.bind(this))

        /**
         * https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
         *
         * Required characteristics:
         *  - Characteristic.Active
         *  - Characteristic.InUse
         *  - Characteristic.ValveType
         *
         * Optional:
         *  - Characteristic.SetDuration
         *  - Characteristic.RemainingDuration
         *  - Characteristic.IsConfigured
         *  - Characteristic.ServiceLabelIndex
         *  - Characteristic.StatusFault
         *  - Characteristic.Name
         */
        this.valve =
            this.accessory.getService(Service.Valve) || this.accessory.addService(Service.Valve, 'Washing machine')

        this.valve
            .getCharacteristic(Characteristic.Active)
            .on('get', this.getActiveCharacteristic.bind(this))
            .on('set', this.setActiveCharacteristic.bind(this))
        this.valve.setCharacteristic(Characteristic.Active, Characteristic.Active.INACTIVE)

        this.information =
            this.accessory.getService(Service.AccessoryInformation) ||
            this.accessory.addService(Service.AccessoryInformation, 'Washing machine')
        this.information.setCharacteristic(Characteristic.Manufacturer, 'Miele')
        this.information.setCharacteristic(Characteristic.Model, 'Washing machine')
    }

    identify(next) {
        this.logger.invocation(this, 'identify', arguments)
        next()
    }

    getActiveCharacteristic(next) {
        this.logger.invocation(this, 'getActiveCharacteristic', arguments)
        next(null, Characteristic.Active.INACTIVE)
    }

    setActiveCharacteristic(state, next) {
        this.logger.invocation(this, 'setActiveCharacteristic', arguments)

        if (state === Characteristic.Active.ACTIVE) {
            this.valve.updateCharacteristic(Characteristic.Active, Characteristic.Active.ACTIVE)
            this.valve.updateCharacteristic(Characteristic.InUse, Characteristic.InUse.IN_USE)
            this.valve.updateCharacteristic(Characteristic.RemainingDuration, 100)
        } else {
            this.valve.updateCharacteristic(Characteristic.Active, Characteristic.Active.INACTIVE)
            this.valve.updateCharacteristic(Characteristic.InUse, Characteristic.InUse.NOT_IN_USE)
            this.valve.updateCharacteristic(Characteristic.RemainingDuration, 0)
        }

        next()
    }
}

class MielePlatform {
    constructor(log, config, api) {
        this.accessories = []
        this.log = log
        this.logger = new Logger(this.log)
        this.config = config
        this.api = api

        this.api.on('didFinishLaunching', this.finishLaunch.bind(this))
    }

    finishLaunch() {
        this.logger.invocation(this, 'finishLaunch', arguments)

        if (this.accessories.length === 0) {
            this.addAccessory('Test Washing Machine')
        }
    }

    configureAccessory(accessory) {
        this.logger.invocation(this, 'configureAccessory', arguments)

        this.accessories.push(new WashingMachine(accessory, this.log))
    }

    updateAccessoriesReachability() {}

    addAccessory(accessoryName) {
        this.logger.invocation(this, 'addAccessory', arguments)

        const accessory = new Accessory(accessoryName, UUIDGen.generate(accessoryName))
        this.accessories.push(new WashingMachine(accessory, this.log))
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
    }

    onIdentify(accessoryName, callback) {
        this.logger.invocation(this, 'onIdentify', arguments)

        callback()
    }
}
