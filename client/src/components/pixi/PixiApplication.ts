import { Application, type IApplicationOptions } from 'pixi.js'

export class PixiApplication {
    private app: Application;

    constructor(appOptions?: IApplicationOptions) {
        this.app = new Application(appOptions)
    }

    get application() {
        return this.app
    }
}
